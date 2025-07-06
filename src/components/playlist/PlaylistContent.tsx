
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { StationGrid } from "@/components/ui/player/StationGrid";
import StationSearch from "@/components/station-list/StationSearch";
import { Track } from "@/types/track";
import { PlaylistTrack } from "@/context/PlaylistContext";
import ExportPlaylistButtons from "./ExportPlaylistButtons";
import { logger } from "@/utils/logger";

interface PlaylistContentProps {
  playlistTracks: PlaylistTrack[];
  allPlaylistTracks: PlaylistTrack[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  randomMode: boolean;
  onRandomModeChange: (random: boolean) => void;
  onSelectStation: (index: number) => void;
  onStationCardPlay: (station: Track) => void;
  onEditStation: (station: Track) => void;
  onConfirmDelete: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
  onClearAll?: () => void;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({
  playlistTracks,
  allPlaylistTracks,
  currentIndex,
  currentTrack,
  isPlaying,
  searchTerm,
  onSearchTermChange,
  randomMode,
  onRandomModeChange,
  onSelectStation,
  onStationCardPlay,
  onEditStation,
  onConfirmDelete,
  onToggleFavorite,
  onClearAll
}) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug("PlaylistContent rendering", { tracksCount: playlistTracks.length });
  }

  // Handle station card click - use the new onStationCardPlay prop
  const handleStationCardClick = (index: number) => {
    const station = playlistTracks[index];
    if (station) {
      logger.debug("PlaylistContent station card clicked", { stationName: station.name });
      onStationCardPlay(station);
    }
  };

  const hasResults = playlistTracks.length > 0;
  const hasPlaylist = allPlaylistTracks.length > 0;
  const isSearching = searchTerm.trim().length > 0;

  return (
    <Card className="bg-surface-container border border-outline-variant/30 rounded-lg elevation-1">
      <CardHeader className="pb-3 px-3 sm:px-6">
        {/* Search Bar */}
        {hasPlaylist && (
          <div className="mb-4">
            <StationSearch
              searchTerm={searchTerm}
              onSearchTermChange={onSearchTermChange}
            />
          </div>
        )}
        
        {/* Controls Row */}
        {hasPlaylist && (
          <div className="flex justify-between items-center gap-3">
            {/* Left side - Random Mode Toggle */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logger.debug("Random mode toggle", { from: randomMode, to: !randomMode });
                  onRandomModeChange(!randomMode);
                }}
                className={cn(
                  "h-9 flex items-center gap-2 transition-all duration-200",
                  randomMode
                    ? "bg-primary/20 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                )}
                title={randomMode ? "Random mode on" : "Random mode off"}
              >
                <Shuffle className="h-4 w-4" />
                {/* Show text only on larger screens */}
                <span className="hidden sm:inline">
                  {randomMode ? "Random" : "Sequential"}
                </span>
              </Button>
            </div>
            
            {/* Right side - Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Export buttons */}
              <ExportPlaylistButtons 
                tracks={allPlaylistTracks} 
                disabled={!hasPlaylist}
              />
              
              {/* Clear all button */}
              {onClearAll && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onClearAll}
                  className="flex items-center gap-2"
                  aria-label="Clear all stations from playlist"
                >
                  {/* Icon only on mobile */}
                  <span className="inline-flex sm:hidden">
                    <Trash2 className="h-4 w-4" />
                  </span>
                  {/* Icon + label on desktop */}
                  <span className="hidden sm:inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </span>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-3 sm:px-6 space-y-6">
        {hasResults ? (
          <StationGrid
            stations={playlistTracks}
            currentIndex={currentIndex}
            currentTrackUrl={currentTrack?.url}
            isPlaying={isPlaying}
            onSelectStation={handleStationCardClick}
            onEditStation={onEditStation}
            onDeleteStation={onConfirmDelete}
            onToggleFavorite={onToggleFavorite}
            context="playlist"
          />
        ) : (
          <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50">
            {isSearching ? (
              <>
                <p className="text-muted-foreground">No stations match your search</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try different keywords or clear the search</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Your playlist is empty</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Add stations from the Stations screen to build your playlist</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
