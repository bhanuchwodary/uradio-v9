
import React from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AddUrlForm from "@/components/AddUrlForm";
import ImportStationsFromCsv from "@/components/ImportStationsFromCsv";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";

const AddStationPage: React.FC = () => {
  const { addUrl } = useTrackStateContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleImport = (stations: Array<{ name: string; url: string; language?: string }>) => {
    const addedStations = stations.filter(station => {
      const result = addUrl(station.url, station.name, false, false, station.language);
      return result.success;
    });
    
    if (addedStations.length > 0) {
      toast({
        title: "Stations Imported",
        description: `${addedStations.length} stations have been imported to your library.`,
      });
      // Navigate to the stations page after successful import
      setTimeout(() => navigate("/stations"), 500);
    } else {
      toast({
        title: "Import Failed",
        description: "No stations were imported. Please check the format and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce" style={{ paddingTop: 'calc(5rem + max(env(safe-area-inset-top), 0px))' }}>
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        <div className="max-w-lg mx-auto space-y-6">
          <Card className="bg-surface-container border border-outline-variant/30 rounded-lg elevation-1">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <CardTitle className="text-xl font-bold text-on-surface">Add Radio Station</CardTitle>
              <CardDescription>Add a new station to your library. You can then add it to your playlist from the Stations screen.</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <AddUrlForm />
            </CardContent>
          </Card>

          <Card className="bg-surface-container border border-outline-variant/30 rounded-lg elevation-1">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <CardTitle className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Stations
              </CardTitle>
              <CardDescription>Import multiple stations from a CSV file to your library</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ImportStationsFromCsv onImport={handleImport} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddStationPage;
