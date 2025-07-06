
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import PlaylistDialogs from "@/components/playlist/PlaylistDialogs";
import ClearAllDialog from "@/components/playlist/ClearAllDialog";
import { usePlaylistPageLogic } from "@/hooks/playlist/usePlaylistPageLogic";
import { usePlaylistPageHandlers } from "@/components/playlist/PlaylistPageHandlers";

interface PlaylistPageProps {
  randomMode: boolean;
  setRandomMode: (rand: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({
  randomMode,
  setRandomMode,
  volume,
  setVolume
}) => {
  const {
    editingStation,
    setEditingStation,
    stationToDelete,
    setStationToDelete,
    showClearDialog,
    setShowClearDialog,
    searchTerm,
    setSearchTerm,
    sortedPlaylistTracks,
    filteredTracks,
    currentTrack,
    isPlaying,
    toast,
    editStationByValue,
    toggleFavorite,
    tracks,
    addUrl,
    removeFromPlaylist,
    clearPlaylist,
    updatePlaylistTrackFavorite,
    playTrack,
    togglePlayPause,
    clearCurrentTrack
  } = usePlaylistPageLogic({ randomMode, setRandomMode });

  const {
    handleSelectStation,
    handleStationCardPlay,
    handleEditStation,
    handleConfirmDelete,
    handleDeleteStation,
    handleToggleFavorite,
    handleClearAll,
    confirmClearAll
  } = usePlaylistPageHandlers({
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
  });

  const handleSaveEdit = (data: { url: string; name: string }) => {
    if (editingStation) {
      editStationByValue(editingStation, data);
      toast({
        title: "Station updated",
        description: `"${data.name}" has been updated`,
      });
      setEditingStation(null);
    }
  };

  console.log("PLAYLIST DEBUG: Current tracks:", sortedPlaylistTracks.length);
  console.log("PLAYLIST DEBUG: Filtered tracks:", filteredTracks.length);

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        <PlaylistContent
          playlistTracks={filteredTracks}
          allPlaylistTracks={sortedPlaylistTracks}
          currentIndex={-1}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          randomMode={randomMode}
          onRandomModeChange={setRandomMode}
          onSelectStation={handleSelectStation}
          onStationCardPlay={handleStationCardPlay}
          onEditStation={handleEditStation}
          onConfirmDelete={handleConfirmDelete}
          onToggleFavorite={handleToggleFavorite}
          onClearAll={handleClearAll}
        />

        <PlaylistDialogs
          editingStation={editingStation}
          onCloseEditDialog={() => setEditingStation(null)}
          onSaveEdit={handleSaveEdit}
          stationToDelete={stationToDelete}
          onCloseDeleteDialog={() => setStationToDelete(null)}
          onConfirmDelete={() => handleDeleteStation(stationToDelete)}
        />

        <ClearAllDialog
          isOpen={showClearDialog}
          onClose={() => setShowClearDialog(false)}
          onConfirm={confirmClearAll}
        />
      </div>
    </AppLayout>
  );
};

export default PlaylistPage;
