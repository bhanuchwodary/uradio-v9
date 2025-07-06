
class AudioWakeLockService {
  private wakeLock: any = null;

  async requestWakeLock() {
    try {
      // Try to use the Navigator Wake Lock API if available
      if ('wakeLock' in navigator) {
        // @ts-ignore - TypeScript might not have the wakeLock type yet
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Audio Wake Lock is active');
      } else {
        console.log('Wake Lock API not supported on this browser');
      }
    } catch (err) {
      console.log('Error requesting wake lock:', err);
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Audio Wake Lock has been released');
      } catch (err) {
        console.log('Error releasing wake lock:', err);
      }
    }
  }
}

export default new AudioWakeLockService();
