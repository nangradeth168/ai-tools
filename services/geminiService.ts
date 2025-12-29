
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Language, VideoPlan, AspectRatio, Speaker, CharacterImage, AudioFile, SongLyrics } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const videoPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A creative title for the video.',
    },
    script: {
      type: Type.ARRAY,
      description: 'The video script, broken down into scenes.',
      items: {
        type: Type.OBJECT,
        properties: {
          scene: {
            type: Type.STRING,
            description: 'The name of the scene (e.g., Intro, Body 1, Outro).',
          },
          description: {
            type: Type.STRING,
            description: 'A detailed visual description of the scene.',
          },
          vo: {
            type: Type.STRING,
            description: 'The voiceover text for this scene.',
          },
        },
        required: ['scene', 'description', 'vo'],
      },
    },
    shotList: {
      type: Type.ARRAY,
      description: 'A list of recommended camera shots for the video.',
      items: {
        type: Type.STRING,
      },
    },
    aiPrompts: {
      type: Type.ARRAY,
      description: 'Detailed, descriptive text prompts for an AI video generator for each scene.',
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['title', 'script', 'shotList', 'aiPrompts'],
};

const songLyricsSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'A creative title for the song.',
        },
        lyrics: {
            type: Type.STRING,
            description: 'The full song lyrics, formatted with clear labels for each section (e.g., [Verse 1], [Chorus], [Bridge], [Outro]). The lyrics should be well-structured and thematic.'
        },
        styleDescription: {
            type: Type.STRING,
            description: 'A detailed description of the suggested musical style, including tempo, key instrumentation (e.g., acoustic guitar, synthesizers, drum machine), and overall vibe.'
        }
    },
    required: ['title', 'lyrics', 'styleDescription'],
};


