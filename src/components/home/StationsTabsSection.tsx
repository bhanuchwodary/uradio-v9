
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
    <Card className="bg-surface-container border border-outline-variant/30 rounded-lg elevation-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-foreground">My Stations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="mystations">My Stations</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>
          
          <TabsContent value="popular" className="mt-4">
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
          
          <TabsContent value="mystations" className="mt-4">
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
          
          <TabsContent value="featured" className="mt-4 space-y-6">
            {Object.entries(featuredByLanguage).map(([language, stations]) => (
              <div key={language} className="mb-4">
                <h3 className="font-medium text-lg mb-2 text-foreground">{language}</h3>
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
