
import React, { useState, useEffect } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";
import { getVolumePreference, saveVolumePreference } from "@/utils/volumeStorage";

interface AppLayoutProps {
  children: React.ReactNode;
  randomMode: boolean;
  setRandomMode: (randomMode: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, randomMode, setRandomMode, volume, setVolume }) => {
  // Save volume preference whenever it changes
  useEffect(() => {
    saveVolumePreference(volume);
  }, [volume]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce">
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
