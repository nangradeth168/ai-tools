
import React from 'react';
import type { Language, AudioEffects } from '../types';
import { TEXTS } from '../constants';
import { EmbeddedAudioPlayer } from './EmbeddedAudioPlayer';


export const AudioResult: React.FC<{ language: Language, base64Audio: string }> = ({ language, base64Audio }) => {
    // FIX: Provide default effects for the audio player as the `effects` prop is required.
    const defaultEffects: AudioEffects = { reverb: 0, echo: 0, distortion: 0 };
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-900/50 rounded-lg">
            <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5 5 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                <h3 className="mt-4 text-xl font-medium text-white">{TEXTS[language].audioGeneratedTitle}</h3>
                <p className="mt-1 text-gray-400">{TEXTS[language].audioGeneratedDescription}</p>
            </div>
            <div className="w-full max-w-xs mt-8">
                <EmbeddedAudioPlayer language={language} base64Audio={base64Audio} effects={defaultEffects} />
            </div>
        </div>
    );
};
