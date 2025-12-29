
export type Language = 'en' | 'km';

export type Tool = 'videoPlan' | 'image' | 'video' | 'audio' | 'srt' | 'songwriter';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ScriptScene {
  scene: string;
  description: string;
  vo: string;
}

export interface VideoPlan {
  title: string;
  script: ScriptScene[];
  shotList: string[];
  aiPrompts: string[];
}

// For Audio Generation
export type PrebuiltVoice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface Speaker {
  id: string;
  name: string;
  voice: PrebuiltVoice;
  text: string;
}

// For Image Generation
export interface CharacterImage {
    base64: string;
    mimeType: string;
}

// For SRT Generation
export interface AudioFile {
    base64: string;
    mimeType: string;
    name: string;
}

// For Songwriter
export interface SongLyrics {
    title: string;
    lyrics: string;
    styleDescription: string;
}

export interface AudioEffects {
    reverb: number; // 0 to 1
    echo: number;   // 0 to 1
    distortion: number; // 0 to 1
}
