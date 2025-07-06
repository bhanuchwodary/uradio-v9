
import { logger } from "@/utils/logger";
import { STORAGE_KEYS } from "@/constants/app";

export const getRandomModePreference = (): boolean => {
  try {
    const storedRandomMode = localStorage.getItem(STORAGE_KEYS.RANDOM_MODE);
    if (storedRandomMode !== null) {
      const randomMode = JSON.parse(storedRandomMode);
      logger.debug("Random mode preference loaded", { randomMode });
      return randomMode;
    }
    logger.debug("No random mode preference found, using default: false");
    return false;
  } catch (error) {
    logger.error("Failed to load random mode preference", error);
    return false;
  }
};

export const saveRandomModePreference = (randomMode: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RANDOM_MODE, JSON.stringify(randomMode));
    logger.debug("Random mode preference saved", { randomMode });
  } catch (error) {
    logger.error("Failed to save random mode preference", error);
  }
};
