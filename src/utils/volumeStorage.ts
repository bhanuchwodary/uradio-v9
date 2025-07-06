
import { STORAGE_KEYS, AUDIO_CONFIG } from "@/constants/app";
import { logger } from "@/utils/logger";

export const getVolumePreference = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VOLUME);
    if (stored !== null) {
      const volume = parseFloat(stored);
      if (!isNaN(volume) && volume >= AUDIO_CONFIG.MIN_VOLUME && volume <= AUDIO_CONFIG.MAX_VOLUME) {
        return volume;
      }
    }
  } catch (error) {
    logger.warn('Failed to get volume preference from localStorage', error);
  }
  
  return AUDIO_CONFIG.DEFAULT_VOLUME;
};

export const saveVolumePreference = (volume: number): boolean => {
  try {
    if (volume < AUDIO_CONFIG.MIN_VOLUME || volume > AUDIO_CONFIG.MAX_VOLUME) {
      logger.warn('Invalid volume value, not saving', { volume });
      return false;
    }
    
    localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    logger.debug('Volume preference saved', { volume });
    return true;
  } catch (error) {
    logger.error('Failed to save volume preference to localStorage', error);
    return false;
  }
};
