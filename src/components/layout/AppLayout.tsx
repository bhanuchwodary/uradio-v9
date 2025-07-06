
import React, { useState, useEffect } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";
import { getVolumePreference, saveVolumePreference } from "@/utils/volumeStorage";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Initialize volume from stored preference instead of hardcoded default
  const [volume, setVolume] = useState(() => getVolumePreference());
  const [randomMode, setRandomMode] = useState(false);

  // Save volume preference whenever it changes
  useEffect(() => {
    saveVolumePreference(volume);
  }, [volume]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-background to-surface-container-low dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce relative overflow-hidden">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%),_radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.3),_transparent_50%),_radial-gradient(circle_at_40%_40%,_rgba(120,200,255,0.3),_transparent_50%)]" />
      </div>
      
      <AppHeader randomMode={randomMode} setRandomMode={setRandomMode} volume={volume} setVolume={setVolume} />
      <div
        className={cn(
          "flex-grow pb-32 md:pb-28 overflow-x-hidden w-full ios-smooth-scroll ios-safe-left ios-safe-right",
          "responsive-padding"
        )}
        style={{ 
          paddingTop: 'calc(5rem + max(env(safe-area-inset-top), 0px))'
        }}
      >
        {children}
      </div>
      <BottomNav />
    </div>
  );
};
