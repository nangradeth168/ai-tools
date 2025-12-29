
import React from 'react';
import type { Language } from '../types';
import { TEXTS } from '../constants';

interface SrtResultProps {
    language: Language;
    srtContent: string;
}

export const SrtResult: React.FC<SrtResultProps> = ({ language, srtContent }) => {
    
    const handleDownload = () => {
        const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subtitles.srt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
         <div className="flex flex-col h-full">
            <div className="text-center mb-4">
                 <h3 className="text-xl font-medium text-white">{TEXTS[language].srtGeneratedTitle}</h3>
                <p className="mt-1 text-gray-400 text-sm">{TEXTS[language].srtGeneratedDescription}</p>
            </div>
           
            <div className="flex-grow bg-gray-900 rounded-lg p-4 overflow-auto mb-4">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                    <code>
                        {srtContent}
                    </code>
                </pre>
            </div>

             <button
                onClick={handleDownload}
                className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors duration-200"
            >
                {TEXTS[language].downloadButton}
            </button>
        </div>
    );
};
