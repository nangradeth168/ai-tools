
import React, { useState, useEffect } from 'react';
import type { Language, Tool, AspectRatio, Speaker, CharacterImage, AudioFile } from '../types';
import { TEXTS } from '../constants';
import { AspectRatioSelector } from './AspectRatioSelector';
import { MultiSpeakerInput } from './MultiSpeakerInput';
import { GenerateOptions } from '../App';
import { ImageOptions } from './ImageOptions';
import { SrtInput } from './SrtInput';

interface InputPanelProps {
  language: Language;
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  onGenerate: (options: GenerateOptions) => void;
  isLoading: boolean;
}

const ToolButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-4 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2 ${
      isActive
        ? 'bg-indigo-600 text-white shadow'
        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
    }`}
  >
    {label}
  </button>
);

const randomPrompts = [
    "Cool dark cabaret song about the rooftop at sunset",
    "A groovy funk song about a dancing robot.",
    "A sad acoustic ballad about a lost dog.",
    "An epic power metal song about climbing a mountain.",
    "A chill lo-fi track for studying on a rainy day.",
    "A country song about driving down a long highway.",
];

export const InputPanel: React.FC<InputPanelProps> = ({ language, activeTool, setActiveTool, onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [characterImage, setCharacterImage] = useState<CharacterImage | undefined>(undefined);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [songDescription, setSongDescription] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [styleTags, setStyleTags] = useState('');

  useEffect(() => {
    // Reset specific states when tool changes to avoid carrying over old inputs
    setPrompt('');
    setSpeakers([{ id: crypto.randomUUID(), name: 'Speaker 1', voice: 'Kore', text: '' }]);
    setNumberOfImages(1);
    setCharacterImage(undefined);
    setAudioFile(null);
    setSongDescription('');
    setIsInstrumental(false);
    setStyleTags('');
  }, [activeTool]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTool === 'audio') {
        const validSpeakers = speakers.filter(s => s.name.trim() && s.text.trim());
        if (validSpeakers.length > 0) {
            onGenerate({ speakers: validSpeakers });
        }
    } else if (activeTool === 'srt') {
        if (audioFile) {
            onGenerate({ audioFile });
        }
    } else if (activeTool === 'songwriter') {
        if (songDescription.trim()) {
            onGenerate({ songDescription, isInstrumental, styleTags });
        }
    } else {
        if (prompt.trim()) {
            onGenerate({ prompt, aspectRatio, numberOfImages, characterImage });
        }
    }
  };

  const handleRandomPrompt = () => {
    const random = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setSongDescription(random);
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    switch(activeTool) {
        case 'audio':
            return speakers.every(s => !s.name.trim() || !s.text.trim());
        case 'srt':
            return !audioFile;
        case 'songwriter':
            return !songDescription.trim();
        default:
            return !prompt.trim();
    }
  }

  const labels: Record<Tool, string> = {
      videoPlan: TEXTS[language].inputLabelVideoPlan,
      image: TEXTS[language].inputLabelImage,
      video: TEXTS[language].inputLabelVideo,
      audio: TEXTS[language].inputLabelAudio,
      srt: TEXTS[language].inputLabelSrt,
      songwriter: TEXTS[language].inputLabelSongwriter,
  };

  const renderInputArea = () => {
    switch(activeTool) {
        case 'audio':
            return <MultiSpeakerInput language={language} speakers={speakers} setSpeakers={setSpeakers} disabled={isLoading} />;
        case 'srt':
            return <SrtInput language={language} onFileSelect={setAudioFile} disabled={isLoading} />;
        case 'songwriter':
            return (
                <div className="space-y-4">
                    <div className="relative">
                        <textarea
                            id="song-description"
                            rows={4}
                            value={songDescription}
                            onChange={(e) => setSongDescription(e.target.value)}
                            placeholder="e.g., An epic power metal song about climbing a mountain."
                            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 pr-12"
                            disabled={isLoading}
                        />
                        <button type="button" onClick={handleRandomPrompt} title={TEXTS[language].randomButton} className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V3.5a.75.75 0 0 1 .75-.75zM9.033 6.918a.75.75 0 0 1 .185 1.05l-2.43 4.21a.75.75 0 0 1-1.235-.714l2.43-4.21a.75.75 0 0 1 1.05-.186zm5.749 0a.75.75 0 0 1 1.05.186l2.43 4.21a.75.75 0 1 1-1.235.714l-2.43-4.21a.75.75 0 0 1-.185-1.05zM20.5 10.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75zM3.5 10.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 3.5 10.5zm15.688 3.582a.75.75 0 0 1 .186 1.05l-2.43 4.21a.75.75 0 1 1-1.235-.714l2.43-4.21a.75.75 0 0 1 1.05-.186zm-11.563 0a.75.75 0 0 1 1.05.186l2.43 4.21a.75.75 0 1 1-1.235.714l-2.43-4.21a.75.75 0 0 1-.186-1.05zM12 16.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75z"></path></svg>
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-md">
                        <label htmlFor="style-tags" className="text-sm font-medium text-gray-400">{TEXTS[language].styleTagsLabel}</label>
                        <input id="style-tags" type="text" value={styleTags} onChange={e => setStyleTags(e.target.value)} placeholder={TEXTS[language].styleTagsPlaceholder} disabled={isLoading} className="w-1/2 bg-gray-800 border border-gray-700 rounded-md p-1.5 text-sm text-gray-200 focus:ring-1 focus:ring-indigo-500 text-right" />
                    </div>

                    <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-md">
                        <label className="text-sm font-medium text-gray-300">{TEXTS[language].instrumentalLabel}</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isInstrumental} onChange={e => setIsInstrumental(e.target.checked)} className="sr-only peer" disabled={isLoading} />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            );
        default:
            return <textarea
                id="prompt-input"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={TEXTS[language].placeholderVideoPlan}
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                disabled={isLoading}
            />
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-24 space-y-6">
        {/* Tool Selector */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <ToolButton label={TEXTS[language].videoPlanTool} isActive={activeTool === 'videoPlan'} onClick={() => setActiveTool('videoPlan')} />
            <ToolButton label={TEXTS[language].audioTool} isActive={activeTool === 'audio'} onClick={() => setActiveTool('audio')} />
            <ToolButton label={TEXTS[language].srtTool} isActive={activeTool === 'srt'} onClick={() => setActiveTool('srt')} />
            <ToolButton label={TEXTS[language].songwriterTool} isActive={activeTool === 'songwriter'} onClick={() => setActiveTool('songwriter')} />
            <ToolButton label={TEXTS[language].imageTool} isActive={activeTool === 'image'} onClick={() => setActiveTool('image')} />
            <ToolButton label={TEXTS[language].videoTool} isActive={activeTool === 'video'} onClick={() => setActiveTool('video')} />
        </div>

        {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-lg font-medium text-gray-300">
                    {labels[activeTool]}
                </label>
            </div>
            
            {renderInputArea()}

            {activeTool === 'image' && (
                <ImageOptions
                    language={language}
                    numberOfImages={numberOfImages}
                    setNumberOfImages={setNumberOfImages}
                    onSetCharacterImage={setCharacterImage}
                    disabled={isLoading}
                />
            )}

            {(activeTool === 'image' || activeTool === 'video') && (
                <AspectRatioSelector 
                    language={language}
                    activeTool={activeTool}
                    selectedRatio={aspectRatio}
                    onRatioChange={setAspectRatio}
                />
            )}
        </div>
        <button
          type="submit"
          disabled={isSubmitDisabled()}
          className="w-full flex justify-center items-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 mt-6"
        >
          {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {TEXTS[language].generatingButton}
            </>
          ) : (
            TEXTS[language].generateButton
          )}
        </button>
      </form>
    </div>
  );
};
