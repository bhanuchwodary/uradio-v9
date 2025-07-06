
// Streamlined MusicPlayer component that uses usePlayerCore for logic.
import React, { memo, useState, useRef } from "react";
import PlayerLayout from "@/components/music-player/PlayerLayout";
import PlayerTrackInfo from "@/components/music-player/PlayerTrackInfo";
import PlayerSlider from "@/components/music-player/PlayerSlider";
import PlayerControlsRow from "@/components/music-player/PlayerControlsRow";
import PlayerVolume from "@/components/music-player/PlayerVolume";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { usePhoneCallHandling } from "@/hooks/usePhoneCallHandling";
import { Track } from "@/types/track";

interface MusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  tracks?: { name: string; url: string }[];
}

// Using React.memo to prevent unnecessary re-renders
const MusicPlayer: React.FC<MusicPlayerProps> = memo(({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  tracks = [],
}) => {
  // Add missing state variables that usePlayerCore requires
  const [currentTrack, setCurrentTrack] = useState<Track | null>(
    tracks[currentIndex] ? {
      url: tracks[currentIndex].url,
      name: tracks[currentIndex].name,
      isFavorite: false,
      playTime: 0
    } : null
  );
  const [loading, setLoading] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Convert tracks to Track type
  const trackList: Track[] = tracks.map(track => ({
    url: track.url,
    name: track.name,
    isFavorite: false,
    playTime: 0
  }));

  const {
    duration,
    currentTime,
    volume,
    setVolume,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
  } = usePlayerCore({
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    loading,
    setLoading,
    audioRef,
    tracks: trackList,
    randomMode,
    setRandomMode,
    urls,
    currentIndex,
    setCurrentIndex,
  });

  // Add phone call handling
  usePhoneCallHandling(isPlaying, setIsPlaying);

  // Show loading spinner if no tracks are available
  if (urls.length === 0) {
    return (
      <PlayerLayout>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Loading stations..." />
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      <PlayerTrackInfo
        title={tracks[currentIndex]?.name || `Track ${currentIndex + 1}`}
        url={urls[currentIndex]}
        loading={loading}
      />
      <PlayerSlider
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        disabled={!duration || duration === Infinity}
      />
      <PlayerControlsRow
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrevious}
        disabled={urls.length === 0 || loading}
      />
      <PlayerVolume
        volume={volume}
        setVolume={setVolume}
      />
    </PlayerLayout>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.urls.length === nextProps.urls.length &&
    (prevProps.tracks?.length || 0) === (nextProps.tracks?.length || 0) &&
    prevProps.urls[prevProps.currentIndex] === nextProps.urls[nextProps.currentIndex]
  );
});

MusicPlayer.displayName = "MusicPlayer"; // For better React DevTools debugging

export default MusicPlayer;
