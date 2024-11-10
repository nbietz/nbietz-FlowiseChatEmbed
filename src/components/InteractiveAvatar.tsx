import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { Configuration, NewSessionData, StreamingAvatarApi } from '@heygen/streaming-avatar';

type InteractiveAvatarProps = {
  onSpeakReady: (speakFunction: (text: string) => void) => void;
  quality?: 'low' | 'medium' | 'high';
  avatarName?: string;
  voiceId?: string;
};

export default function InteractiveAvatar(props: InteractiveAvatarProps) {
  console.log('InteractiveAvatar props received:', {
    quality: props.quality || 'undefined',
    avatarName: props.avatarName || 'undefined',
    voiceId: props.voiceId || 'undefined',
  });
  const [isLoadingSession, setIsLoadingSession] = createSignal(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = createSignal(false);
  const [stream, setStream] = createSignal<MediaStream>();
  const [debug, setDebug] = createSignal<string>();
  const [data, setData] = createSignal<NewSessionData>();
  const [initialized, setInitialized] = createSignal(false);
  const [canvasStream, setCanvasStream] = createSignal<MediaStream | null>(null);
  let mediaStream: HTMLVideoElement | undefined;
  const avatar = { current: null as StreamingAvatarApi | null };
  let canvasRef: HTMLCanvasElement | undefined;
  const HEYGEN_API_KEY_PARTS = ['YzA3ZGJ', 'jNmEyM2YwNGF', 'iNGIxZGE3MDAxOG', 'U3YjQ3YzgtMT', 'cwODE2MDQxOA=='];
  //   "YWM3NjEx",
  //   "ZTk3M2U4NDVjM",
  //   "zlhZTlmYzhmOTI4M",
  //   "zFkNDUtMTcxM",
  //   "zU4MzM1MA=="
  // ];

  console.log('InteractiveAvatar props received:', {
    quality: props.quality,
    avatarName: props.avatarName,
    voiceId: props.voiceId,
  });

  const getHeygenApiKey = () => HEYGEN_API_KEY_PARTS.join('');

  async function fetchAccessToken() {
    try {
      if (!getHeygenApiKey()) {
        throw new Error('API key is missing from .env');
      }

      const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
        method: 'POST',
        headers: {
          'x-api-key': getHeygenApiKey(),
        },
      });
      const data = await res.json();
      return data.data.token;
    } catch (error) {
      console.error('Error retrieving access token:', error);

      return new Response('Failed to retrieve access token', {
        status: 500,
      });
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    await updateToken();
    if (!avatar.current) {
      setDebug('Avatar API is not initialized');
      return;
    }
    try {
      console.log('Starting session with params:', {
        quality: props.quality,
        avatarName: props.avatarName,
        voiceId: props.voiceId,
      });
      const res = await avatar.current.createStartAvatar(
        {
          newSessionRequest: {
            quality: props.quality || 'medium',
            avatarName: props.avatarName || 'Kristin_public_2_20240108',
            voice: { voiceId: props.voiceId || '1bd001e7e50f421d891986aad5158bc8' },
          },
        },
        setDebug,
      );
      setData(res);
      console.log('Session started:', data());
      setDebug(`Session started ${res.sessionId}`);
      setStream(avatar.current.mediaStream);
      console.log('Stream set:', stream()?.id);
    } catch (error) {
      console.error('Error starting avatar session:', error);
      setDebug(`There was an error starting the session. ${props.voiceId ? 'This custom Voice or Avatar may not be supported.' : ''}`);
    }
    setIsLoadingSession(false);
  }

  async function updateToken() {
    const newToken = await fetchAccessToken();
    console.log('Updating Access Token (length):', newToken.length);
    avatar.current = new StreamingAvatarApi(new Configuration({ accessToken: newToken }));

    const startTalkCallback = (e: any) => {
      console.log('Avatar started talking', e);
    };

    const stopTalkCallback = (e: any) => {
      console.log('Avatar stopped talking', e);
    };

    console.log('Adding event handlers to:', avatar.current);
    avatar.current.addEventHandler('avatar_start_talking', startTalkCallback);
    avatar.current.addEventHandler('avatar_stop_talking', stopTalkCallback);

    setInitialized(true);
    console.log('Avatar API initialized with new token');
  }

  async function handleInterrupt() {
    if (!initialized() || !avatar.current) {
      setDebug('Avatar API not initialized');
      return;
    }
    await avatar.current.interrupt({ interruptRequest: { sessionId: data()?.sessionId } }).catch((e) => {
      setDebug(e.message);
    });
  }

  async function endSession() {
    if (!initialized() || !avatar.current) {
      setDebug('Avatar API not initialized');
      return;
    }
    await avatar.current.stopAvatar({ stopSessionRequest: { sessionId: data()?.sessionId } }, setDebug);
    setStream(undefined);
  }

  const handleSpeak = async (speakText: string) => {
    console.log('handleSpeak called with text:', speakText);
    if (!initialized() || !avatar.current || !data()?.sessionId) {
      console.log('Avatar API not initialized or session not started', {
        initialized: initialized(),
        avatarCurrent: !!avatar.current,
        sessionId: data()?.sessionId,
      });
      setDebug('Avatar API not initialized or session not started');
      return;
    }
    console.log('Attempting to speak with session ID:', data()?.sessionId);
    try {
      await avatar.current.speak({ taskRequest: { text: speakText, sessionId: data()?.sessionId } });
      console.log('Speech request sent successfully');
    } catch (error: unknown) {
      console.error('Error in handleSpeak:', error);
      if (error instanceof Error) {
        setDebug(error.message);
      } else {
        setDebug('An unknown error occurred');
      }
    }
    setIsLoadingRepeat(false);
  };

  // Call onSpeakReady when the component is ready to speak
  createEffect(() => {
    if (initialized() && avatar.current && data()?.sessionId) {
      console.log('InteractiveAvatar ready to speak', {
        initialized: initialized(),
        avatarCurrent: !!avatar.current,
        sessionId: data()?.sessionId,
      });
      props.onSpeakReady(handleSpeak);
    } else {
      console.log('InteractiveAvatar not ready to speak', {
        initialized: initialized(),
        avatarCurrent: !!avatar.current,
        sessionId: data()?.sessionId,
      });
    }
  });

  createEffect(() => {
    // Initialize avatar API
    async function init() {
      const newToken = await fetchAccessToken();
      console.log('Obtained HeyGen Access Token (length):', newToken.length);
      avatar.current = new StreamingAvatarApi(new Configuration({ accessToken: newToken, jitterBuffer: 200 }));
      setInitialized(true);
      console.log('Avatar API initialized');
      setDebug('Avatar API initialized');
    }
    init();

    startSession();

    onCleanup(() => {
      console.log('Cleaning up InteractiveAvatar');
      endSession();
    });
  });

  const [isReady, setIsReady] = createSignal(false);

  createEffect(() => {
    // Handle stream and media playback
    const currentStream = stream();
    if (currentStream && mediaStream) {
      mediaStream.srcObject = currentStream;
      mediaStream.onloadedmetadata = () => {
        const playPromise = mediaStream.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Autoplay started');
              setDebug('Playing');
              applyChromaKey();
              setIsReady(true);
            })
            .catch((error) => {
              console.error('Autoplay was prevented:', error);
              setDebug('Autoplay blocked. Click to play.');
              // You might want to show a play button here
              // For now, we'll just log the error and set a debug message
            });
        }
      };
    }
  });

  function applyChromaKey() {
    if (!mediaStream || !canvasRef) return;

    const video = mediaStream;
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const setCanvasDimensions = () => {
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const containerAspectRatio = canvas.offsetWidth / canvas.offsetHeight;

      let newWidth, newHeight;

      if (videoAspectRatio > containerAspectRatio) {
        newWidth = Math.max(canvas.offsetWidth, 200);
        newHeight = Math.max(newWidth / videoAspectRatio, 140);
      } else {
        newHeight = Math.max(canvas.offsetHeight, 140);
        newWidth = Math.max(newHeight * videoAspectRatio, 200);
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    const drawFrame = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];

        // Adjust these values for better green screen detection
        const threshold = 100;
        const greenDominance = 1.5;

        if (green > threshold && green > red * greenDominance && green > blue * greenDominance) {
          // Make pixel fully transparent
          data[i + 3] = 0;
        } else if (green > red && green > blue) {
          // For pixels that are greenish but not fully green, reduce green component
          const greenness = (green - Math.max(red, blue)) / 255;
          data[i + 1] = Math.max(0, green - greenness * 100);
          data[i + 3] = Math.max(0, 255 - greenness * 200);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(drawFrame);
    };

    drawFrame();

    const canvasStream = canvas.captureStream();
    setCanvasStream(canvasStream);
  }

  return (
    <div class="h-full flex flex-col justify-center items-center">
      <div class="relative h-full flex justify-center items-center">
        {stream() ? (
          <div class="relative h-full flex justify-center items-center">
            <video ref={mediaStream} autoplay playsinline style={{ display: 'none' }}>
              <track kind="captions" />
            </video>
            <canvas
              ref={canvasRef}
              style={{
                height: '100%',
                width: 'auto',
                'max-width': 'none',
                'min-width': '200px',
                'min-height': '140px',
                'object-fit': 'contain',
                background: 'transparent',
              }}
            />
            <div class="absolute bottom-2 right-2 flex flex-col gap-2">
              <button
                onClick={handleInterrupt}
                class="chatbot-button text-xs font-semibold rounded px-2 py-1 transition-colors duration-200 shadow-sm"
                style={{
                  'background-color': 'var(--chatbot-button-bg-color)',
                  color: 'var(--chatbot-button-color)',
                }}
              >
                Interrupt
              </button>
              <button
                onClick={endSession}
                class="chatbot-button text-xs font-semibold rounded px-2 py-1 transition-colors duration-200 shadow-sm"
                style={{
                  'background-color': 'var(--chatbot-button-bg-color)',
                  color: 'var(--chatbot-button-color)',
                }}
              >
                End
              </button>
            </div>
          </div>
        ) : !isLoadingSession() ? (
          <div class="h-full w-full flex justify-center items-center">{/* ... (loading content) */}</div>
        ) : (
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
        )}
      </div>
    </div>
  );
}
