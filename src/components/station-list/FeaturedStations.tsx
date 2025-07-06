
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StationGrid } from '@/components/ui/player/StationGrid';
import { Track } from '@/types/track';

interface FeaturedStationsProps {
  stationsByLanguage: Record<string, Track[]>;
  currentTrack: Track | undefined;
  isPlaying: boolean;
  currentIndex: number;
  onAddStation: (station: Track) => void;
  isInPlaylist: (trackUrl: string) => boolean;
  isAddingToPlaylist: boolean;
}

const FeaturedStations: React.FC<FeaturedStationsProps> = ({
  stationsByLanguage,
  currentTrack,
  isPlaying,
  currentIndex,
  onAddStation,
  isInPlaylist,
  isAddingToPlaylist,
}) => {
  return (
    <>
      {Object.entries(stationsByLanguage).map(([language, stations]) => (
        <Card key={language} className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 elevation-2">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Featured {language} Stations</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <StationGrid
              stations={stations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onAddStation(stations[index])}
              actionIcon="add"
              isInPlaylist={isInPlaylist}
              isAddingToPlaylist={isAddingToPlaylist}
            />
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default FeaturedStations;
