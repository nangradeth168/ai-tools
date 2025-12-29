
import React, { useState } from 'react';
import type { Language } from '../types';
import { TEXTS } from '../constants';

interface CopyButtonProps {
  language: Language;
  textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ language, textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      {copied ? TEXTS[language].copiedButton : TEXTS[language].copyButton}
    </button>
  );
};
