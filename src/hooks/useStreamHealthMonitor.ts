import { useEffect, useRef, useCallback } from 'react';
import { globalAudioRef } from '@/components/music-player/audioInstance';
import { logger } from '@/utils/logger';

interface UseStreamHealthMonitorProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrack: any;
  onRetryRequired: () => void;
}

export const useStreamHealthMonitor = ({
  isPlaying,
  setIsPlaying,
  currentTrack,
  onRetryRequired
}: UseStreamHealthMonitorProps) => {
  const lastTimeUpdateRef = useRef<number>(0);
  const stallDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const networkCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bufferHealthIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stallCountRef = useRef<number>(0);
  const lastPositionRef = useRef<number>(0);
  const consecutiveStallsRef = useRef<number>(0);

  const MAX_STALL_TIME = 10000; // 10 seconds without progress
  const MAX_CONSECUTIVE_STALLS = 3;
  const NETWORK_CHECK_INTERVAL = 5000; // Check network every 5 seconds
  const BUFFER_CHECK_INTERVAL = 2000; // Check buffer health every 2 seconds

  // Reset stall detection when track changes or playback stops
  const resetStallDetection = useCallback(() => {
    if (stallDetectionTimeoutRef.current) {
      clearTimeout(stallDetectionTimeoutRef.current);
      stallDetectionTimeoutRef.current = null;
    }
    lastTimeUpdateRef.current = Date.now();
    stallCountRef.current = 0;
    lastPositionRef.current = 0;
    consecutiveStallsRef.current = 0;
    logger.debug("Stream health monitor reset");
  }, []);

  // Detect if playback has stalled
  const detectStall = useCallback(() => {
    const audio = globalAudioRef.element;
    if (!audio || !isPlaying || !currentTrack) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastTimeUpdateRef.current;
    const currentPosition = audio.currentTime;

    // Check if position hasn't changed and we should be playing
    if (currentPosition === lastPositionRef.current && 
        !audio.paused && 
        !audio.ended && 
        timeSinceLastUpdate > MAX_STALL_TIME) {
      
      consecutiveStallsRef.current++;
      logger.warn(`Stalled playback detected (${consecutiveStallsRef.current}/${MAX_CONSECUTIVE_STALLS})`, {
        position: currentPosition,
        timeSinceUpdate: timeSinceLastUpdate,
        networkState: audio.networkState,
        readyState: audio.readyState
      });

      if (consecutiveStallsRef.current >= MAX_CONSECUTIVE_STALLS) {
        logger.error("Max consecutive stalls reached, triggering recovery");
        resetStallDetection();
        onRetryRequired();
        return;
      }

      // Try to recover from single stall
      try {
        audio.load();
        setTimeout(() => {
          if (audio && !audio.paused) {
            audio.play().catch(error => {
              logger.error("Failed to resume after stall recovery:", error);
              onRetryRequired();
            });
          }
        }, 1000);
      } catch (error) {
        logger.error("Error during stall recovery:", error);
        onRetryRequired();
      }
    }

    lastPositionRef.current = currentPosition;
  }, [isPlaying, currentTrack, onRetryRequired, resetStallDetection]);

  // Monitor network connectivity
  const checkNetworkHealth = useCallback(() => {
    const audio = globalAudioRef.element;
    if (!audio || !isPlaying || !currentTrack) return;

    // Check if we're in a network error state
    if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE ||
        audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      logger.warn("Network issue detected", {
        networkState: audio.networkState,
        readyState: audio.readyState,
        error: audio.error
      });

      // Try to recover
      try {
        audio.load();
        setTimeout(() => {
          if (audio && isPlaying) {
            audio.play().catch(error => {
              logger.error("Failed to recover from network issue:", error);
              onRetryRequired();
            });
          }
        }, 2000);
      } catch (error) {
        logger.error("Error during network recovery:", error);
        onRetryRequired();
      }
    }

    // Check online status
    if (!navigator.onLine) {
      logger.warn("Device is offline");
      setIsPlaying(false);
    }
  }, [isPlaying, currentTrack, setIsPlaying, onRetryRequired]);

  // Monitor buffer health
  const checkBufferHealth = useCallback(() => {
    const audio = globalAudioRef.element;
    if (!audio || !isPlaying || !currentTrack) return;

    try {
      const buffered = audio.buffered;
      const currentTime = audio.currentTime;
      
      if (buffered.length > 0) {
        let bufferAhead = 0;
        for (let i = 0; i < buffered.length; i++) {
          if (buffered.start(i) <= currentTime && buffered.end(i) > currentTime) {
            bufferAhead = buffered.end(i) - currentTime;
            break;
          }
        }

        // If we have very little buffer ahead and we're supposed to be playing
        if (bufferAhead < 1 && !audio.paused && audio.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
          logger.debug("Low buffer detected, may need intervention", {
            bufferAhead,
            readyState: audio.readyState,
            networkState: audio.networkState
          });
        }
      }
    } catch (error) {
      logger.debug("Buffer check failed (normal for some streams):", error);
    }
  }, [isPlaying, currentTrack]);

  // Set up time update monitoring
  useEffect(() => {
    const audio = globalAudioRef.element;
    if (!audio) return;

    const handleTimeUpdate = () => {
      lastTimeUpdateRef.current = Date.now();
      consecutiveStallsRef.current = 0; // Reset stall count on successful time update
    };

    const handleError = (event: Event) => {
      const audio = event.currentTarget as HTMLAudioElement;
      logger.error("Audio error detected in health monitor", {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState
      });
      
      // Trigger recovery for certain error types
      if (audio.error && (
        audio.error.code === MediaError.MEDIA_ERR_NETWORK ||
        audio.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
      )) {
        onRetryRequired();
      }
    };

    const handleStalled = () => {
      logger.warn("Stalled event fired");
      detectStall();
    };

    const handleSuspend = () => {
      logger.debug("Suspend event fired - normal for live streams");
    };

    const handleAbort = () => {
      logger.warn("Abort event fired");
      if (isPlaying && currentTrack) {
        setTimeout(() => onRetryRequired(), 1000);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);
    audio.addEventListener('abort', handleAbort);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
      audio.removeEventListener('abort', handleAbort);
    };
  }, [detectStall, onRetryRequired, isPlaying, currentTrack]);

  // Set up monitoring intervals when playing
  useEffect(() => {
    if (isPlaying && currentTrack) {
      // Start stall detection
      stallDetectionTimeoutRef.current = setTimeout(detectStall, MAX_STALL_TIME);
      
      // Start network monitoring
      networkCheckIntervalRef.current = setInterval(checkNetworkHealth, NETWORK_CHECK_INTERVAL);
      
      // Start buffer monitoring
      bufferHealthIntervalRef.current = setInterval(checkBufferHealth, BUFFER_CHECK_INTERVAL);
      
      lastTimeUpdateRef.current = Date.now();
      
      logger.debug("Stream health monitoring started");
    } else {
      resetStallDetection();
      
      if (networkCheckIntervalRef.current) {
        clearInterval(networkCheckIntervalRef.current);
        networkCheckIntervalRef.current = null;
      }
      
      if (bufferHealthIntervalRef.current) {
        clearInterval(bufferHealthIntervalRef.current);
        bufferHealthIntervalRef.current = null;
      }
      
      logger.debug("Stream health monitoring stopped");
    }

    return () => {
      if (stallDetectionTimeoutRef.current) {
        clearTimeout(stallDetectionTimeoutRef.current);
      }
      if (networkCheckIntervalRef.current) {
        clearInterval(networkCheckIntervalRef.current);
      }
      if (bufferHealthIntervalRef.current) {
        clearInterval(bufferHealthIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrack, detectStall, checkNetworkHealth, checkBufferHealth, resetStallDetection]);

  // Reset when track changes
  useEffect(() => {
    resetStallDetection();
  }, [currentTrack, resetStallDetection]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      logger.info("Device came back online");
      if (currentTrack && globalAudioRef.shouldPlayAfterInterruption) {
        setTimeout(() => onRetryRequired(), 1000);
      }
    };

    const handleOffline = () => {
      logger.warn("Device went offline");
      setIsPlaying(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentTrack, setIsPlaying, onRetryRequired]);
};