
import { useEffect, useRef } from "react";

interface UseAudioEventsProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  onEnded: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAudioEvents = ({
  audioRef,
  setCurrentTime,
  setDuration,
  onEnded,
  setLoading
}: UseAudioEventsProps) => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      setLoading(false);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    const handleWaiting = () => {
      setLoading(true);
    };

    // Add event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);

    // Set up interval to update time more frequently for smoother progress bar
    intervalRef.current = window.setInterval(() => {
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
      }
    }, 500);

    return () => {
      // Remove event listeners
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [audioRef, setCurrentTime, setDuration, onEnded, setLoading]);

  return { intervalRef };
};
