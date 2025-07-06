
import { featuredStations } from "@/data/featuredStations";

const FEATURED_STATIONS_KEY = "featured_stations";

export const getFeaturedStations = () => {
  try {
    const stored = localStorage.getItem(FEATURED_STATIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Failed to load featured stations from localStorage:", error);
  }
  
  return featuredStations;
};

export const saveFeaturedStations = (stations: typeof featuredStations) => {
  try {
    localStorage.setItem(FEATURED_STATIONS_KEY, JSON.stringify(stations));
    return true;
  } catch (error) {
    console.error("Failed to save featured stations:", error);
    return false;
  }
};
