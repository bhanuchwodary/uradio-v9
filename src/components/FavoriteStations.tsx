
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Music, Heart } from "lucide-react";
import { Track } from "@/types/track";

interface FavoriteStationsProps {
  stations: Track[];
  onSelectStation: (index: number) => void;
}

const FavoriteStations: React.FC<FavoriteStationsProps> = ({ stations, onSelectStation }) => {
  if (stations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg mb-4">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Favorite Stations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {stations.map((station, index) => (
            <div
              key={station.url}
              className="flex flex-col p-3 md:p-4 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <button
                className="flex flex-col items-center gap-2 md:gap-3 w-full group"
                onClick={() => onSelectStation(index)}
              >
                <Radio className="w-10 h-10 md:w-12 md:h-12 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-center group-hover:text-primary transition-colors line-clamp-2">
                  {station.name}
                </span>
              </button>
              <div className="flex justify-center mt-2 md:mt-3">
                <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoriteStations;
