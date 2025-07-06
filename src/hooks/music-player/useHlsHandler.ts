
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef, updateGlobalPlaybackState } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { detectStreamType, configureAudioForStream, handleDirectStreamError } from "@/utils/streamHandler";

interface UseHlsHandlerProps {
  url: string | undefined;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useHlsHandler = ({
  url,
  isPlaying,
  setIsPlaying,
  setLoading
}: UseHlsHandlerProps) => {
  const hlsRef = useRef<Hls | null>(null);
  const lastUrlRef = useRef<string | undefined>(undefined);
  const retryCountRef = useRef<number>(0);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const loadTimeout = 15000; // 15 seconds timeout for initial load

  useEffect(() => {
    // Ensure global audio element exists
    if (!globalAudioRef.element) {
      const audio = new Audio();
      audio.preload = 'auto';
      globalAudioRef.element = audio;
      logger.debug("Created global audio element in HLS handler");
    }

    const audio = globalAudioRef.element;

    if (!url) {
      // Clear audio when no URL
      if (audio) {
        audio.pause();
        audio.src = "";
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      }
      setIsPlaying(false);
      setLoading(false);
      // Clear any pending timeouts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      return;
    }

    // Only re-configure HLS or change source if URL actually changed
    if (url !== lastUrlRef.current) {
      logger.debug(`URL changed from ${lastUrlRef.current} to ${url}. Re-initializing HLS.`);
      setLoading(true);

      // Clear any existing timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      // Set a timeout for loading
      loadTimeoutRef.current = setTimeout(() => {
        logger.warn("Stream loading timeout reached");
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          logger.info(`Retrying stream load (attempt ${retryCountRef.current}/${maxRetries})`);
          // Trigger a retry by setting the URL again
          lastUrlRef.current = undefined;
        } else {
          logger.error("Max retries reached for stream loading");
          setIsPlaying(false);
          setLoading(false);
          updateGlobalPlaybackState(false, false, false);
        }
      }, loadTimeout);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      audio.src = "";
      audio.load();

      const streamType = detectStreamType(url);
      configureAudioForStream(audio, streamType);

      if (streamType === 'hls' && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxLoadingDelay: 4,
          maxBufferLength: 30,
          maxBufferSize: 60 * 1000 * 1000,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 10
        });
        
        hls.loadSource(url);
        hls.attachMedia(audio);
        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, (event, data) => {
          logger.error("HLS Error:", data);
          if (data.fatal) {
            const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 8000);
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                logger.warn(`HLS network error, retrying in ${backoffDelay}ms...`);
                if (retryCountRef.current < maxRetries) {
                  retryCountRef.current++;
                  setTimeout(() => {
                    hls.recoverMediaError();
                  }, backoffDelay);
                } else {
                  logger.error("Max HLS network retries reached. Stopping playback.");
                  setIsPlaying(false);
                  setLoading(false);
                  updateGlobalPlaybackState(false, false, false);
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                logger.warn(`HLS media error, retrying in ${backoffDelay}ms...`);
                if (retryCountRef.current < maxRetries) {
                  retryCountRef.current++;
                  setTimeout(() => {
                    hls.recoverMediaError();
                  }, backoffDelay);
                } else {
                  logger.error("Max HLS media retries reached. Stopping playback.");
                  setIsPlaying(false);
                  setLoading(false);
                  updateGlobalPlaybackState(false, false, false);
                }
                break;
              default:
                logger.error("Fatal HLS error, destroying HLS instance.", data);
                hls.destroy();
                hlsRef.current = null;
                setIsPlaying(false);
                setLoading(false);
                updateGlobalPlaybackState(false, false, false);
                break;
            }
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          logger.debug("HLS manifest parsed, ready to play");
          setLoading(false);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
          logger.debug("HLS fragment loaded");
          setLoading(false);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
        });

        // Add buffer events for better loading state management
        hls.on(Hls.Events.BUFFER_APPENDED, () => {
          setLoading(false);
        });

      } else {
        // Direct playbook for non-HLS or if HLS is not supported
        audio.src = url;
        audio.load();
        
        const handleError = () => {
          logger.warn("Direct stream error, trying with CORS");
          handleDirectStreamError(audio, setIsPlaying, setLoading, url);
        };
        
        const handleCanPlay = () => {
          logger.debug("Audio can play");
          setLoading(false);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('canplay', handleCanPlay);
        };

        const handleLoadStart = () => {
          logger.debug("Audio load started");
          setLoading(true);
        };

        const handleProgress = () => {
          if (audio.buffered.length > 0) {
            logger.debug("Audio buffering progress");
            setLoading(false);
          }
        };

        audio.addEventListener('error', handleError, { once: true });
        audio.addEventListener('canplay', handleCanPlay, { once: true });
        audio.addEventListener('loadstart', handleLoadStart, { once: true });
        audio.addEventListener('progress', handleProgress);

        // Cleanup function for direct streams
        const cleanup = () => {
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('loadstart', handleLoadStart);
          audio.removeEventListener('progress', handleProgress);
        };

        // Store cleanup for later use
        (audio as any)._directStreamCleanup = cleanup;
      }
      
      lastUrlRef.current = url;
      retryCountRef.current = 0;
    }

    // Handle play/pause based on isPlaying state
    if (isPlaying && audio.paused) {
      logger.debug("Starting playback...");
      audio.play().then(() => {
        logger.debug("Playback started successfully");
        updateGlobalPlaybackState(true, false, false);
      }).catch(error => {
        logger.error("Error starting playback:", error);
        setIsPlaying(false);
        setLoading(false);
        updateGlobalPlaybackState(false, false, false);
      });
    } else if (!isPlaying && !audio.paused) {
      logger.debug("Pausing playback...");
      audio.pause();
      updateGlobalPlaybackState(false, true, true);
    }
  }, [url, isPlaying, setIsPlaying, setLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      // Clean up direct stream listeners
      const audio = globalAudioRef.element;
      if (audio && (audio as any)._directStreamCleanup) {
        (audio as any)._directStreamCleanup();
        (audio as any)._directStreamCleanup = null;
      }
    };
  }, []);
};
