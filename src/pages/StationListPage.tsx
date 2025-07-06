
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import EditStationDialog from "@/components/EditStationDialog";
import StationSearch from "@/components/station-list/StationSearch";
import UserStations from "@/components/station-list/UserStations";
import FeaturedStations from "@/components/station-list/FeaturedStations";
import NoSearchResults from "@/components/station-list/NoSearchResults";
import { useStationList } from "@/hooks/pages/useStationList";

const StationListPage: React.FC = () => {
  const {
    editingStation,
    searchTerm,
    setSearchTerm,
    filteredUserStations,
    currentTrack,
    isPlaying,
    currentIndex,
    userStations,
    filteredStationsByLanguage,
    handleAddStation,
    handleEditStation,
    handleDeleteStation,
    handleSaveEdit,
    setEditingStation,
    showNoResults,
    isInPlaylist,
    isAddingToPlaylist,
  } = useStationList();

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        <StationSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

        <UserStations
          stations={filteredUserStations}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentIndex={currentIndex}
          onAddStation={handleAddStation}
          onEditStation={handleEditStation}
          onDeleteStation={handleDeleteStation}
          searchTerm={searchTerm}
          allUserStationsCount={userStations.length}
          isInPlaylist={isInPlaylist}
          isAddingToPlaylist={isAddingToPlaylist}
        />

        <FeaturedStations
          stationsByLanguage={filteredStationsByLanguage}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentIndex={currentIndex}
          onAddStation={handleAddStation}
          isInPlaylist={isInPlaylist}
          isAddingToPlaylist={isAddingToPlaylist}
        />

        {showNoResults && <NoSearchResults />}

        {editingStation && (
          <EditStationDialog
            isOpen={!!editingStation}
            onClose={() => setEditingStation(null)}
            onSave={handleSaveEdit}
            initialValues={{
              url: editingStation.url,
              name: editingStation.name,
              language: editingStation.language,
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default StationListPage;
