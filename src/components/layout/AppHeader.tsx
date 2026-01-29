
import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  randomMode: boolean;
  setRandomMode: (rand: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  randomMode,
  setRandomMode,
  volume,
  setVolume
}) => {
  const { theme } = useTheme();
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Get audio player state - this is now the ONLY player in the app
  const {
    currentTrack,
    isPlaying,
    loading,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume: setPlayerVolume,
    setRandomMode: setPlayerRandomMode
  } = useAudioPlayer();

  // Sync volume between header state and player
  useEffect(() => {
    setPlayerVolume(volume);
  }, [volume, setPlayerVolume]);

  // Sync random mode between header state and player
  useEffect(() => {
    console.log("RANDOM MODE DEBUG: Header syncing randomMode to player:", randomMode);
    setPlayerRandomMode(randomMode);
  }, [randomMode, setPlayerRandomMode]);

  // Enhanced next/previous functions that respect random mode
  const handleNext = () => {
    console.log("Header: Next track clicked with random mode:", randomMode);
    nextTrack(); // This already uses enhanced handlers with random mode
  };

  const handlePrevious = () => {
    console.log("Header: Previous track clicked with random mode:", randomMode);
    previousTrack(); // This already uses enhanced handlers with random mode
  };

  // Determine which logo to use based on theme with preload
  const getLogoSrc = () => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = theme === "system" ? systemTheme : theme;
    return currentTheme === "light"
      ? "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png"
      : "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
  };

  // Preload both theme logos for instant switching
  useEffect(() => {
    const lightLogo = new window.Image();
    lightLogo.src = "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png";
    lightLogo.onload = () => setLogoLoaded(true);

    const darkLogo = new window.Image();
    darkLogo.src = "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
    darkLogo.onload = () => setLogoLoaded(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 glass-surface border-b border-outline-variant/20 z-20 elevation-2 ios-safe-left ios-safe-right" style={{ 
      paddingTop: 'max(env(safe-area-inset-top), 0px)',
      height: 'calc(5rem + max(env(safe-area-inset-top), 0px))'
    }}>
      <div className="responsive-container flex items-center h-full gap-4 w-full" style={{ minHeight: '5rem' }}>
        {/* Logo and Tagline */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <img
            src={getLogoSrc()}
            alt="uRadio"
            className={`h-10 w-auto object-contain material-transition ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <p className="font-handwritten responsive-text-sm text-on-surface-variant mt-0.5 tracking-wide">
            it's ur radio
          </p>
        </div>
        
        {/* Main Info/Controls - THIS IS THE ONLY PLAYER IN THE APP */}
        <div className="flex flex-1 min-w-0 items-center">
          {currentTrack ? (
            <div className="flex items-center w-full gap-2 sm:gap-3">
              {/* Station Info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="responsive-text-base font-bold truncate text-on-surface material-transition"
                  title={currentTrack.name}
                >
                  {currentTrack.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {loading && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                      <p className="responsive-text-sm text-primary animate-pulse">Loading...</p>
                    </div>
                  )}
                  {currentTrack.language && (
                    <span className="inline-block px-2 py-0.5 responsive-text-sm bg-primary-container/80 text-on-primary-container rounded-full font-medium material-transition hover:bg-primary-container">
                      {currentTrack.language}
                    </span>
                  )}
                </div>
              </div>
              {/* Compact Controls */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <MusicPlayer
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onPlayPause={togglePlayPause}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  volume={volume}
                  onVolumeChange={setVolume}
                  loading={loading}
                  compact={true}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center w-full gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className="responsive-text-base font-medium text-on-surface-variant truncate">
                  Select a station to start playing
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <MusicPlayer
                  currentTrack={null}
                  isPlaying={false}
                  onPlayPause={() => {}}
                  onNext={() => {}}
                  onPrevious={() => {}}
                  volume={volume}
                  onVolumeChange={setVolume}
                  loading={false}
                  compact={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex-shrink-0 ml-2">
          <UserMenu compact />
        </div>
      </div>
    </header>
  );
};
