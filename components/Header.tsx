
import React from 'react';
import type { Language } from '../types';
import { TEXTS } from '../constants';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'km' : 'en');
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white font-koulen tracking-wide">
                {TEXTS[language].title}
            </h1>
            <p className="text-sm text-gray-400 -mt-1">{TEXTS[language].subtitle}</p>
        </div>
        <button
          onClick={toggleLanguage}
          className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Change Language"
        >
          {language === 'en' ? 'KM' : 'EN'}
        </button>
      </div>
    </header>
  );
};
