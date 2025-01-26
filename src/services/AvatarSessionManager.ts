import StreamingAvatar, { AvatarQuality, VoiceEmotion, StreamingEvents, TaskMode, TaskType } from '@heygen/streaming-avatar';

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

class AvatarSessionManager {
  private static instance: AvatarSessionManager;
  private avatar: StreamingAvatar | null = null;
  private apiHost = '';

  static getInstance(): AvatarSessionManager {
    if (!AvatarSessionManager.instance) {
      AvatarSessionManager.instance = new AvatarSessionManager();
    }
    return AvatarSessionManager.instance;
  }

  private async fetchAccessToken(): Promise<string> {
    console.log('[AvatarSession] Fetching access token from: ', this.apiHost, '/api/v1/heygen/token');
    if (!this.apiHost) {
      throw new Error('API host not configured');
    }

    try {
      const response = await fetch(`${this.apiHost}/api/v1/heygen/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const token = await response.text();

      console.log('[AvatarSession] Token fetch response status:', response.status);

      if (!response.ok) {
        console.error('[AvatarSession] Failed to fetch token:', {
          status: response.status,
          statusText: response.statusText,
          error: token,
        });
        throw new Error(`Failed to fetch token: ${token}`);
      }

      const jsonResponse = JSON.parse(token);
      console.log('[AvatarSession] Full JSON token response:', JSON.stringify(jsonResponse, null, 2));

      if (jsonResponse.error) {
        throw new Error(`Failed to fetch token: ${jsonResponse.error}`);
      }

      console.log('[AvatarSession] Successfully retrieved token:', token);
      return jsonResponse.token;
    } catch (error) {
      console.error('[AvatarSession] Error fetching token:', error);
      throw error;
    }
  }

  async initializeSession(config: AvatarSessionConfig): Promise<void> {
    console.log('[AvatarSession] Initializing session with config:', {
      avatarId: config.avatarId,
      voiceId: config.voiceId,
      quality: config.quality,
      language: config.language,
    });

    if (this.avatar) {
      console.log('[AvatarSession] Cleaning up existing session');
      await this.endSession();
    }

    try {
      this.apiHost = config.apiHost;
      const newToken = await this.fetchAccessToken();
      console.log('[AvatarSession] Initializing StreamingAvatar with token length:', newToken.length);

      this.avatar = new StreamingAvatar({ token: newToken });

      console.log('[AvatarSession] StreamingAvatar instance created');

      this.avatar.on(StreamingEvents.STREAM_READY, (stream) => {
        console.log('[AvatarSession] Stream ready event received');
        config.onStreamReady?.(stream);
      });

      this.avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log('[AvatarSession] Avatar start talking event');
        config.onStartTalking?.();
      });

      this.avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log('[AvatarSession] Avatar stop talking event');
        config.onStopTalking?.();
      });

      this.avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('[AvatarSession] Stream disconnected event');
        config.onDisconnected?.();
        this.avatar = null;
      });

      console.log('[AvatarSession] Event listeners attached');

      const result = await this.avatar.createStartAvatar({
        quality: config.quality,
        avatarName: config.avatarId || '',
        knowledgeId: config.knowledgeId, // Or use a custom `knowledgeBase`.
        voice: {
          voiceId: config.voiceId,
          rate: config.rate,
          emotion: config.emotion,
          // elevenlabsSettings: {
          //   stability: 1,
          //   similarity_boost: 1,
          //   style: 1,
          //   use_speaker_boost: false,
          // },
        },
        language: config.language || 'en',
        disableIdleTimeout: config.disableIdleTimeout || false,
      });

      console.log('[AvatarSession] Avatar creation result:', result);
      console.log('[AvatarSession] Session ID:', result.sessionId);
    } catch (error) {
      console.error('[AvatarSession] Failed to initialize session:', error);
      this.avatar = null;
      throw error;
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar session not initialized');
    }

    try {
      await this.avatar.speak({
        text,
        taskMode: TaskMode.SYNC,
        task_type: TaskType.REPEAT,
      });
    } catch (error) {
      console.error('[AvatarSessionManager] Failed to speak:', error);
      throw error;
    }
  }

  async interrupt(): Promise<void> {
    if (!this.avatar) {
      throw new Error('Avatar session not initialized');
    }

    try {
      console.log('[AvatarSessionManager] Interrupting avatar speech');
      await this.avatar.interrupt();
    } catch (error) {
      console.error('[AvatarSessionManager] Failed to interrupt:', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    if (this.avatar) {
      try {
        await this.avatar.stopAvatar();
      } catch (error) {
        console.error('[AvatarSessionManager] Error ending session:', error);
      } finally {
        this.avatar = null;
      }
    }
  }

  isSessionActive(): boolean {
    return this.avatar !== null;
  }
}

export default AvatarSessionManager;
