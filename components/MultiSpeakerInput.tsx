
import React from 'react';
import type { Language, Speaker, PrebuiltVoice } from '../types';
import { TEXTS, VOICE_DESCRIPTIONS } from '../constants';

interface MultiSpeakerInputProps {
    language: Language;
    speakers: Speaker[];
    setSpeakers: React.Dispatch<React.SetStateAction<Speaker[]>>;
    disabled: boolean;
}

const voices: PrebuiltVoice[] = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

export const MultiSpeakerInput: React.FC<MultiSpeakerInputProps> = ({ language, speakers, setSpeakers, disabled }) => {
    
    const addSpeaker = () => {
        const newSpeaker: Speaker = {
            id: crypto.randomUUID(),
            name: `Speaker ${speakers.length + 1}`,
            voice: 'Kore',
            text: ''
        };
        setSpeakers([...speakers, newSpeaker]);
    };

    const removeSpeaker = (id: string) => {
        setSpeakers(speakers.filter(s => s.id !== id));
    };

    const updateSpeaker = (id: string, field: keyof Speaker, value: string) => {
        setSpeakers(speakers.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    return (
        <div className="space-y-4">
            {speakers.map((speaker) => (
                <div key={speaker.id} className="bg-gray-900 p-4 rounded-lg space-y-3 relative">
                    {speakers.length > 1 && (
                         <button 
                            type="button"
                            onClick={() => removeSpeaker(speaker.id)}
                            disabled={disabled}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors disabled:cursor-not-allowed"
                            aria-label={TEXTS[language].removeSpeakerButton}
                         >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                         </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                             <label htmlFor={`speaker-name-${speaker.id}`} className="block text-sm font-medium text-gray-400 mb-1">
                                {TEXTS[language].speakerNameLabel}
                            </label>
                            <input
                                type="text"
                                id={`speaker-name-${speaker.id}`}
                                value={speaker.name}
                                onChange={(e) => updateSpeaker(speaker.id, 'name', e.target.value)}
                                disabled={disabled}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-200 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                             <label htmlFor={`speaker-voice-${speaker.id}`} className="block text-sm font-medium text-gray-400 mb-1">
                                {TEXTS[language].voiceLabel}
                            </label>
                             <select
                                id={`speaker-voice-${speaker.id}`}
                                value={speaker.voice}
                                onChange={(e) => updateSpeaker(speaker.id, 'voice', e.target.value as PrebuiltVoice)}
                                disabled={disabled}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-200 focus:ring-1 focus:ring-indigo-500"
                            >
                                {voices.map(v => <option key={v} value={v}>{VOICE_DESCRIPTIONS[v]}</option>)}
                            </select>
                        </div>
                    </div>
                     <textarea
                        rows={3}
                        value={speaker.text}
                        onChange={(e) => updateSpeaker(speaker.id, 'text', e.target.value)}
                        placeholder={TEXTS[language].placeholderAudio}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm text-gray-200 focus:ring-1 focus:ring-indigo-500"
                        disabled={disabled}
                    />
                </div>
            ))}

            <button
                type="button"
                onClick={addSpeaker}
                disabled={disabled}
                className="w-full py-2 px-4 text-sm font-semibold rounded-md bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900 transition-colors disabled:opacity-50"
            >
                + {TEXTS[language].addSpeakerButton}
            </button>
        </div>
    );
};
