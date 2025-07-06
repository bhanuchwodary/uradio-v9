
interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  duration: number;
  position: number;
  artworkUrl: string;
}

interface AndroidAutoCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSeek: (position: number) => void;
}

class AndroidAutoService {
  private initialized = false;
  private callbacks: AndroidAutoCallbacks | null = null;
  private currentTrackInfo: TrackInfo | null = null;

  async initialize() {
    try {
      // Check if we're in a Capacitor environment
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Media')) {
        console.log("Android Auto service initializing with Capacitor Media plugin");
        this.initialized = true;
        return;
      }
    } catch (err) {
      // If import fails or plugin isn't available, fall back to web implementation
    }
    
    // Web fallback implementation (no-op for most functions)
    console.log("Android Auto service initialized with web fallback");
    this.initialized = true;
  }

  registerCallbacks(callbacks: AndroidAutoCallbacks) {
    this.callbacks = callbacks;
    console.log("Android Auto callbacks registered");
    return true;
  }

  async updateTrackInfo(trackInfo: TrackInfo) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Store the current track info
    this.currentTrackInfo = trackInfo;
    
    // Log for debugging
    console.log("Updated media session metadata for notifications:", trackInfo);
    
    // Only try to update native notification if we're on a native platform
    try {
      const { Capacitor } = await import('@capacitor/core');
      
      if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Media')) {
        // This would be implemented when the native plugin is properly configured
        console.log("Native media notification would be updated here");
      }
    } catch (err) {
      // Silently fail on web platforms
    }
    
    return true;
  }

  async updatePlaybackState(isPlaying: boolean) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Log the state change
    console.log("Updated Android Auto playback state:", isPlaying ? "playing" : "paused");
    
    // If we have current track info, make sure the notification shows the correct info
    if (isPlaying && this.currentTrackInfo) {
      // If starting playback, make sure notification has updated info
      this.updateTrackInfo(this.currentTrackInfo);
    }
    
    // Only try to update native notification if we're on a native platform
    try {
      const { Capacitor } = await import('@capacitor/core');
      
      if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Media')) {
        // This would be implemented when the native plugin is properly configured
        console.log("Native media notification playback state would be updated here");
      }
    } catch (err) {
      // Silently fail on web platforms
    }
    
    return true;
  }

  async cleanup() {
    this.callbacks = null;
    this.currentTrackInfo = null;
    console.log("Android Auto service cleaned up");
    return true;
  }
}

export default new AndroidAutoService();
