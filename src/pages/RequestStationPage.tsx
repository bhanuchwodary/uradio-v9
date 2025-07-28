import React, { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import RequestStationForm, { RequestStationFormData } from "@/components/request-station/RequestStationForm";
import { createRequestMailtoLink } from "@/utils/requestStationUtils";
import InfoBox from "@/components/ui/InfoBox";

const RequestStationPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RequestStationFormData>({
    requestType: "add",
    stationName: "",
    stationUrl: "",
    language: "",
    description: "",
    contactEmail: "",
    existingStationUrl: ""
  });

  const handleInputChange = (field: keyof RequestStationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.stationName || !formData.contactEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.requestType === "add" && !formData.stationUrl) {
      toast({
        title: "Missing Station URL",
        description: "Please provide the station URL for new station requests",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.requestType === "modify" && !formData.existingStationUrl) {
      toast({
        title: "Missing Station URL",
        description: "Please provide the existing station URL for modification requests",
        variant: "destructive"
      });
      return;
    }

    // Create mailto link
    const mailtoLink = createRequestMailtoLink(formData);
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    toast({
      title: "Email Opened",
      description: "Your email client has been opened with the request details. Please send the email to complete your request.",
    });
    
    // Reset form
    setFormData({
      requestType: "add",
      stationName: "",
      stationUrl: "",
      language: "",
      description: "",
      contactEmail: "",
      existingStationUrl: ""
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce" style={{ paddingTop: 'calc(5rem + max(env(safe-area-inset-top), 0px))' }}>
      {/* FIXED Added proper gap between header and content */}
      <div className="container mx-auto max-w-2xl space-y-6 pt-4">
        <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 elevation-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Request Station
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Request to add a new station or modify an existing one
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <RequestStationForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />

            {/* Info Box */}
            <InfoBox>
              <p>
                <strong>Note:</strong> This will open your default email client with a pre-filled message. 
                Please send the email to complete your request. We'll review your submission and get back to you.
              </p>
            </InfoBox>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestStationPage;
