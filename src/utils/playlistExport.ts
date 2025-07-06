
import { PlaylistTrack } from "@/context/PlaylistContext";

export const exportPlaylistAsJSON = (tracks: PlaylistTrack[], filename?: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `playlist-${timestamp}.json`;
  
  const exportData = {
    exportDate: new Date().toISOString(),
    playlistCount: tracks.length,
    stations: tracks.map(track => ({
      name: track.name,
      url: track.url,
      language: track.language || "Unknown",
      isFavorite: track.isFavorite,
      isFeatured: track.isFeatured || false,
      addedToPlaylistAt: track.addedToPlaylistAt,
      playTime: track.playTime
    }))
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return exportData.stations.length;
};

export const exportPlaylistAsCSV = (tracks: PlaylistTrack[], filename?: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const defaultFilename = `playlist-${timestamp}.csv`;
  
  // CSV headers
  const headers = ['Name', 'URL', 'Language', 'Favorite', 'Featured', 'Added Date', 'Play Time (seconds)'];
  
  // Convert tracks to CSV rows
  const csvRows = tracks.map(track => {
    const addedDate = new Date(track.addedToPlaylistAt).toLocaleDateString();
    return [
      `"${(track.name || '').replace(/"/g, '""')}"`, // Escape quotes in name
      `"${track.url}"`,
      `"${track.language || 'Unknown'}"`,
      track.isFavorite ? 'Yes' : 'No',
      track.isFeatured ? 'Yes' : 'No',
      addedDate,
      track.playTime.toString()
    ].join(',');
  });
  
  const csvContent = [headers.join(','), ...csvRows].join('\n');
  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return tracks.length;
};
