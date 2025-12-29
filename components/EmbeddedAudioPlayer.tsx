
import React, { useState, useEffect, useRef } from 'react';
import type { Language, AudioEffects } from '../types';
import { TEXTS } from '../constants';

interface EmbeddedAudioPlayerProps {
    language: Language;
    base64Audio: string;
    effects: AudioEffects;
}

// --- Audio Helper Functions ---
const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const decodeToFloat32Array = (data: Uint8Array): Float32Array => {
    const dataInt16 = new Int16Array(data.buffer);
    const float32Array = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) {
        float32Array[i] = dataInt16[i] / 32768.0;
    }
    return float32Array;
};

const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);
    return new Blob([view], { type: 'audio/wav' });
};

const makeDistortionCurve = (amount: number): Float32Array => {
    const k = amount * 100; // Scale 0-1 to 0-100
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
};

export const EmbeddedAudioPlayer: React.FC<EmbeddedAudioPlayerProps> = ({ language, base64Audio, effects }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const effectNodesRef = useRef<any>({});

    const stopPlayback = () => {
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch(e) {}
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        setIsPlaying(false);
    }

    // Prepare audio buffer on first load
    useEffect(() => {
        const prepareAudio = async () => {
            if (!base64Audio) return;
            setIsReady(false);
            stopPlayback();
            const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = context;
            try {
                const audioBytes = decode(base64Audio);
                const pcmFloat32 = decodeToFloat32Array(audioBytes);
                const buffer = context.createBuffer(1, pcmFloat32.length, 24000);
                buffer.copyToChannel(pcmFloat32, 0);
                audioBufferRef.current = buffer;
                setIsReady(true);
            } catch (error) {
                console.error("Failed to decode audio data:", error);
            }
        };
        prepareAudio();
        return () => {
            stopPlayback();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [base64Audio]);
    
    // Update effects in real-time if playing
    useEffect(() => {
        if(isPlaying && effectNodesRef.current.distortion) {
            effectNodesRef.current.distortion.curve = makeDistortionCurve(effects.distortion);
            effectNodesRef.current.distortion.wet.gain.setValueAtTime(effects.distortion, audioContextRef.current!.currentTime);
            effectNodesRef.current.distortion.dry.gain.setValueAtTime(1 - effects.distortion, audioContextRef.current!.currentTime);

            effectNodesRef.current.echo.wet.gain.setValueAtTime(effects.echo * 0.7, audioContextRef.current!.currentTime); // feedback gain
            
            effectNodesRef.current.reverb.wet.gain.setValueAtTime(effects.reverb, audioContextRef.current!.currentTime);
            effectNodesRef.current.reverb.dry.gain.setValueAtTime(1 - effects.reverb, audioContextRef.current!.currentTime);
        }
    }, [effects, isPlaying]);


    const handlePlayPause = () => {
        if (!audioContextRef.current || !audioBufferRef.current) return;
        if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();

        if (isPlaying) {
            stopPlayback();
        } else {
            const context = audioContextRef.current;
            const source = context.createBufferSource();
            source.buffer = audioBufferRef.current;
            
            // --- Create effects chain ---
            const distortion = context.createWaveShaper();
            distortion.curve = makeDistortionCurve(effects.distortion);
            const distortionWet = context.createGain();
            distortionWet.gain.value = effects.distortion;
            const distortionDry = context.createGain();
            distortionDry.gain.value = 1 - effects.distortion;
            const distortionMix = context.createGain();

            const echo = context.createDelay(0.5);
            echo.delayTime.value = 0.4;
            const echoWet = context.createGain();
            echoWet.gain.value = effects.echo * 0.7; // Feedback

            const reverbDelay1 = context.createDelay(0.15);
            const reverbDelay2 = context.createDelay(0.35);
            const reverbWet = context.createGain();
            reverbWet.gain.value = effects.reverb;
            const reverbDry = context.createGain();
            reverbDry.gain.value = 1- effects.reverb;
            const reverbMix = context.createGain();

            // Store nodes for real-time updates
            effectNodesRef.current = { distortion: { node: distortion, wet: distortionWet, dry: distortionDry }, echo: { node: echo, wet: echoWet }, reverb: { d1: reverbDelay1, d2: reverbDelay2, wet: reverbWet, dry: reverbDry } };
            
            // Connect nodes
            source.connect(distortionDry);
            source.connect(distortion);
            distortion.connect(distortionWet);
            distortionDry.connect(distortionMix);
            distortionWet.connect(distortionMix);
            
            distortionMix.connect(echo);
            distortionMix.connect(reverbDry).connect(reverbMix);
            echo.connect(echoWet);
            echoWet.connect(echo);
            
            distortionMix.connect(reverbDelay1);
            reverbDelay1.connect(reverbDelay2);
            reverbDelay2.connect(reverbWet).connect(reverbMix);

            reverbMix.connect(context.destination);

            source.onended = () => setIsPlaying(false);
            source.start();
            sourceRef.current = source;
            setIsPlaying(true);
        }
    };

    const handleDownload = async () => {
        if (!audioBufferRef.current) return;
        const buffer = audioBufferRef.current;
        const offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);

        const source = offlineContext.createBufferSource();
        source.buffer = buffer;
        
        // Re-create the same effects chain for the offline context
        const distortion = offlineContext.createWaveShaper();
        distortion.curve = makeDistortionCurve(effects.distortion);
        const distortionWet = offlineContext.createGain();
        distortionWet.gain.value = effects.distortion;
        const distortionDry = offlineContext.createGain();
        distortionDry.gain.value = 1 - effects.distortion;
        const distortionMix = offlineContext.createGain();

        const echo = offlineContext.createDelay(0.5);
        echo.delayTime.value = 0.4;
        const echoWet = offlineContext.createGain();
        echoWet.gain.value = effects.echo * 0.7;

        const reverbDelay1 = offlineContext.createDelay(0.15);
        const reverbDelay2 = offlineContext.createDelay(0.35);
        const reverbWet = offlineContext.createGain();
        reverbWet.gain.value = effects.reverb;
        const reverbDry = offlineContext.createGain();
        reverbDry.gain.value = 1- effects.reverb;
        const reverbMix = offlineContext.createGain();

        // Connect offline nodes
        source.connect(distortionDry);
        source.connect(distortion);
        distortion.connect(distortionWet);
        distortionDry.connect(distortionMix);
        distortionWet.connect(distortionMix);
        distortionMix.connect(echo);
        distortionMix.connect(reverbDry).connect(reverbMix);
        echo.connect(echoWet);
        echoWet.connect(echo);
        distortionMix.connect(reverbDelay1);
        reverbDelay1.connect(reverbDelay2);
        reverbDelay2.connect(reverbWet).connect(reverbMix);
        reverbMix.connect(offlineContext.destination);

        source.start();
        const renderedBuffer = await offlineContext.startRendering();
        
        const wavBlob = encodeWAV(renderedBuffer.getChannelData(0), renderedBuffer.sampleRate);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'samnang-ai-audio-effects.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="space-y-3">
            <button
                onClick={handlePlayPause}
                disabled={!isReady}
                className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
                {isPlaying ? TEXTS[language].playingAudioButton : TEXTS[language].playAudioButton}
            </button>
            <button
                onClick={handleDownload}
                disabled={!isReady}
                className="w-full flex justify-center items-center py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-md transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
                {TEXTS[language].downloadButton}
            </button>
        </div>
    );
};
