import { createSignal, onCleanup, onMount } from 'solid-js';

interface AvatarVideoProps {
  class?: string;
  width?: string;
  height?: string;
  stream?: MediaStream | null;
}

export const AvatarVideo = (props: AvatarVideoProps) => {
  let videoRef: HTMLVideoElement | undefined;

  // Function to handle new media stream
  const handleStreamUpdate = () => {
    if (videoRef && props.stream) {
      videoRef.srcObject = props.stream;
    }
  };

  onMount(() => {
    handleStreamUpdate();
    if (videoRef) {
      videoRef.addEventListener('loadedmetadata', () => {
        videoRef?.play().catch((error) => {
          console.error('[AvatarVideo] Error playing video:', error);
        });
      });
    }
  });

  onCleanup(() => {
    if (videoRef) {
      videoRef.srcObject = null;
    }
  });

  return (
    <video
      ref={videoRef}
      class={`w-full h-full object-cover ${props.class || ''}`}
      style={{
        width: props.width || '100%',
        height: props.height || '100%',
      }}
      autoplay
      playsinline
      muted
    />
  );
};

export type { AvatarVideoProps };
