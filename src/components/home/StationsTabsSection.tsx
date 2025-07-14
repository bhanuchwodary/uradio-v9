
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";
import { getStations } from "@/data/featuredStationsLoader";

interface StationsTabsSectionProps {
  popularStations: Track[];
  userStations: Track[];
  featuredStations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number, stationList: Track[]) => void;
  onEditStation: (station: Track) => void;
  onDeleteStation: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
}

const StationsTabsSection: React.FC<StationsTabsSectionProps> = ({
  popularStations,
  userStations,
  featuredStations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite
}) => {
  // Group featured stations by language
  const featuredByLanguage: Record<string, Track[]> = {};
  
  featuredStations.forEach(station => {
    const language = station.language || "Unknown";
    if (!featuredByLanguage[language]) {
      featuredByLanguage[language] = [];
    }
    featuredByLanguage[language].push(station);
  });

  return (
    <Card className="bg-gradient-to-br from-surface-container/95 to-surface-container/80 border border-outline-variant/20 rounded-2xl elevation-1">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-2xl font-bold text-foreground">All Stations</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6">
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-surface-container-high/50 p-1 rounded-xl">
            <TabsTrigger value="popular" className="rounded-lg font-medium">Popular</TabsTrigger>
            <TabsTrigger value="mystations" className="rounded-lg font-medium">My Stations</TabsTrigger>
            <TabsTrigger value="featured" className="rounded-lg font-medium">Featured</TabsTrigger>
          </TabsList>
          
          <TabsContent value="popular" className="mt-6">
            <StationGrid
              stations={popularStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrackUrl}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, popularStations)}
              onToggleFavorite={onToggleFavorite}
              onDeleteStation={onDeleteStation}
            />
          </TabsContent>
          
          <TabsContent value="mystations" className="mt-6">
            <StationGrid
              stations={userStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrackUrl}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, userStations)}
              onEditStation={onEditStation}
              onDeleteStation={onDeleteStation}
              onToggleFavorite={onToggleFavorite}
            />
          </TabsContent>
          
          <TabsContent value="featured" className="mt-6 space-y-8">
            {Object.entries(featuredByLanguage).map(([language, stations]) => (
              <div key={language} className="mb-6">
                <h3 className="font-semibold text-xl mb-4 text-foreground border-b border-outline-variant/30 pb-2">{language}</h3>
                <StationGrid
                  stations={stations}
                  currentIndex={currentIndex}
                  currentTrackUrl={currentTrackUrl}
                  isPlaying={isPlaying}
                  onSelectStation={(index) => onSelectStation(index, stations)}
                  onToggleFavorite={onToggleFavorite}
                  onDeleteStation={onDeleteStation}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StationsTabsSection;
