
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { generateVideoPlan, generateImage, generateVideo, generateAudio, generateSrt, generateSongLyrics } from './services/geminiService';
import type { VideoPlan, Language, Tool, AspectRatio, Speaker, CharacterImage, AudioFile, SongLyrics } from './types';
import { TEXTS } from './constants';
import { ApiKeyModal } from './components/ApiKeyModal';

export type GenerateOptions = {
    prompt: string;
    aspectRatio: AspectRatio;
    numberOfImages?: number;
    characterImage?: CharacterImage;
} | {
    speakers: Speaker[];
} | {
    audioFile: AudioFile;
} | {
    songDescription: string;
    isInstrumental: boolean;
    styleTags: string;
}

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('km');
  const [activeTool, setActiveTool] = useState<Tool>('videoPlan');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [history, setHistory] = useState<Partial<Record<Tool, VideoPlan | string | string[] | SongLyrics | null>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [narrationAudio, setNarrationAudio] = useState<string | null>(null);
  const [isNarrationLoading, setIsNarrationLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (activeTool === 'video') {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          setIsKeyModalOpen(false);
        } else {
          setIsKeyModalOpen(true);
        }
      } else {
        setIsKeyModalOpen(false);
      }
    };
    checkApiKey();
  }, [activeTool]);

  const handleSubmit = async (options: GenerateOptions) => {
    if (activeTool === 'video' && isKeyModalOpen) {
        return; // Don't submit if the modal should be open
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage(TEXTS[language].generatingButton);
    setNarrationAudio(null); // Clear previous narration on new generation

    try {
      let response: VideoPlan | string | string[] | SongLyrics | null = null;
      switch(activeTool) {
        case 'videoPlan':
            if ('prompt' in options) {
                response = await generateVideoPlan(options.prompt, language);
            }
            break;
        case 'image':
            if ('prompt' in options && options.numberOfImages) {
                response = await generateImage(options.prompt, options.aspectRatio, options.numberOfImages, options.characterImage);
            }
            break;
        case 'video':
            if ('prompt' in options) {
                setLoadingMessage(TEXTS[language].generatingVideoMessage);
                response = await generateVideo(options.prompt, options.aspectRatio);
            }
            break;
        case 'audio':
            if ('speakers' in options) {
                response = await generateAudio(options.speakers);
            }
            break;
        case 'srt':
            if ('audioFile' in options) {
                setLoadingMessage(TEXTS[language].generatingSrtMessage);
                response = await generateSrt(options.audioFile);
            }
            break;
        case 'songwriter':
            if ('songDescription' in options) {
                response = await generateSongLyrics(options.songDescription, options.isInstrumental, options.styleTags, language);
            }
            break;
      }
      setHistory(prev => ({...prev, [activeTool]: response }));
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message.includes("Requested entity was not found")) {
          setError(TEXTS[language].apiKeyError);
          setIsKeyModalOpen(true);
      } else {
          setError(err instanceof Error ? err.message : TEXTS[language].error);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGenerateNarration = async (lyrics: string) => {
    setIsNarrationLoading(true);
    setError(null);
    try {
        const speaker: Speaker = {
            id: 'narrator',
            name: 'Narrator',
            voice: 'Zephyr',
            text: lyrics.replace(/\[.*?\]/g, ''), // Remove verse/chorus markers for cleaner speech
        };
        const audioB64 = await generateAudio([speaker]);
        setNarrationAudio(audioB64);
    } catch (err) {
        setError(err instanceof Error ? err.message : TEXTS[language].error);
    } finally {
        setIsNarrationLoading(false);
    }
  };

  const handleSelectKey = async () => {
      if(window.aistudio) {
          await window.aistudio.openSelectKey();
          // Assume success and hide modal to allow generation attempt
          setIsKeyModalOpen(false);
      }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header 
        language={language}
        onLanguageChange={setLanguage}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <InputPanel 
            language={language}
            activeTool={activeTool}
            setActiveTool={(tool) => {
                setError(null); // Clear error on tool switch
                setNarrationAudio(null);
                setActiveTool(tool);
            }}
            onGenerate={handleSubmit} 
            isLoading={isLoading} 
          />
          <OutputPanel 
            language={language}
            activeTool={activeTool}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            result={history[activeTool] ?? null} 
            error={error} 
            onGenerateNarration={handleGenerateNarration}
            isNarrationLoading={isNarrationLoading}
            narrationAudio={narrationAudio}
          />
        </div>
      </main>
      {isKeyModalOpen && (
          <ApiKeyModal 
            language={language}
            onSelectKey={handleSelectKey}
            onClose={() => setIsKeyModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
