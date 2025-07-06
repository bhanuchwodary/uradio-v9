
import type { RequestStationFormData } from "@/components/request-station/RequestStationForm";

export const createRequestMailtoLink = (formData: RequestStationFormData): string => {
  const subject = formData.requestType === "add" 
    ? `New Station Request: ${formData.stationName}`
    : `Station Modification Request: ${formData.stationName}`;
    
  const body = [
    'Station Request Details:',
    '------------------------',
    `Request Type: ${formData.requestType === "add" ? "Add New Station" : "Modify Existing Station"}`,
    `Station Name: ${formData.stationName}`,
    formData.requestType === 'add'
      ? `Station URL: ${formData.stationUrl}`
      : `Existing Station URL: ${formData.existingStationUrl}`,
    `Language: ${formData.language || 'Not specified'}`,
    `Contact Email: ${formData.contactEmail}`,
    '',
    'Description:',
    formData.description || 'No additional description provided',
    '',
    '---',
    'This request was submitted via uRadio app.',
  ].join('\n');

  return `mailto:request.uradio@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
