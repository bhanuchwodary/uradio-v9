
import React from "react";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { Track } from "@/types/track";

interface HomePagePlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  handlePlayPause: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  loading: boolean;
}

const HomePagePlayer: React.FC<HomePagePlayerProps> = ({
  currentTrack,
  isPlaying,
  handlePlayPause,
  handleNext,
  handlePrevious,
  volume,
  setVolume,
  loading
}) => {
  return (
    <div className="mb-6">
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        volume={volume}
        onVolumeChange={setVolume}
        loading={loading}
      />
    </div>
  );
};

export default HomePagePlayer;