export const generateVideoPlan = async (topic: string, language: Language): Promise<VideoPlan> => {
  const languageInstruction = language === 'km' ? 'Khmer' : 'English';
  
  const systemInstruction = `You are an expert Video Director and Scriptwriter specializing in creating content plans for AI video generation.
Your output must be a valid JSON object that conforms to the provided schema.
Generate a complete video production plan in ${languageInstruction}.
For Khmer, ensure translations are contextually accurate, culturally appropriate, and use natural phrasing.`;

  const prompt = `Video Topic: "${topic}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: videoPlanSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("Received an empty response from the API.");
    }
    
    const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    return JSON.parse(cleanedJsonText) as VideoPlan;
  } catch (error) {
    console.error("Error calling Gemini API for Video Plan:", error);
    throw new Error("Failed to generate video plan from Gemini API.");
  }
};

const callGenerateImageAPI = async (prompt: string, aspectRatio: AspectRatio, characterImage?: CharacterImage): Promise<string> => {
    const parts: any[] = [];
    if (characterImage) {
        parts.push({
            inlineData: {
                data: characterImage.base64,
                mimeType: characterImage.mimeType,
            },
        });
    }
    parts.push({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                imageConfig: { aspectRatio },
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // Return base64 string
            }
        }
        throw new Error("No image data found in the response.");
    } catch (error) {
        console.error("Error calling Gemini API for a single image:", error);
        throw new Error("Failed to generate an image from Gemini API.");
    }
};

export const generateImage = async (
    prompt: string, 
    aspectRatio: AspectRatio,
    numberOfImages: number,
    characterImage?: CharacterImage
): Promise<string[]> => {
    const imagePromises: Promise<string>[] = [];
    for (let i = 0; i < numberOfImages; i++) {
        imagePromises.push(callGenerateImageAPI(prompt, aspectRatio, characterImage));
    }
    try {
        return await Promise.all(imagePromises);
    } catch (error) {
        console.error("Error generating multiple images:", error);
        throw new Error("Failed to generate one or more images.");
    }
};

export const generateVideo = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    // Re-initialize with the latest key from the environment, crucial for Veo.
    const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        let operation = await videoAI.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio as '16:9' | '9:16' // Cast as Veo only supports these
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await videoAI.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        return downloadLink;
    } catch (error) {
        console.error("Error calling Gemini API for Video Generation:", error);
        throw error; // Re-throw to be caught by the UI
    }
}

export const generateAudio = async (speakers: Speaker[]): Promise<string> => {
    if (!speakers || speakers.length === 0) {
        throw new Error("No speakers provided for audio generation.");
    }

    try {
        let prompt: string;
        let speechConfig: any;

        if (speakers.length === 1) {
            // Single speaker mode
            prompt = speakers[0].text;
            speechConfig = {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: speakers[0].voice },
                },
            };
        } else {
            // Multi-speaker mode
            const speakerNames = speakers.map(s => s.name).join(' and ');
            const conversation = speakers.map(s => `${s.name}: ${s.text}`).join('\n');
            prompt = `TTS the following conversation between ${speakerNames}:\n${conversation}`;
            
            speechConfig = {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: speakers.map(s => ({
                        speaker: s.name,
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: s.voice }
                        }
                    }))
                }
            };
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: speechConfig,
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data found in the response.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error calling Gemini API for Audio Generation:", error);
        throw new Error("Failed to generate audio from Gemini API.");
    }
};

export const generateSrt = async (audioFile: AudioFile): Promise<string> => {
  const model = "gemini-3-pro-preview";

  const prompt = `You are an expert audio transcriptionist specializing in creating detailed SRT files for media production.
  Transcribe the provided audio and format the entire output as a standard SRT (SubRip Text) file.
  - The SRT file must be valid and well-formed.
  - Include sequential numeric counters starting from 1.
  - Include accurate timestamps in the format HH:MM:SS,ms --> HH:MM:SS,ms.
  - Provide accurate transcription of the spoken words.
  - If there are multiple speakers, identify them (e.g., SPEAKER 1:, SPEAKER 2:).
  - Describe significant non-speech sounds in square brackets on a new line (e.g., [UPBEAT MUSIC], [LAUGHTER], [DOOR CREAKS]).
  - Do not include any other text, explanations, or notes. The output must only be the SRT content itself.`;

  const audioPart = {
    inlineData: {
      data: audioFile.base64,
      mimeType: audioFile.mimeType,
    },
  };

  const textPart = {
    text: prompt
  };
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [audioPart, textPart] },
    });
    const srtContent = response.text;
    if (!srtContent) {
      throw new Error("Received an empty response from the API.");
    }
    return srtContent.replace(/^```(srt\n)?/, '').replace(/\n?```$/, '').trim();
  } catch (error) {
    console.error("Error calling Gemini API for SRT Generation:", error);
    throw new Error("Failed to generate SRT from Gemini API.");
  }
};

export const generateSongLyrics = async (description: string, isInstrumental: boolean, tags: string, language: Language): Promise<SongLyrics> => {
    const languageInstruction = language === 'km' ? 'Khmer' : 'English';
    const systemInstruction = `You are a world-class songwriter and music producer. Your task is to generate a complete song concept based on the user's request.
Your output must be a valid JSON object that conforms to the provided schema.
The lyrics must be creative, cohesive, and follow a standard song structure.
The style description should be detailed and inspiring for a musician.
Generate all content in ${languageInstruction}.`;

    let prompt = `Please write a song with the following characteristics:
- Main Description: "${description}"`;
    if (tags) {
        prompt += `\n- Style & Genre Tags: "${tags}"`;
    }
    if (isInstrumental) {
        prompt += `\n- Important: This should be an instrumental track. Generate lyrics that are minimal, abstract, or repetitive, meant to be more of a vocal texture than a story. Focus the style description heavily on the instrumentation and musical arrangement.`;
    } else {
        prompt += `\n- This song should have full, meaningful lyrics (verses, chorus, etc.).`;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: songLyricsSchema,
            }
        });

        const jsonText = response.text;
        if (!jsonText) {
            throw new Error("Received an empty response from the API.");
        }
        
        const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');

        return JSON.parse(cleanedJsonText) as SongLyrics;
    } catch (error) {
        console.error("Error calling Gemini API for Songwriter:", error);
        throw new Error("Failed to generate song lyrics from Gemini API.");
    }
};
