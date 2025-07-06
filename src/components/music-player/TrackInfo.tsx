
import React from "react";

interface TrackInfoProps {
  title: string;
  url?: string;
  loading: boolean;
}

export const getHostnameFromUrl = (url: string): string => {
  if (!url) return "No URL";
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return "Invalid URL";
  }
};

const TrackInfo: React.FC<TrackInfoProps> = ({ title, url, loading }) => (
  <div className="text-center">
    <h3 className="font-bold text-lg truncate">{title}</h3>
    <p className="text-xs text-gray-500 truncate">
      {url ? getHostnameFromUrl(url) : "Add a URL to begin"}
    </p>
    {loading && (
      <p className="text-xs text-blue-400 animate-pulse mt-1">Loading stream...</p>
    )}
  </div>
);

export default TrackInfo;
