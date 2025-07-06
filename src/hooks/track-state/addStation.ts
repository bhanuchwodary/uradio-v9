
import { Track } from "@/types/track";

export const addStationUrl = (
  url: string,
  name: string = "",
  isFeatured: boolean = false,
  isFavorite: boolean = false,
  currentTracks: Track[],
  language: string = ""
): { tracks: Track[], result: { success: boolean, message: string } } => {
  const trimmedUrl = url.trim();
  const trimmedName = name.trim();
  
  if (!trimmedUrl) {
    return {
      tracks: currentTracks,
      result: { success: false, message: "URL is required" }
    };
  }

  if (!trimmedName) {
    return {
      tracks: currentTracks,
      result: { success: false, message: "Station name is required" }
    };
  }

  // Check for duplicates
  const exists = currentTracks.some(track => 
    track.url.toLowerCase() === trimmedUrl.toLowerCase()
  );
  
  if (exists) {
    return {
      tracks: currentTracks,
      result: { success: false, message: "Station already exists" }
    };
  }

  // Create new station without triggering any playback
  const newTrack: Track = {
    url: trimmedUrl,
    name: trimmedName,
    isFeatured,
    isFavorite,
    language: language.trim(),
    playTime: 0
  };

  const updatedTracks = [...currentTracks, newTrack];
  
  console.log("Station added successfully without auto-playback:", {
    name: trimmedName,
    url: trimmedUrl,
    totalStations: updatedTracks.length
  });

  return {
    tracks: updatedTracks,
    result: { success: true, message: "Station added successfully" }
  };
};
