
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Track } from "@/types/track";

interface TopStationsProps {
  stations: Track[];
  onSelectStation: (index: number) => void;
}

const TopStations: React.FC<TopStationsProps> = ({ stations, onSelectStation }) => {
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (stations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
      <CardHeader>
        <CardTitle>Most Played Stations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stations.map((station, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-md bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              <div className="flex-1">
                <div className="font-medium truncate">{station.name}</div>
                <div className="text-xs text-gray-400">
                  Played: {formatPlayTime(station.playTime || 0)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={() => onSelectStation(index)}
              >
                <Music className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopStations;
