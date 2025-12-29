
import React, { useState, useRef } from 'react';
import type { Language, CharacterImage } from '../types';
import { TEXTS } from '../constants';

interface ImageOptionsProps {
    language: Language;
    numberOfImages: number;
    setNumberOfImages: (n: number) => void;
    onSetCharacterImage: (image?: CharacterImage) => void;
    disabled: boolean;
}

const fileToDataUri = (file: File): Promise<CharacterImage> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export const ImageOptions: React.FC<ImageOptionsProps> = ({
    language,
    numberOfImages,
    setNumberOfImages,
    onSetCharacterImage,
    disabled
}) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            const charImage = await fileToDataUri(file);
            onSetCharacterImage(charImage);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        onSetCharacterImage(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            {/* Number of Images Selector */}
            <div>
                <label htmlFor="num-images" className="block text-sm font-medium text-gray-300 mb-2">
                    {TEXTS[language].numberOfImagesLabel}
                </label>
                <div className="flex items-center bg-gray-900 rounded-lg p-1">
                    {[1, 2, 3, 4].map(num => (
                        <button
                            type="button"
                            key={num}
                            onClick={() => setNumberOfImages(num)}
                            disabled={disabled}
                            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-md transition-all duration-200 ${numberOfImages === num ? 'bg-indigo-600 text-white shadow' : 'hover:bg-gray-700'}`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            {/* Character Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {TEXTS[language].characterUploadLabel}
                </label>
                {imagePreview ? (
                    <div className="flex items-center gap-4">
                        <img src={imagePreview} alt="Character preview" className="w-16 h-16 rounded-md object-cover" />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={disabled}
                            className="text-sm text-red-400 hover:text-red-300"
                        >
                            {TEXTS[language].characterRemoveButton}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="w-full text-center py-2 px-4 text-sm font-semibold rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                    >
                        {TEXTS[language].characterUploadButton}
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    disabled={disabled}
                />
            </div>
        </div>
    );
};
