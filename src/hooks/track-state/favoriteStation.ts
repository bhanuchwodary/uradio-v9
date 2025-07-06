
import { Track } from "@/types/track";

export const toggleTrackFavorite = (
  tracks: Track[], 
  index: number
): Track[] => {
  // Create a new array to ensure state updates are detected
  const newTracks = JSON.parse(JSON.stringify(tracks));
  if (newTracks[index]) {
    const newFavoriteStatus = !newTracks[index].isFavorite;
    newTracks[index] = {
      ...newTracks[index],
      isFavorite: newFavoriteStatus
    };
    console.log(`Toggled favorite status for station at index ${index} to ${newFavoriteStatus}`);
  }
  return newTracks;
};
