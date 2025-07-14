
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";
import { Star } from "lucide-react";

interface FavoritesSectionProps {
  favoriteStations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number, stationList: Track[]) => void;
  onToggleFavorite: (station: Track) => void;
  onDeleteStation: (station: Track) => void;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favoriteStations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onToggleFavorite,
  onDeleteStation
}) => {
  if (favoriteStations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 elevation-2">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          Favorites
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <StationGrid
          stations={favoriteStations}
          currentIndex={currentIndex}
          currentTrackUrl={currentTrackUrl}
          isPlaying={isPlaying}
          onSelectStation={(index) => onSelectStation(index, favoriteStations)}
          onToggleFavorite={onToggleFavorite}
          onDeleteStation={onDeleteStation}
        />
      </CardContent>
    </Card>
  );
};

export default FavoritesSection;
