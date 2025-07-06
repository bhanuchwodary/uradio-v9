
import { Track } from "@/types/track";

interface PlaylistPageHandlersProps {
  filteredTracks: Track[];
  sortedPlaylistTracks: Track[];
  currentTrack: Track | null;
  randomMode: boolean;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  removeFromPlaylist: (trackUrl: string) => boolean;
  clearPlaylist: () => number;
  clearCurrentTrack: () => void;
  toggleFavorite: (index: number) => void;
  addUrl: (url: string, name: string, isFeatured: boolean, isFavorite: boolean, language: string) => { success: boolean; message: string };
  updatePlaylistTrackFavorite: (trackUrl: string, isFavorite: boolean) => void;
  tracks: Track[];
  toast: (options: any) => void;
  setEditingStation: (station: Track | null) => void;
  setStationToDelete: (station: Track | null) => void;
  setShowClearDialog: (show: boolean) => void;
}

export const usePlaylistPageHandlers = ({
  filteredTracks,
  sortedPlaylistTracks,
  currentTrack,
  randomMode,
  playTrack,
  togglePlayPause,
  removeFromPlaylist,
  clearPlaylist,
  clearCurrentTrack,
  toggleFavorite,
  addUrl,
  updatePlaylistTrackFavorite,
  tracks,
  toast,
  setEditingStation,
  setStationToDelete,
  setShowClearDialog
}: PlaylistPageHandlersProps) => {
  // Handle selecting a station for playback
  const handleSelectStation = (index: number) => {
    const selectedStation = filteredTracks[index];
    if (selectedStation) {
      console.log("PlaylistPage: User selected station", selectedStation.name, "with random mode:", randomMode);
      console.log("PlaylistPage: Calling playTrack with station:", selectedStation);
      playTrack(selectedStation);
    }
  };

  // Handle play/pause for station cards
  const handleStationCardPlay = (station: Track) => {
    console.log("PlaylistPage: Station card play clicked for:", station.name);
    
    if (currentTrack?.url === station.url) {
      console.log("PlaylistPage: Station is current track, toggling play/pause");
      togglePlayPause();
    } else {
      console.log("PlaylistPage: Playing new station:", station.name);
      playTrack(station);
    }
  };

  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };

  const handleConfirmDelete = (station: Track) => {
    setStationToDelete(station);
  };

  const handleDeleteStation = (stationToDelete: Track | null) => {
    if (stationToDelete) {
      const stationName = stationToDelete.name;
      const isCurrentlyPlaying = currentTrack?.url === stationToDelete.url;
      
      const success = removeFromPlaylist(stationToDelete.url);
      if (success) {
        if (isCurrentlyPlaying) {
          clearCurrentTrack();
        }
        
        toast({
          title: "Station removed from playlist",
          description: `${stationName} has been removed from your playlist`
        });
      }
    }
  };

  const handleToggleFavorite = (station: Track) => {
    console.log("FAVORITES DEBUG: Toggling favorite for:", station.name, "Current state:", station.isFavorite);
    
    let stationIndex = tracks.findIndex(t => t.url === station.url);
    
    if (stationIndex === -1) {
      console.log("FAVORITES DEBUG: Station not found in main library, adding it first");
      
      const addResult = addUrl(
        station.url,
        station.name,
        station.isFeatured || false,
        !station.isFavorite,
        station.language || ""
      );
      
      if (addResult.success) {
        console.log("FAVORITES DEBUG: Successfully added station to main library with favorite state:", !station.isFavorite);
        updatePlaylistTrackFavorite(station.url, !station.isFavorite);
        
        toast({
          title: !station.isFavorite ? "Added to favorites" : "Removed from favorites",
          description: `${station.name} ${!station.isFavorite ? "added to" : "removed from"} favorites`
        });
      } else {
        console.log("FAVORITES DEBUG: Failed to add station to main library:", addResult.message);
        toast({
          title: "Error",
          description: addResult.message,
          variant: "destructive"
        });
      }
    } else {
      console.log("FAVORITES DEBUG: Station found in main library at index:", stationIndex);
      
      toggleFavorite(stationIndex);
      const updatedFavoriteState = !station.isFavorite;
      
      console.log("FAVORITES DEBUG: New favorite state:", updatedFavoriteState);
      updatePlaylistTrackFavorite(station.url, updatedFavoriteState);
      
      console.log("FAVORITES DEBUG: Updated both main library and playlist");
      
      toast({
        title: updatedFavoriteState ? "Added to favorites" : "Removed from favorites",
        description: `${station.name} ${updatedFavoriteState ? "added to" : "removed from"} favorites`
      });
    }
  };

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const confirmClearAll = () => {
    const isCurrentInPlaylist = currentTrack && sortedPlaylistTracks.some(t => t.url === currentTrack.url);
    const removedCount = clearPlaylist();
    
    if (isCurrentInPlaylist) {
      clearCurrentTrack();
    }
    
    toast({
      title: "Playlist cleared",
      description: `${removedCount} stations removed from your playlist`
    });
    setShowClearDialog(false);
  };

  return {
    handleSelectStation,
    handleStationCardPlay,
    handleEditStation,
    handleConfirmDelete,
    handleDeleteStation,
    handleToggleFavorite,
    handleClearAll,
    confirmClearAll
  };
};
