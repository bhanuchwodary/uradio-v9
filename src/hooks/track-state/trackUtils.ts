
import { Track } from "@/types/track";
import { featuredStations } from "@/data/featuredStations";

export const getUserStations = (tracks: Track[]): Track[] => {
  return tracks.filter(track => !track.isFeatured);
};

export const getTopStations = (tracks: Track[]): Track[] => {
  return [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 5);
};

export const checkIfStationExists = (url: string, tracks: Track[]): { exists: boolean, isUserStation: boolean } => {
  console.log("=== Station Existence Check Debug ===");
  console.log("Checking URL:", url);
  console.log("Total user tracks:", tracks.length);
  console.log("Total featured stations:", featuredStations.length);
  
  // CRITICAL FIX: Ensure case-insensitive comparison and normalize URLs
  const normalizedUrl = url.toLowerCase().trim();
  console.log("Normalized URL:", normalizedUrl);
  
  // Check in user tracks
  const userTracksUrls = tracks
    .filter(track => !track.isFeatured)
    .map(track => track.url.toLowerCase().trim());
  console.log("User tracks URLs:", userTracksUrls);
  
  const existsInUserTracks = userTracksUrls.includes(normalizedUrl);
  console.log("Exists in user tracks:", existsInUserTracks);
  
  if (existsInUserTracks) {
    console.log("=== Found in user tracks ===");
    return { exists: true, isUserStation: true };
  }
  
  // Check in featured stations
  const featuredUrls = featuredStations.map(station => station.url.toLowerCase().trim());
  console.log("Featured stations URLs:", featuredUrls);
  
  const existsInFeatured = featuredUrls.includes(normalizedUrl);
  console.log("Exists in featured stations:", existsInFeatured);
  
  console.log("=== Final result ===");
  console.log("Exists:", existsInFeatured, "Is user station:", false);
  
  return { exists: existsInFeatured, isUserStation: false };
};
