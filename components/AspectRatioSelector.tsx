
import React from 'react';
import type { Language, Tool, AspectRatio } from '../types';
import { TEXTS } from '../constants';

interface AspectRatioSelectorProps {
    language: Language;
    activeTool: Tool;
    selectedRatio: AspectRatio;
    onRatioChange: (ratio: AspectRatio) => void;
}

const allRatios: AspectRatio[] = ['16:9', '9:16', '1:1', '4:3', '3:4'];
const videoRatios: AspectRatio[] = ['16:9', '9:16'];

const RatioButton: React.FC<{
    ratio: AspectRatio;
    isSelected: boolean;
    onClick: () => void;
}> = ({ ratio, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex-1 py-2 px-2 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            isSelected
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
    >
        {ratio}
    </button>
);

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ language, activeTool, selectedRatio, onRatioChange }) => {
    const availableRatios = activeTool === 'video' ? videoRatios : allRatios;
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {TEXTS[language].aspectRatioLabel}
            </label>
            <div className="bg-gray-900 p-1 rounded-lg flex space-x-1">
                {availableRatios.map(ratio => (
                    <RatioButton
                        key={ratio}
                        ratio={ratio}
                        isSelected={selectedRatio === ratio}
                        onClick={() => onRatioChange(ratio)}
                    />
                ))}
            </div>
        </div>
    );
};
