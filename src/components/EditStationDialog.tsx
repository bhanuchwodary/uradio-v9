
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditStationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { url: string; name: string; language?: string }) => void;
  initialValues: { url: string; name: string; language?: string };
  error?: string | null;
}

const languages = [
  "English", "Hindi", "Telugu", "Tamil", "Malayalam", "Kannada", 
  "Bengali", "Punjabi", "Marathi", "Gujarati", "Classical Music", "Other"
];

const EditStationDialog: React.FC<EditStationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValues,
  error
}) => {
  // FIXED: Start with empty URL for new input instead of current URL
  const [url, setUrl] = useState("");
  const [name, setName] = useState(initialValues.name);
  const [language, setLanguage] = useState(initialValues.language || "English");

  // Update state when initialValues changes
  useEffect(() => {
    setUrl(""); // Always start with empty URL for new input
    setName(initialValues.name);
    setLanguage(initialValues.language || "English");
  }, [initialValues]);

  const handleSave = () => {
    onSave({ url, name, language });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] w-[95vw]">
        <DialogHeader>
          <DialogTitle>Edit Station</DialogTitle>
          <DialogDescription>
            Update the station details below. Enter a new URL to change the station source.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="station-url" className="text-right">
              New URL
            </Label>
            <Input
              id="station-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
              placeholder="Enter new station URL"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="station-name" className="text-right">
              Name
            </Label>
            <Input
              id="station-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="station-language" className="text-right">
              Language
            </Label>
            <div className="col-span-3">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Error message area - always reserve space for it */}
          <div className="min-h-[40px]">
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStationDialog;
