import { createSignal, onCleanup, onMount } from 'solid-js';

interface AvatarVideoProps {
  class?: string;
  width?: string;
  height?: string;
  stream?: MediaStream | CustomEvent | null;
}

// WebGL shader for chroma key effect
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  
  // Convert RGB to HSV
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }
  
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    vec3 hsv = rgb2hsv(color.rgb);
    
    // Define the target green in HSV
    // Hue: ~120° (in normalized form, that's 0.33)
    float targetHue = 0.33;
    
    // Calculate how "green" the pixel is
    float hueDiff = abs(hsv.x - targetHue);
    hueDiff = min(hueDiff, 1.0 - hueDiff); // Handle hue wrapping
    
    // Adjust these parameters to fine-tune the keying
    float hueThreshold = 0.15;    // How close to green hue
    float satThreshold = 0.3;     // Minimum saturation to consider
    float valueThreshold = 0.2;   // Minimum brightness to consider
    
    // Calculate the mask based on HSV components
    float hueMask = 1.0 - smoothstep(0.0, hueThreshold, hueDiff);
    float satMask = smoothstep(satThreshold, 0.8, hsv.y);
    float valMask = smoothstep(valueThreshold, 0.8, hsv.z);
    
    // Combine the masks
    float mask = hueMask * satMask * valMask;
    
    // Smooth the edges
    float smoothness = 0.05;
    mask = 1.0 - smoothstep(0.0, smoothness, mask);
    
    // Apply the mask with edge refinement
    gl_FragColor = vec4(color.rgb, color.a * mask);
    
    // Reduce any remaining green tint
    if (mask < 0.5) {
      vec3 desaturated = vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114)));
      gl_FragColor.rgb = mix(color.rgb, desaturated, 1.0 - mask);
    }
  }
`;

export const AvatarVideo = (props: AvatarVideoProps) => {
  let videoRef: HTMLVideoElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let glRef: WebGLRenderingContext | null = null;
  let animationFrameId: number;

  // Function to create and compile a shader
  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  };

  // Function to initialize WebGL
  const initWebGL = () => {
    if (!canvasRef) return;
    
    // Enable alpha channel handling
    glRef = canvasRef.getContext('webgl', { 
      premultipliedAlpha: false,
      alpha: true
    });
    if (!glRef) {
      console.error('WebGL not supported');
      return;
    }

    const gl = glRef;

    // Enable transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    
    gl.useProgram(program);

    // Set up buffers
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0,
    ]);

    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Texture coordinate buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Create and set up texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };

  // Function to render the video frame with chroma key effect
  const render = () => {
    if (!glRef || !videoRef || !canvasRef || !videoRef.videoWidth) {
      animationFrameId = requestAnimationFrame(render);
      return;
    }

    const gl = glRef;

    // Update canvas size if needed
    if (canvasRef.width !== videoRef.videoWidth || canvasRef.height !== videoRef.videoHeight) {
      canvasRef.width = videoRef.videoWidth;
      canvasRef.height = videoRef.videoHeight;
      gl.viewport(0, 0, videoRef.videoWidth, videoRef.videoHeight);
    }

    // Clear with zero alpha
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Enable blending for this frame
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Update texture with new video frame
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoRef);

    // Draw the frame
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animationFrameId = requestAnimationFrame(render);
  };

  // Function to extract MediaStream from prop
  const getMediaStream = (streamProp: MediaStream | CustomEvent | null | undefined): MediaStream | null => {
    if (!streamProp) return null;
    
    if (streamProp instanceof MediaStream) {
      return streamProp;
    }
    
    if (streamProp instanceof CustomEvent && streamProp.detail instanceof MediaStream) {
      return streamProp.detail;
    }
    
    return null;
  };

  // Function to handle new media stream
  const handleStreamUpdate = () => {
    console.log('[AvatarVideo] Handling stream update:', {
      hasVideoRef: !!videoRef,
      hasStream: !!props.stream,
      streamType: props.stream ? props.stream.constructor.name : 'undefined'
    });

    if (!videoRef) {
      console.log('[AvatarVideo] No video reference available');
      return;
    }

    const mediaStream = getMediaStream(props.stream);
    
    if (!mediaStream) {
      console.log('[AvatarVideo] No valid MediaStream available');
      return;
    }

    try {
      // Log stream details
      const audioTracks = mediaStream.getAudioTracks();
      console.log('[AvatarVideo] Stream details:', {
        active: mediaStream.active,
        id: mediaStream.id,
        audioTracks: audioTracks.map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label,
          id: track.id
        })),
        videoTracks: mediaStream.getVideoTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        }))
      });

      // Assign stream to video element
      videoRef.srcObject = mediaStream;
      console.log('[AvatarVideo] Successfully set stream to video element');
      
      // Set audio track enabled
      audioTracks.forEach(track => {
        track.enabled = true;
        console.log('[AvatarVideo] Enabled audio track:', track.label);
      });
    } catch (error) {
      console.error('[AvatarVideo] Error handling stream:', error);
    }
  };

  onMount(() => {
    console.log('[AvatarVideo] Component mounted');
    handleStreamUpdate();
    
    if (videoRef) {
      videoRef.addEventListener('loadedmetadata', () => {
        console.log('[AvatarVideo] Video metadata loaded, attempting playback');
        if (videoRef) {
          videoRef.volume = 1.0; // Ensure volume is up
          videoRef.play().catch((error) => {
            console.error('[AvatarVideo] Error playing video:', error);
          });
        }
      });

      // Initialize WebGL after video is ready
      videoRef.addEventListener('canplay', () => {
        if (!glRef) {
          initWebGL();
          render();
        }
      });

      videoRef.addEventListener('error', (e) => {
        console.error('[AvatarVideo] Video element error:', videoRef?.error);
      });
    }
  });

  onCleanup(() => {
    console.log('[AvatarVideo] Component cleaning up');
    cancelAnimationFrame(animationFrameId);
    
    if (videoRef?.srcObject) {
      try {
        const stream = videoRef.srcObject as MediaStream;
        if (stream instanceof MediaStream) {
          stream.getTracks().forEach(track => {
            console.log('[AvatarVideo] Stopping track:', track.kind);
            track.stop();
          });
        }
        videoRef.srcObject = null;
      } catch (error) {
        console.error('[AvatarVideo] Error during cleanup:', error);
      }
    }
  });

  return (
    <div class="w-full bg-transparent" style={{ 
      height: '400px', 
      'min-height': '400px',
      'background-color': 'transparent'
    }}>
      <video
        ref={videoRef}
        class="hidden"
        autoplay
        playsinline
      />
      <canvas
        ref={canvasRef}
        class={`w-full h-full object-contain ${props.class || ''}`}
        style={{
          width: props.width || '100%',
          height: props.height || '100%',
          'background-color': 'transparent'
        }}
      />
    </div>
  );
};

export type { AvatarVideoProps };
