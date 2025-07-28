
import { useEffect, useCallback, useRef } from "react";
import { Track } from "@/types/track";
import { logger } from "@/utils/logger";
import { resetAudioStateForUserAction } from "@/components/music-player/audioInstance";

interface UseEnhancedMediaSessionProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
}

// Detect iOS platform
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const useEnhancedMediaSession = ({
  currentTrack,
  isPlaying,
  volume,
  currentTime,
  duration,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
}: UseEnhancedMediaSessionProps) => {
  const mediaSessionRef = useRef<MediaSession | null>(null);
  const metadataUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize media session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      mediaSessionRef.current = navigator.mediaSession;
      logger.debug("Enhanced media session initialized", { isIOS: isIOS() });
    } else {
      logger.warn("Media Session API not supported");
      return;
    }

    const mediaSession = mediaSessionRef.current;
    if (!mediaSession) return;

    // Set up action handlers with iOS-specific optimization
    const setupActionHandlers = () => {
      try {
        // Core play/pause handlers (essential for all platforms)
        mediaSession.setActionHandler('play', () => {
          logger.debug("Media session: play action triggered");
          resetAudioStateForUserAction(); // Clear any interruption flags
          onPlay();
        });

        mediaSession.setActionHandler('pause', () => {
          logger.debug("Media session: pause action triggered");
          onPause();
        });

        // Stop handler
        mediaSession.setActionHandler('stop', () => {
          logger.debug("Media session: stop action triggered");
          onPause();
        });

        // CRITICAL: Set next/previous handlers FIRST for iOS
        // iOS prioritizes these over seek actions for lock screen display
        mediaSession.setActionHandler('nexttrack', () => {
          logger.debug("Media session: next track action triggered (iOS optimized)");
          onNext();
        });

        mediaSession.setActionHandler('previoustrack', () => {
          logger.debug("Media session: previous track action triggered (iOS optimized)");
          onPrevious();
        });

        // For iOS: Only add seek handlers if explicitly supported and not interfering
        if (onSeek && !isIOS()) {
          // Only add seek handlers on non-iOS platforms to avoid conflicts
          mediaSession.setActionHandler('seekto', (details) => {
            logger.debug("Media session: seek action triggered", details);
            if (details.seekTime !== undefined && details.seekTime !== null) {
              onSeek(details.seekTime);
            }
          });

          mediaSession.setActionHandler('seekbackward', (details) => {
            logger.debug("Media session: seek backward action triggered", details);
            const seekTime = Math.max(0, currentTime - (details.seekOffset || 10));
            onSeek(seekTime);
          });

          mediaSession.setActionHandler('seekforward', (details) => {
            logger.debug("Media session: seek forward action triggered", details);
            const seekTime = Math.min(duration || currentTime + 10, currentTime + (details.seekOffset || 10));
            onSeek(seekTime);
          });
        } else if (isIOS()) {
          // For iOS: Explicitly disable seek handlers to prevent interference
          mediaSession.setActionHandler('seekto', null);
          mediaSession.setActionHandler('seekbackward', null);
          mediaSession.setActionHandler('seekforward', null);
          logger.debug("iOS: Seek handlers disabled to prioritize next/previous track controls");
        }

        logger.debug("Media session action handlers configured successfully", { 
          platform: isIOS() ? 'iOS' : 'Other',
          seekHandlersEnabled: !isIOS() && !!onSeek
        });
      } catch (error) {
        logger.error("Error setting up media session action handlers:", error);
      }
    };

    setupActionHandlers();

    return () => {
      if (mediaSession) {
        try {
          mediaSession.setActionHandler('play', null);
          mediaSession.setActionHandler('pause', null);
          mediaSession.setActionHandler('nexttrack', null);
          mediaSession.setActionHandler('previoustrack', null);
          mediaSession.setActionHandler('stop', null);
          mediaSession.setActionHandler('seekto', null);
          mediaSession.setActionHandler('seekbackward', null);
          mediaSession.setActionHandler('seekforward', null);
        } catch (error) {
          logger.warn("Error cleaning up media session handlers:", error);
        }
      }
    };
  }, [onPlay, onPause, onNext, onPrevious, onSeek, currentTime, duration]);

  // Update metadata when track changes
  useEffect(() => {
    const mediaSession = mediaSessionRef.current;
    if (!mediaSession || !currentTrack) return;

    // Clear any pending metadata updates
    if (metadataUpdateTimeoutRef.current) {
      clearTimeout(metadataUpdateTimeoutRef.current);
    }

    // Debounce metadata updates to prevent rapid changes
    metadataUpdateTimeoutRef.current = setTimeout(() => {
      try {
        mediaSession.metadata = new MediaMetadata({
          title: currentTrack.name || 'Unknown Station',
          artist: 'uRadio',
          album: 'Radio Stations',
          artwork: [
            { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '96x96', type: 'image/png' },
            { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '128x128', type: 'image/png' },
            { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '192x192', type: 'image/png' },
            { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '256x256', type: 'image/png' },
            { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '384x384', type: 'image/png' },
            { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '512x512', type: 'image/png' }
          ]
        });

        logger.debug("Media session metadata updated", {
          title: currentTrack.name,
          artist: 'uRadio',
          platform: isIOS() ? 'iOS' : 'Other'
        });
      } catch (error) {
        logger.error("Error updating media session metadata:", error);
      }
    }, 100);
  }, [currentTrack]);

  // Update playback state
  useEffect(() => {
    const mediaSession = mediaSessionRef.current;
    if (!mediaSession) return;

    try {
      mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      logger.debug("Media session playback state updated:", {
        state: isPlaying ? 'playing' : 'paused',
        platform: isIOS() ? 'iOS' : 'Other'
      });
    } catch (error) {
      logger.error("Error updating playback state:", error);
    }
  }, [isPlaying]);

  // Update position state - iOS-optimized for radio streams
  useEffect(() => {
    const mediaSession = mediaSessionRef.current;
    if (!mediaSession) return;

    try {
      // For radio streams, we typically don't have meaningful duration/position
      // But iOS lock screen works better with basic position info
      if (isIOS()) {
        // For iOS: Set minimal position state to ensure proper lock screen behavior
        mediaSession.setPositionState({
          duration: 0, // Radio streams don't have duration
          position: 0, // Radio streams don't have position
          playbackRate: isPlaying ? 1.0 : 0.0,
        });
        
        logger.debug("iOS Media session position state updated (radio optimized)", {
          playbackRate: isPlaying ? 1.0 : 0.0
        });
      } else if (duration && duration !== Infinity && !isNaN(duration) && duration > 0) {
        // For other platforms: Use full position state when available
        const position = Math.min(currentTime || 0, duration);
        const playbackRate = isPlaying ? 1.0 : 0.0;

        mediaSession.setPositionState({
          duration: duration,
          position: position,
          playbackRate: playbackRate,
        });

        logger.debug("Media session position state updated", {
          duration,
          position,
          playbackRate
        });
      }
    } catch (error) {
      logger.warn("Error updating position state:", error);
    }
  }, [currentTime, duration, isPlaying]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (metadataUpdateTimeoutRef.current) {
        clearTimeout(metadataUpdateTimeoutRef.current);
      }
    };
  }, []);
};
