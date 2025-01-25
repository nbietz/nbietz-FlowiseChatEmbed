import { AvatarQuality, VoiceEmotion } from '@heygen/streaming-avatar';
export type AvatarConfig = {
    avatarId: string;
    voiceId?: string;
    quality?: 'Low' | 'Medium' | 'High';
    language?: string;
};
export type AvatarSessionConfig = {
    avatarId?: string;
    knowledgeId?: string;
    voiceId?: string;
    rate?: number;
    emotion?: VoiceEmotion;
    apiHost: string;
    quality?: AvatarQuality;
    language?: string;
    disableIdleTimeout?: boolean;
    onStreamReady?: (stream: MediaStream) => void;
    onStartTalking?: () => void;
    onStopTalking?: () => void;
    onDisconnected?: () => void;
};
declare class AvatarSessionManager {
    private static instance;
    private avatar;
    private apiHost;
    private constructor();
    static getInstance(): AvatarSessionManager;
    private fetchAccessToken;
    initializeSession(config: AvatarSessionConfig): Promise<void>;
    speak(text: string): Promise<void>;
    endSession(): Promise<void>;
    isSessionActive(): boolean;
}
export default AvatarSessionManager;
//# sourceMappingURL=AvatarSessionManager.d.ts.map