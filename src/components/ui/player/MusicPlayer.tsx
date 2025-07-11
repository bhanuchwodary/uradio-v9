
import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/track";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { saveVolumePreference } from "@/utils/volumeStorage";

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  loading?: boolean;
  compact?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
  loading = false,
  compact = false
}) => {
  // Save volume preference whenever it changes
  useEffect(() => {
    saveVolumePreference(volume);
  }, [volume]);

  const getHostnameFromUrl = (url: string): string => {
    if (!url) return "No URL";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return "Invalid URL";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center">
        {/* Compact Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-7 w-7 rounded-full bg-surface-container/60 hover:bg-surface-container/80 border border-outline-variant/20 transition-all active:scale-95"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 shadow-sm transition-all active:scale-95"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-7 w-7 rounded-full bg-surface-container/60 hover:bg-surface-container/80 border border-outline-variant/20 transition-all active:scale-95"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Volume control - Compact, hidden on small screens */}
        <div className="hidden md:flex items-center ml-3 w-16">
          <Volume2 className="h-3.5 w-3.5 text-on-surface-variant flex-shrink-0 mr-2" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(values) => onVolumeChange(values[0] / 100)}
            className="flex-1"
          />
        </div>
      </div>
    );
  }

  // Original full player layout for non-compact mode
  return (
    <Card className="modern-card p-6 bg-gradient-to-br from-surface-container/80 to-surface-container/60 backdrop-blur-lg border border-outline-variant/40 shadow-xl rounded-3xl elevation-3 hover:elevation-5 smooth-animation">
      <div className="flex flex-col space-y-6">
        {/* Station info */}
        <div className="text-center px-2 animate-fade-in">
          <h2 className="text-2xl font-bold truncate leading-tight text-on-surface smooth-animation">
            {currentTrack?.name || "Select a station"}
          </h2>
          <p className="text-sm text-on-surface-variant truncate mt-2">
            {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
          </p>
          {currentTrack?.language && (
            <div className="flex items-center justify-center text-sm mt-3">
              <span className="bg-primary/20 text-primary px-3 py-1.5 rounded-full font-medium shadow-sm">{currentTrack.language}</span>
            </div>
          )}
          {loading && (
            <p className="text-sm text-primary animate-pulse mt-3 font-medium">Loading stream...</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-14 w-14 rounded-full bg-surface-container/80 hover:bg-surface-container-high border border-outline-variant/40 ios-touch-target smooth-animation hover:scale-110 active:scale-95 elevation-1 hover:elevation-2"
          >
            <SkipBack className="h-7 w-7" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className={cn(
              "h-20 w-20 rounded-full ios-touch-target smooth-animation hover:scale-110 active:scale-95 shadow-xl elevation-3 hover:elevation-5",
              isPlaying ? "bg-primary/90 ring-4 ring-primary/20" : "bg-primary shadow-primary/30"
            )}
          >
            {isPlaying ? (
              <Pause className="h-10 w-10" />
            ) : (
              <Play className="h-10 w-10 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-14 w-14 rounded-full bg-surface-container/80 hover:bg-surface-container-high border border-outline-variant/40 ios-touch-target smooth-animation hover:scale-110 active:scale-95 elevation-1 hover:elevation-2"
          >
            <SkipForward className="h-7 w-7" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-3 px-2">
          <Volume2 className="h-5 w-5 text-on-surface-variant flex-shrink-0" />
          <div className="flex-1 py-2">
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(values) => onVolumeChange(values[0] / 100)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
