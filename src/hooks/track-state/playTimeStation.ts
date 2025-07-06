
import { Track } from "@/types/track";

export const updateTrackPlayTime = (
  tracks: Track[], 
  index: number, 
  seconds: number
): Track[] => {
  // Create a new array to ensure state updates are detected
  const newTracks = JSON.parse(JSON.stringify(tracks));
  if (newTracks[index]) {
    newTracks[index] = {
      ...newTracks[index],
      playTime: (newTracks[index].playTime || 0) + seconds
    };
  }
  return newTracks;
};
