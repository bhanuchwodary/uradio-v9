
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImportStationsFromCsvProps {
  onImport: (stations: Array<{ name: string; url: string; language?: string }>) => void;
}

const ImportStationsFromCsv: React.FC<ImportStationsFromCsvProps> = ({ onImport }) => {
  const [csvContent, setCsvContent] = useState("");
  const { toast } = useToast();

  const handleImport = () => {
    if (!csvContent.trim()) {
      toast({
        title: "No Data",
        description: "Please enter CSV data to import stations.",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvContent.trim().split('\n');
      let stations = [];
      
      // Check if there's a header row by looking for common CSV header terms
      const firstLine = lines[0].toLowerCase();
      const hasHeader = firstLine.includes('name') || 
                        firstLine.includes('url') || 
                        firstLine.includes('station') ||
                        firstLine.includes('language');
      
      // Start from index 1 if header exists, otherwise from 0
      const startIndex = hasHeader ? 1 : 0;
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Split by comma, but handle quotes properly (simple implementation)
        const parts = line.split(',').map(part => part.trim());
        
        if (parts.length >= 2) {
          const station = { 
            name: parts[0], 
            url: parts[1],
            language: parts[2] || ""  // Get language if available
          };
          
          // Basic validation
          if (station.name && station.url) {
            stations.push(station);
          }
        }
      }
      
      if (stations.length === 0) {
        toast({
          title: "No Valid Stations",
          description: "No valid stations were found in the CSV data.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Importing stations:", stations);
      onImport(stations);
      setCsvContent("");
      
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Paste CSV content here (format: name,url,language)"
        value={csvContent}
        onChange={e => setCsvContent(e.target.value)}
        className="min-h-[120px]"
      />
      <div className="text-xs text-gray-400 italic">
        Expected format: <code>Station Name,Station URL,Language</code> (one per line)
      </div>
      <Button 
        onClick={handleImport} 
        variant="secondary" 
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>
    </div>
  );
};

export default ImportStationsFromCsv;
