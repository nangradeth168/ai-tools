
import React from 'react';
import type { Language } from '../types';
import { TEXTS } from '../constants';

interface ApiKeyModalProps {
    language: Language;
    onSelectKey: () => void;
    onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ language, onSelectKey, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-700 m-4">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-900/50 mb-4">
                        <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white font-koulen">
                        {TEXTS[language].apiKeyModalTitle}
                    </h3>
                    <div className="mt-2 text-gray-400">
                        <p>{TEXTS[language].apiKeyModalDescription}</p>
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline mt-1 inline-block">
                           {TEXTS[language].apiKeyModalDescriptionLink}
                        </a>
                    </div>
                </div>
                <div className="mt-8">
                     <button
                        onClick={onSelectKey}
                        className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                     >
                        {TEXTS[language].apiKeyModalButton}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full text-center mt-2 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
