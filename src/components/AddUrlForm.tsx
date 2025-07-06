
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";

const AddUrlForm: React.FC = () => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addUrl, checkIfStationExists } = useTrackStateContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Common languages for radio stations
  const commonLanguages = [
  "English", "Hindi", "Telugu", "Tamil", "Malayalam", "Kannada", 
  "Bengali", "Punjabi", "Marathi", "Gujarati", "Classical Music", "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a station URL",
        variant: "destructive"
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a station name",
        variant: "destructive"
      });
      return;
    }

    // CRITICAL FIX: checkIfStationExists returns an object, not a boolean
    const stationCheck = checkIfStationExists(url.trim());
    logger.debug("Station existence check", { url: url.trim(), result: stationCheck });
    
    
    if (stationCheck.exists) {
      const existsInText = stationCheck.isUserStation ? "your stations" : "featured stations";
      toast({
        title: "Station already exists",
        description: `This station is already in ${existsInText}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = addUrl(url.trim(), name.trim(), false, false, language.trim());
      logger.debug("Add URL operation", { url: url.trim(), name: name.trim(), result });
      
      if (result.success) {
        toast({
          title: "Station added successfully",
          description: `"${name}" has been added to your stations`
        });
        
        // Reset form
        setUrl("");
        setName("");
        setLanguage("");
        
        // Navigate to station list instead of a potentially broken route
        navigate("/station-list", { replace: true });
      } else {
        toast({
          title: "Failed to add station",
          description: result.message || "Please check the URL and try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding station:", error);
      toast({
        title: "Error adding station",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Station</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url">Station URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/stream"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="name">Station Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Radio Station"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="language">Language (Optional)</Label>
            <Select value={language} onValueChange={setLanguage} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                <SelectItem value="none">No language specified</SelectItem>
                {commonLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Station..." : "Add Station"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddUrlForm;
