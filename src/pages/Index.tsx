
import React, { useState, useMemo, useRef } from "react";

import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { Track } from "@/types/track";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import HomePagePlayer from "@/components/home/HomePagePlayer";
import FavoritesSection from "@/components/home/FavoritesSection";
import StationsTabsSection from "@/components/home/StationsTabsSection";
import HomePageDialogs from "@/components/home/HomePageDialogs";
import { getStations } from "@/data/featuredStationsLoader";
import { logger } from "@/utils/logger";

const Index: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  const [loading, setLoading] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { 
    tracks, 
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    editStationByValue,
    removeStationByValue,
    toggleFavorite,
    getUserStations
  } = useTrackStateContext();
  
  // Memoize expensive calculations
  const favoriteStations = useMemo(() => 
    tracks.filter(track => track.isFavorite),
    [tracks]
  );
  
  const popularStations = useMemo(() => 
    [...tracks]
      .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
      .slice(0, 8),
    [tracks]
  );
    
  const userStations = useMemo(() => getUserStations(), [getUserStations]);
  
  const featuredStations = useMemo(() => 
    getStations().map(station => ({
      ...station,
      isFavorite: false,
      isFeatured: true,
      playTime: 0
    })),
    []
  );
  
  // Derive URLs from tracks
  const urls = useMemo(() => tracks.map(track => track.url), [tracks]);
  
  // Calculate current track
  const currentTrack = tracks[currentIndex] || null;
  const [currentTrackState, setCurrentTrackState] = useState<Track | null>(currentTrack);

  // Use player core for player functionality
  const {
    volume,
    setVolume,
    handlePlayPause,
    handleNext,
    handlePrevious,
  } = usePlayerCore({
    currentTrack: currentTrackState,
    setCurrentTrack: setCurrentTrackState,
    isPlaying,
    setIsPlaying,
    loading,
    setLoading,
    audioRef,
    tracks,
    randomMode,
    setRandomMode,
    urls,
    currentIndex,
    setCurrentIndex,
  });

  // Handle selecting a station from any list
  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    try {
      // Find the corresponding index in the full tracks list
      const mainIndex = tracks.findIndex(t => t.url === stationList[stationIndex].url);
      if (mainIndex !== -1) {
        setCurrentIndex(mainIndex);
        setCurrentTrackState(tracks[mainIndex]);
        setIsPlaying(true);
      } else {
        logger.warn("Station not found in main tracks list", { 
          stationUrl: stationList[stationIndex]?.url 
        });
      }
    } catch (error) {
      logger.error("Error selecting station", error);
    }
  };
  
  // Toggle favorite for any station
  const handleToggleFavorite = (station: typeof tracks[0]) => {
    try {
      const index = tracks.findIndex(t => t.url === station.url);
      if (index !== -1) {
        toggleFavorite(index);
      }
    } catch (error) {
      logger.error("Error toggling favorite", error);
    }
  };
  
  // Edit station handler
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };
  
  // Open the delete confirmation dialog for a station
  const handleConfirmDelete = (station: Track) => {
    setStationToDelete(station);
  };
  
  // Handle actual deletion after confirmation
  const handleDeleteStation = () => {
    if (stationToDelete) {
      try {
        const stationName = stationToDelete.name;
        removeStationByValue(stationToDelete);
        toast({
          title: "Station removed",
          description: `${stationName} has been removed from your playlist`
        });
        setStationToDelete(null);
      } catch (error) {
        logger.error("Error deleting station", error);
        toast({
          title: "Error",
          description: "Failed to remove station. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Save edited station
  const handleSaveEdit = (data: { url: string; name: string }) => {
    if (editingStation) {
      try {
        editStationByValue(editingStation, data);
        toast({
          title: "Station updated",
          description: `"${data.name}" has been updated`,
        });
        setEditingStation(null);
      } catch (error) {
        logger.error("Error editing station", error);
        toast({
          title: "Error",
          description: "Failed to update station. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce" style={{ paddingTop: 'calc(5rem + max(env(safe-area-inset-top), 0px))' }}>
        <div className="responsive-container max-w-7xl space-lg responsive-padding-y">
          {/* Player Card */}
          <ErrorBoundary fallback={
            <div className="text-center p-8 text-on-surface-variant glass-card rounded-2xl">
              <p className="responsive-text-base">Player temporarily unavailable</p>
            </div>
          }>
            <div className="animate-fade-in">
              <HomePagePlayer
                currentTrack={currentTrackState}
                isPlaying={isPlaying}
                handlePlayPause={handlePlayPause}
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                volume={volume}
                setVolume={setVolume}
                loading={loading}
              />
            </div>
          </ErrorBoundary>

          {/* Favorites Section */}
          <ErrorBoundary fallback={
            <div className="text-center p-8 text-on-surface-variant glass-card rounded-2xl">
              <p className="responsive-text-base">Favorites section temporarily unavailable</p>
            </div>
          }>
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <FavoritesSection 
                favoriteStations={favoriteStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrackState?.url}
                isPlaying={isPlaying}
                onSelectStation={handleSelectStation}
                onToggleFavorite={handleToggleFavorite}
                onDeleteStation={handleConfirmDelete}
              />
            </div>
          </ErrorBoundary>
          
          {/* All Stations Section with Tabs */}
          <ErrorBoundary fallback={
            <div className="text-center p-8 text-on-surface-variant glass-card rounded-2xl">
              <p className="responsive-text-base">Stations section temporarily unavailable</p>
            </div>
          }>
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <StationsTabsSection
                popularStations={popularStations}
                userStations={userStations}
                featuredStations={featuredStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrackState?.url}
                isPlaying={isPlaying}
                onSelectStation={handleSelectStation}
                onEditStation={handleEditStation}
                onDeleteStation={handleConfirmDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </ErrorBoundary>
          
          {/* Dialogs for editing and deleting */}
          <HomePageDialogs 
            editingStation={editingStation}
            stationToDelete={stationToDelete}
            onCloseEditDialog={() => setEditingStation(null)}
            onSaveEdit={handleSaveEdit}
            onCloseDeleteDialog={() => setStationToDelete(null)}
            onConfirmDelete={handleDeleteStation}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
