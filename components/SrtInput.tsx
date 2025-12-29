
import React, { useState, useRef } from 'react';
import type { Language, AudioFile } from '../types';
import { TEXTS } from '../constants';

interface SrtInputProps {
    language: Language;
    onFileSelect: (file: AudioFile | null) => void;
    disabled: boolean;
}

const fileToDataUri = (file: File): Promise<AudioFile> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ base64, mimeType: file.type, name: file.name });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export const SrtInput: React.FC<SrtInputProps> = ({ language, onFileSelect, disabled }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const audioFile = await fileToDataUri(file);
            onFileSelect(audioFile);
        }
    };
    
    const handleRemoveFile = () => {
        setSelectedFile(null);
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
            {selectedFile ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-md">
                        <svg className="h-6 w-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l7-3v13l-7 3zM9 19a2 2 0 11-4 0 2 2 0 014 0zm7 0a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-200 truncate">{selectedFile.name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={disabled}
                        className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                        {TEXTS[language].changeAudioButton}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                     <svg className="h-12 w-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 focus:outline-none"
                    >
                        {TEXTS[language].uploadAudioButton}
                    </button>
                     <p className="text-xs text-gray-500">{TEXTS[language].srtFileTypes}</p>
                </div>
            )}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="audio/mpeg, audio/wav, audio/ogg, audio/mp4"
                disabled={disabled}
            />
        </div>
    );
};
