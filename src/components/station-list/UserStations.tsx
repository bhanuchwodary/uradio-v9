
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StationGrid } from '@/components/ui/player/StationGrid';
import { Track } from '@/types/track';
import { ListMusic } from 'lucide-react';

interface UserStationsProps {
  stations: Track[];
  currentTrack: Track | undefined;
  isPlaying: boolean;
  currentIndex: number;
  onAddStation: (station: Track) => void;
  onEditStation: (station: Track) => void;
  onDeleteStation: (station: Track) => void;
  searchTerm: string;
  allUserStationsCount: number;
  isInPlaylist: (trackUrl: string) => boolean;
  isAddingToPlaylist: boolean;
}

const UserStations: React.FC<UserStationsProps> = ({
  stations,
  currentTrack,
  isPlaying,
  currentIndex,
  onAddStation,
  onEditStation,
  onDeleteStation,
  searchTerm,
  allUserStationsCount,
  isInPlaylist,
  isAddingToPlaylist,
}) => {
  return (
    <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 elevation-2">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">My Stations</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {stations.length > 0 ? (
          <StationGrid
            stations={stations}
            currentIndex={currentIndex}
            currentTrackUrl={currentTrack?.url}
            isPlaying={isPlaying}
            onSelectStation={(index) => onAddStation(stations[index])}
            onEditStation={onEditStation}
            onDeleteStation={onDeleteStation}
            actionIcon="add"
            isInPlaylist={isInPlaylist}
            isAddingToPlaylist={isAddingToPlaylist}
          />
        ) : (
          searchTerm === '' && allUserStationsCount === 0 && (
            <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50 flex flex-col items-center justify-center gap-4">
              <ListMusic className="h-12 w-12 text-muted-foreground/50" />
              <div>
                <p className="text-muted-foreground font-semibold">No stations added yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Add stations to build your collection</p>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default UserStations;
