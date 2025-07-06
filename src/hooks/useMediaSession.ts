
import { useEffect } from "react";
import androidAutoService from "../services/androidAutoService";
import audioWakeLockService from "../services/audioWakeLockService";
import { Track } from "@/types/track";

interface UseMediaSessionProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  trackDuration: number;
  trackPosition: number;
  setIsPlaying: (playing: boolean) => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSeek: (position: number) => void;
  randomMode?: boolean;
}

export const useMediaSession = ({
  tracks,
  currentIndex,
  isPlaying,
  trackDuration,
  trackPosition,
  setIsPlaying,
  onSkipNext,
  onSkipPrevious,
  onSeek,
  randomMode = false,
}: UseMediaSessionProps) => {
  // Enhanced initialization with uRadio branding and Android Auto service
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await androidAutoService.initialize();
        console.log("Android Auto service initialized");
      } catch (err) {
        console.warn('Error initializing Android Auto service:', err);
      }

      androidAutoService.registerCallbacks({
        onPlay: () => {
          console.log("Android Auto play callback triggered");
          setIsPlaying(true);
        },
        onPause: () => {
          console.log("Android Auto pause callback triggered");
          setIsPlaying(false);
        },
        onSkipNext: () => {
          console.log("Android Auto skip next callback triggered", { randomMode });
          onSkipNext();
        },
        onSkipPrevious: () => {
          console.log("Android Auto skip previous callback triggered", { randomMode });
          onSkipPrevious();
        },
        onSeek: (position) => {
          console.log("Android Auto seek callback triggered:", position);
          onSeek(position);
        },
      });
      
      try {
        await audioWakeLockService.requestWakeLock();
        console.log("Wake lock requested successfully");
      } catch (err) {
        console.warn('Error requesting wake lock:', err);
      }
    };

    initializeServices();
    
    return () => {
      androidAutoService.cleanup().catch(err => 
        console.warn('Error cleaning up Android Auto service:', err)
      );
      audioWakeLockService.releaseWakeLock();
    };
  }, []);

  // Update Android Auto with track information
  useEffect(() => {
    if (tracks.length > 0 && currentIndex < tracks.length) {
      const currentTrack = tracks[currentIndex];
      
      if (currentTrack) {
        const trackInfo = {
          title: currentTrack.name || 'Unknown Station',
          artist: "uRadio",
          album: "Radio Stations",
          duration: trackDuration && trackDuration !== Infinity ? trackDuration : 0,
          position: trackPosition || 0,
          artworkUrl: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png',
        };
        
        console.log("Updating track info for Android Auto with uRadio branding:", trackInfo, { randomMode });
        
        androidAutoService.updateTrackInfo(trackInfo).catch(err => 
          console.warn('Error updating track info:', err)
        );
      }
    }
  }, [tracks, currentIndex, trackDuration, trackPosition, tracks[currentIndex]?.name, randomMode]);

  // Update playback state for Android Auto
  useEffect(() => {
    console.log("Updating Android Auto playback state:", isPlaying ? "playing" : "paused", { randomMode });
    androidAutoService.updatePlaybackState(isPlaying);
    
    if (isPlaying) {
      audioWakeLockService.requestWakeLock().catch(err => 
        console.warn('Error requesting wake lock on play:', err)
      );
    }
  }, [isPlaying, randomMode]);
};
