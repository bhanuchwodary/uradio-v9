
import { getFeaturedStations } from "@/utils/featuredStationsManager";

/**
 * Get the current stations list - either from the featured stations manager
 * (which checks localStorage first) or from the default featured list.
 */
export const getStations = () => {
  console.log("Loading featured stations");
  const stations = getFeaturedStations();
  console.log(`Loaded ${stations.length} stations`);
  return stations;
};
