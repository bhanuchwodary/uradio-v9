
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TrackStateProvider } from "@/context/TrackStateContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import PlaylistPage from "@/pages/PlaylistPage";
import AddStationPage from "@/pages/AddStationPage";
import NotFound from "@/pages/NotFound";
import StationListPage from "@/pages/StationListPage";
import RequestStationPage from "@/pages/RequestStationPage";
import { useTrackState } from "@/hooks/useTrackState";
import { getRandomModePreference } from "@/utils/randomModeStorage";
import { logger } from "@/utils/logger";

const App = () => {
  const [randomMode, setRandomMode] = useState(() => getRandomModePreference());
  const [volume, setVolume] = useState(0.7);

  logger.debug("App random mode initialized", { randomMode });

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="uradio-theme">
        <TrackStateProvider>
          <PlaylistProvider>
            <TrackStateWrapper randomMode={randomMode} volume={volume}>
              <Router>
                <div className="min-h-screen bg-background">
                  <InstallPrompt />
                  <Routes>
                    <Route path="/" element={<PlaylistPage randomMode={randomMode} setRandomMode={setRandomMode} volume={volume} setVolume={setVolume} />} />
                    <Route path="/playlist" element={<PlaylistPage randomMode={randomMode} setRandomMode={setRandomMode} volume={volume} setVolume={setVolume} />} />
                    <Route path="/add" element={<AddStationPage />} />
                    <Route path="/add-station" element={<AddStationPage />} />
                    <Route path="/station-list" element={<StationListPage />} />
                    <Route path="/request-station" element={<RequestStationPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </Router>
            </TrackStateWrapper>
          </PlaylistProvider>
        </TrackStateProvider>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Wrapper component to access TrackStateContext and pass all tracks
const TrackStateWrapper: React.FC<{
  children: React.ReactNode;
  randomMode: boolean;
  volume: number;
}> = ({ children, randomMode, volume }) => {
  const { tracks } = useTrackState();
  
  logger.debug("AudioPlayerProvider initialized", { randomMode, tracksCount: tracks.length });
  
  return (
    <AudioPlayerProvider tracks={tracks} randomMode={randomMode}>
      {children}
    </AudioPlayerProvider>
  );
};

export default App;
