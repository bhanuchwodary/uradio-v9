import { useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Track } from '@/types/track';
import { saveLastPlayedState, getLastPlayedState } from '@/utils/lastPlayedStorage';
import { logger } from '@/utils/logger';

interface UseBluetoothAutoResumeProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  onResumePlayback: (track: Track, volume: number) => void;
}

export const useBluetoothAutoResume = ({
  currentTrack,
  isPlaying,
  volume,
  currentTime,
  onResumePlayback
}: UseBluetoothAutoResumeProps) => {
  const lastSaveTime = useRef<number>(0);
  const bluetoothConnectedRef = useRef<boolean>(false);

  // Save last played state periodically when playing
  useEffect(() => {
    if (currentTrack && isPlaying) {
      const now = Date.now();
      // Save every 5 seconds to avoid excessive localStorage writes
      if (now - lastSaveTime.current > 5000) {
        saveLastPlayedState(currentTrack, isPlaying, volume, currentTime);
        lastSaveTime.current = now;
      }
    }
  }, [currentTrack, isPlaying, volume, currentTime]);

  // Check for Bluetooth connections
  const checkBluetoothConnection = useCallback(async () => {
    try {
      // For web browsers, use Web Bluetooth API if available
      if (!Capacitor.isNativePlatform() && 'bluetooth' in navigator) {
        // Check if any bluetooth devices are connected by trying to get available devices
        const devices = await (navigator as any).bluetooth?.getDevices?.() || [];
        const hasConnectedDevice = devices.some((device: any) => device.gatt?.connected);
        
        if (hasConnectedDevice && !bluetoothConnectedRef.current) {
          logger.info('Bluetooth device connected, checking for auto-resume');
          handleBluetoothConnection();
        }
        
        bluetoothConnectedRef.current = hasConnectedDevice;
        return;
      }

      // For native platforms, we can listen to audio route changes
      if (Capacitor.isNativePlatform()) {
        // Listen for audio route changes (includes Bluetooth connections)
        const checkAudioRoute = () => {
          // This would typically use a Capacitor plugin for audio routing
          // For now, we'll use a fallback approach with focus events
          logger.debug('Checking for audio route changes (Bluetooth)');
        };
        
        // Add event listeners for audio session changes
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            // When app becomes visible, check if we should auto-resume
            setTimeout(() => {
              const lastPlayed = getLastPlayedState();
              if (lastPlayed?.track && lastPlayed.isPlaying) {
                logger.info('App became visible, checking for auto-resume');
                handleBluetoothConnection();
              }
            }, 1000);
          }
        });
      }
    } catch (error) {
      logger.warn('Error checking Bluetooth connection:', error);
    }
  }, []);

  const handleBluetoothConnection = useCallback(() => {
    const lastPlayed = getLastPlayedState();
    
    if (lastPlayed?.track && lastPlayed.isPlaying && !currentTrack) {
      logger.info('Auto-resuming last played track on Bluetooth connection:', lastPlayed.track.name);
      onResumePlayback(lastPlayed.track, lastPlayed.volume);
    }
  }, [currentTrack, onResumePlayback]);

  // Set up Bluetooth detection on mount
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const startBluetoothMonitoring = async () => {
      // Initial check
      await checkBluetoothConnection();
      
      // For web, periodically check for Bluetooth connections
      if (!Capacitor.isNativePlatform()) {
        intervalId = setInterval(checkBluetoothConnection, 3000);
      }
    };

    startBluetoothMonitoring();

    // Add media session handlers for when audio is controlled externally
    if ('mediaSession' in navigator) {
      const mediaSession = navigator.mediaSession;
      
      const originalPlay = mediaSession.setActionHandler.bind(mediaSession);
      mediaSession.setActionHandler('play', () => {
        // When play is triggered externally (like from Bluetooth), check for auto-resume
        if (!currentTrack) {
          const lastPlayed = getLastPlayedState();
          if (lastPlayed?.track) {
            logger.info('External play triggered, auto-resuming last track');
            onResumePlayback(lastPlayed.track, lastPlayed.volume);
            return;
          }
        }
        // If we have a current track, let the normal handler take over
      });
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkBluetoothConnection, onResumePlayback, currentTrack]);

  // Listen for audio device changes (works on most modern browsers)
  useEffect(() => {
    const handleDeviceChange = () => {
      logger.debug('Audio device change detected');
      // Small delay to allow device to fully connect
      setTimeout(checkBluetoothConnection, 500);
    };

    if ('mediaDevices' in navigator) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [checkBluetoothConnection]);
};