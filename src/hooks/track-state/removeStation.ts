
import { Track } from "@/types/track";

export const removeTrackByIndex = (
  tracks: Track[], 
  index: number, 
  currentIndex: number
): { tracks: Track[], newCurrentIndex: number, shouldStopPlaying: boolean } => {
  // Create a new array to ensure state updates are detected
  const newTracks = [...tracks];
  newTracks.splice(index, 1);
  
  let newCurrentIndex = currentIndex;
  let shouldStopPlaying = false;
  
  if (index === currentIndex) {
    if (newTracks.length > 0) {
      newCurrentIndex = Math.min(currentIndex, newTracks.length - 1);
    } else {
      newCurrentIndex = 0;
      shouldStopPlaying = true;
    }
  } else if (index < currentIndex) {
    newCurrentIndex = currentIndex - 1;
  }
  
  return { tracks: newTracks, newCurrentIndex, shouldStopPlaying };
};

export const removeStationByValue = (
  tracks: Track[], 
  station: Track
): Track[] => {
  const index = tracks.findIndex(
    track => track.url === station.url && track.name === station.name
  );
  
  if (index !== -1) {
    // Create a new array to ensure state updates are detected
    const newTracks = [...tracks];
    newTracks.splice(index, 1);
    return newTracks;
  }
  
  return tracks;
};
