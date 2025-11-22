import { AnalysisResult, Language } from "../types";

export const analyzeFoodImage = async (file: File, lang: Language): Promise<AnalysisResult> => {
  try {
    // 1. Prepare the data
    const formData = new FormData();
    formData.append('image', file);
    formData.append('lang', lang);

    // 2. Send to OUR server (not Google directly)
    // The server.js will handle the actual AI communication
    const response = await fetch('/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error: ${errorText}`);
    }

    // 3. Return the clean JSON result from the server
    const data = await response.json();
    return data as AnalysisResult;

  } catch (error) {
    console.error("Upload Failed:", error);
    throw new Error("Failed to analyze image. Please check your connection and try again.");
  }
};