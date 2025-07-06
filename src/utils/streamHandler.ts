
import { logger } from "@/utils/logger";

export type StreamType = 'hls' | 'direct' | 'vobook';

export interface StreamConfig {
  url: string;
  type: StreamType;
  needsCors?: boolean;
}

export const detectStreamType = (url: string): StreamType => {
  // Detect HLS streams
  if (url.includes('.m3u8')) {
    return 'hls';
  }
  
  // Detect VoBook streams that need CORS
  if (url.includes('vobook')) {
    return 'vobook';
  }
  
  // Default to direct stream
  return 'direct';
};

export const configureAudioForStream = (audio: HTMLAudioElement, streamType: StreamType): void => {
  logger.info("Configuring audio for stream", { 
    type: streamType
  });

  // Configure CORS if needed
  if (streamType === 'vobook' || streamType === 'hls') {
    audio.crossOrigin = 'anonymous';
  } else {
    // Remove crossOrigin attribute for non-CORS streams
    audio.removeAttribute('crossOrigin');
  }

  // Set additional properties for better compatibility and performance
  audio.preload = 'auto';
  
  // Set playsInline for mobile compatibility
  (audio as any).playsInline = true;
  
  // Ensure autoplay is controlled
  audio.autoplay = false;
  
  // Optimize for live streams
  if (streamType === 'hls' || streamType === 'direct') {
    // Set buffer size for better streaming performance
    try {
      // These are browser-specific optimizations
      (audio as any).networkState = HTMLMediaElement.NETWORK_LOADING;
    } catch (error) {
      // Silently ignore if browser doesn't support these properties
    }
  }
};

export const handleDirectStreamError = (
  audio: HTMLAudioElement, 
  setIsPlaying: (playing: boolean) => void, 
  setLoading: (loading: boolean) => void, 
  url: string
): void => {
  logger.warn("Direct stream failed, trying with CORS", { url });
  
  // Try with CORS as fallback
  audio.crossOrigin = 'anonymous';
  audio.load();
  
  // Set a timeout for the CORS retry
  const corsTimeout = setTimeout(() => {
    logger.error("CORS fallback also timed out", { url });
    audio.removeEventListener('error', handleSecondError);
    audio.removeEventListener('canplay', handleSuccess);
    setIsPlaying(false);
    setLoading(false);
  }, 10000); // 10 second timeout for CORS retry
  
  const handleSecondError = () => {
    logger.error("Stream failed even with CORS", { url });
    clearTimeout(corsTimeout);
    audio.removeEventListener('error', handleSecondError);
    audio.removeEventListener('canplay', handleSuccess);
    setIsPlaying(false);
    setLoading(false);
  };
  
  const handleSuccess = () => {
    logger.info("Stream loaded successfully with CORS fallback");
    clearTimeout(corsTimeout);
    audio.removeEventListener('canplay', handleSuccess);
    audio.removeEventListener('error', handleSecondError);
    setLoading(false);
  };
  
  audio.addEventListener('canplay', handleSuccess, { once: true });
  audio.addEventListener('error', handleSecondError, { once: true });
};

// New utility function for creating connection timeout
export const createConnectionTimeout = (
  timeoutMs: number,
  onTimeout: () => void
): (() => void) => {
  const timeoutId = setTimeout(onTimeout, timeoutMs);
  return () => clearTimeout(timeoutId);
};

// Enhanced error recovery with exponential backoff
export const createRetryHandler = (
  maxRetries: number,
  baseDelay: number = 1000
) => {
  let retryCount = 0;
  
  return {
    shouldRetry: () => retryCount < maxRetries,
    getDelay: () => Math.min(baseDelay * Math.pow(2, retryCount), 8000),
    incrementRetry: () => retryCount++,
    reset: () => { retryCount = 0; },
    getRetryCount: () => retryCount
  };
};

// Enhanced stream switching with graceful loading
export const handleStreamSwitch = (
  audio: HTMLAudioElement,
  newUrl: string,
  setLoading: (loading: boolean) => void,
  setIsPlaying: (playing: boolean) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    logger.info("Switching stream", { newUrl });
    setLoading(true);
    
    // Create a timeout for the stream switch
    const switchTimeout = setTimeout(() => {
      logger.warn("Stream switch timeout", { newUrl });
      setLoading(false);
      reject(new Error("Stream switch timeout"));
    }, 15000);
    
    const handleLoadSuccess = () => {
      logger.info("Stream switched successfully", { newUrl });
      clearTimeout(switchTimeout);
      setLoading(false);
      audio.removeEventListener('canplay', handleLoadSuccess);
      audio.removeEventListener('error', handleLoadError);
      resolve();
    };
    
    const handleLoadError = (error: Event) => {
      logger.error("Stream switch failed", { newUrl, error });
      clearTimeout(switchTimeout);
      setLoading(false);
      setIsPlaying(false);
      audio.removeEventListener('canplay', handleLoadSuccess);
      audio.removeEventListener('error', handleLoadError);
      reject(new Error("Stream switch failed"));
    };
    
    // Set up event listeners before changing the source
    audio.addEventListener('canplay', handleLoadSuccess, { once: true });
    audio.addEventListener('error', handleLoadError, { once: true });
    
    // Configure stream and load
    const streamType = detectStreamType(newUrl);
    configureAudioForStream(audio, streamType);
    audio.src = newUrl;
    audio.load();
  });
};
