
import { useState, useEffect } from "react";
import { usePlaylist } from "@/context/PlaylistContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { usePlaylistSearch } from "@/hooks/playlist/usePlaylistSearch";
import { Track } from "@/types/track";

interface UsePlaylistPageLogicProps {
  randomMode: boolean;
  setRandomMode: (rand: boolean) => void;
}

export const usePlaylistPageLogic = ({ randomMode, setRandomMode }: UsePlaylistPageLogicProps) => {
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const { editStationByValue, toggleFavorite, tracks, addUrl } = useTrackStateContext();
  
  const {
    sortedPlaylistTracks,
    removeFromPlaylist,
    clearPlaylist,
    updatePlaylistTrackFavorite
  } = usePlaylist();

  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause,
    clearCurrentTrack,
    setPlaylistTracks,
    setRandomMode: setPlayerRandomMode
  } = useAudioPlayer();

  const filteredTracks = usePlaylistSearch(sortedPlaylistTracks, searchTerm);

  // Update the audio player's playlist tracks whenever sortedPlaylistTracks changes
  useEffect(() => {
    console.log("PlaylistPage: Updating audio player playlist tracks:", sortedPlaylistTracks.length);
    setPlaylistTracks(sortedPlaylistTracks);
  }, [sortedPlaylistTracks, setPlaylistTracks]);

  // Sync random mode between page state and player
  useEffect(() => {
    console.log("PlaylistPage: Syncing randomMode to player:", randomMode);
    setPlayerRandomMode(randomMode);
  }, [randomMode, setPlayerRandomMode]);

  return {
    // State
    editingStation,
    setEditingStation,
    stationToDelete,
    setStationToDelete,
    showClearDialog,
    setShowClearDialog,
    searchTerm,
    setSearchTerm,
    // Data
    sortedPlaylistTracks,
    filteredTracks,
    currentTrack,
    isPlaying,
    // Functions
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
    clearCurrentTrack,
    randomMode,
    setRandomMode
  };
};
