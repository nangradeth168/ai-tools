
import React, { useState } from 'react';
import type { Language, SongLyrics, AudioEffects } from '../types';
import { TEXTS } from '../constants';
import { CopyButton } from './CopyButton';
import { EmbeddedAudioPlayer } from './EmbeddedAudioPlayer';

interface SongwriterResultProps {
  language: Language;
  song: SongLyrics;
  onGenerateNarration: (lyrics: string) => void;
  isNarrationLoading: boolean;
  narrationAudio: string | null;
}

const EffectSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
}> = ({ label, value, onChange }) => (
    <div className="flex items-center gap-4">
        <label className="w-24 text-sm text-gray-400">{label}</label>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
    </div>
);

export const SongwriterResult: React.FC<SongwriterResultProps> = ({ language, song, onGenerateNarration, isNarrationLoading, narrationAudio }) => {
  const [effects, setEffects] = useState<AudioEffects>({ reverb: 0, echo: 0, distortion: 0 });

  const handleEffectChange = (effect: keyof AudioEffects, value: number) => {
    setEffects(prev => ({ ...prev, [effect]: value }));
  };
    
  return (
    <div className="space-y-8">
      <div className="text-center border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-white">
          {song.title || TEXTS[language].songwriterGeneratedTitle}
        </h2>
        <p className="mt-1 text-gray-400 text-sm">{TEXTS[language].songwriterGeneratedDescription}</p>
      </div>

      {/* Lyrics Section */}
      <div className="relative group">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">{TEXTS[language].lyricsSection}</h3>
        <div className="bg-gray-900/50 p-4 rounded-md">
            <pre className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {song.lyrics}
            </pre>
        </div>
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton language={language} textToCopy={song.lyrics} />
        </div>
      </div>
      
       {/* Narration & Effects Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">{TEXTS[language].narrationSection}</h3>
        <div className="bg-gray-900/30 p-4 rounded-md space-y-4">
            {!narrationAudio && !isNarrationLoading && (
                 <button
                    onClick={() => onGenerateNarration(song.lyrics)}
                    className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors duration-200"
                >
                    {TEXTS[language].generateNarrationButton}
                </button>
            )}
            {isNarrationLoading && (
                 <div className="flex items-center justify-center gap-3 text-gray-300">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{TEXTS[language].generatingNarrationButton}</span>
                </div>
            )}
            {narrationAudio && (
              <>
                <EmbeddedAudioPlayer 
                    language={language} 
                    base64Audio={narrationAudio} 
                    effects={effects}
                />
                <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h4 className="text-lg font-semibold text-center text-gray-300">{TEXTS[language].effectsSection}</h4>
                    <EffectSlider label={TEXTS[language].reverbLabel} value={effects.reverb} onChange={(v) => handleEffectChange('reverb', v)} />
                    <EffectSlider label={TEXTS[language].echoLabel} value={effects.echo} onChange={(v) => handleEffectChange('echo', v)} />
                    <EffectSlider label={TEXTS[language].distortionLabel} value={effects.distortion} onChange={(v) => handleEffectChange('distortion', v)} />
                </div>
              </>
            )}
        </div>
      </div>


      {/* Music Style Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-400">{TEXTS[language].musicStyleSection}</h3>
        <div className="bg-gray-900/30 p-4 rounded-md">
           <p className="text-gray-300">{song.styleDescription}</p>
        </div>
      </div>
    </div>
  );
};
