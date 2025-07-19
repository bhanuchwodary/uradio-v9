
import Hls from "hls.js";

type AudioInstanceType = {
  element: HTMLAudioElement | null;
  hls: Hls | null;
  activePlayerInstance: React.MutableRefObject<symbol> | null;
  isInitialized: boolean;
  currentUrl: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  navigationInProgress: boolean;
  explicitlyPaused: boolean;
  shouldPlayAfterInterruption: boolean;
  interruptionSource: 'none' | 'app-state' | 'media-session' | 'audio-interruption' | 'phone-call';
  interruptionStartTime: number | null;
  retryAttempts: number;
};

// Maintains a shared audio and HLS context across the app
export const globalAudioRef: AudioInstanceType = {
  element: null,
  hls: null,
  activePlayerInstance: null,
  isInitialized: false,
  currentUrl: null,
  isPlaying: false,
  isPaused: false,
  navigationInProgress: false,
  explicitlyPaused: false,
  shouldPlayAfterInterruption: false,
  interruptionSource: 'none',
  interruptionStartTime: null,
  retryAttempts: 0
};

// Helper function to update global playback state with navigation awareness
export const updateGlobalPlaybackState = (
  isPlaying: boolean, 
  isPaused: boolean = false, 
  isExplicitPause: boolean = false
) => {
  globalAudioRef.isPlaying = isPlaying;
  globalAudioRef.isPaused = isPaused;
  
  // Only update explicit pause state if it's actually an explicit action
  if (isExplicitPause) {
    globalAudioRef.explicitlyPaused = isPaused;
  }
  
  console.log("Global playback state updated:", { 
    isPlaying, 
    isPaused, 
    explicitlyPaused: globalAudioRef.explicitlyPaused,
    navigationInProgress: globalAudioRef.navigationInProgress
  });
};

// Helper to manage navigation state
export const setNavigationState = (inProgress: boolean) => {
  globalAudioRef.navigationInProgress = inProgress;
  console.log("Navigation state updated:", { navigationInProgress: inProgress });
};

// Helper to check if playback should resume after navigation
export const shouldResumeAfterNavigation = (): boolean => {
  const shouldResume = !globalAudioRef.explicitlyPaused && 
                      !globalAudioRef.navigationInProgress;
  console.log("Should resume after navigation:", { 
    shouldResume,
    explicitlyPaused: globalAudioRef.explicitlyPaused,
    navigationInProgress: globalAudioRef.navigationInProgress
  });
  return shouldResume;
};

// CRITICAL FIX: New helper to reset audio state for user-initiated actions
export const resetAudioStateForUserAction = () => {
  globalAudioRef.explicitlyPaused = false;
  globalAudioRef.navigationInProgress = false;
  globalAudioRef.isPaused = false;
  console.log("Audio state reset for user action");
};

// CRITICAL FIX: Helper to check if we should allow immediate playback
export const shouldAllowImmediatePlayback = (): boolean => {
  // Allow immediate playback if not explicitly paused and not in middle of navigation
  const shouldAllow = !globalAudioRef.explicitlyPaused;
  console.log("Should allow immediate playback:", { 
    shouldAllow,
    explicitlyPaused: globalAudioRef.explicitlyPaused
  });
  return shouldAllow;
};

// Enhanced interruption management
export const setInterruptionState = (
  source: 'none' | 'app-state' | 'media-session' | 'audio-interruption' | 'phone-call',
  interrupted: boolean
) => {
  if (interrupted) {
    globalAudioRef.interruptionSource = source;
    globalAudioRef.interruptionStartTime = Date.now();
    globalAudioRef.retryAttempts = 0;
    console.log("Interruption started:", { source, timestamp: globalAudioRef.interruptionStartTime });
  } else {
    globalAudioRef.interruptionSource = 'none';
    globalAudioRef.interruptionStartTime = null;
    globalAudioRef.retryAttempts = 0;
    console.log("Interruption ended:", { source });
  }
};

// Enhanced resume logic with adaptive delays and retry mechanism
export const attemptInterruptionResume = async (
  playFunction: () => Promise<void>,
  maxRetries: number = 3
): Promise<boolean> => {
  if (!globalAudioRef.shouldPlayAfterInterruption || !globalAudioRef.interruptionStartTime) {
    return false;
  }

  const interruptionDuration = Date.now() - globalAudioRef.interruptionStartTime;
  
  // Calculate adaptive delay based on interruption duration and source
  let baseDelay = 500; // Default delay
  
  if (globalAudioRef.interruptionSource === 'phone-call' && interruptionDuration > 30000) {
    baseDelay = 2000; // Longer delay for long calls
  } else if (globalAudioRef.interruptionSource === 'audio-interruption') {
    baseDelay = 1000; // Medium delay for audio interruptions
  }
  
  const delay = baseDelay + (globalAudioRef.retryAttempts * 1000); // Exponential backoff
  
  console.log("Attempting resume with adaptive delay:", {
    source: globalAudioRef.interruptionSource,
    interruptionDuration,
    delay,
    attempt: globalAudioRef.retryAttempts + 1
  });

  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await playFunction();
        setInterruptionState('none', false);
        console.log("Resume successful after interruption");
        resolve(true);
      } catch (error) {
        globalAudioRef.retryAttempts++;
        console.error(`Resume attempt ${globalAudioRef.retryAttempts} failed:`, error);
        
        if (globalAudioRef.retryAttempts < maxRetries) {
          // Retry with longer delay
          const retrySuccess = await attemptInterruptionResume(playFunction, maxRetries);
          resolve(retrySuccess);
        } else {
          console.error("Max retry attempts reached, giving up resume");
          setInterruptionState('none', false);
          resolve(false);
        }
      }
    }, delay);
  });
};
