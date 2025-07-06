import { Track } from "@/types/track";

export const editTrackInfo = (
  tracks: Track[],
  index: number,
  data: { url: string; name: string; language?: string }
): Track[] => {
  if (index < 0 || index >= tracks.length) {
    console.error("Invalid track index for edit:", index);
    return tracks;
  }

  const updatedTracks = [...tracks];
  const existingTrack = updatedTracks[index];
  
  updatedTracks[index] = {
    ...existingTrack,
    url: data.url,
    name: data.name,
    // CRITICAL: Preserve language from data if provided, otherwise keep existing
    language: data.language !== undefined ? data.language : (existingTrack.language || "Unknown")
  };

  console.log("Track edited with language:", { 
    name: updatedTracks[index].name, 
    language: updatedTracks[index].language 
  });

  return updatedTracks;
};

export const editStationByValue = (
  tracks: Track[],
  originalStation: Track,
  data: { url: string; name: string; language?: string }
): Track[] => {
  const index = tracks.findIndex(track => 
    track.url === originalStation.url && 
    track.name === originalStation.name
  );

  if (index === -1) {
    console.error("Station not found for edit:", originalStation);
    return tracks;
  }

  return editTrackInfo(tracks, index, data);
};
