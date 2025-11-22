import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Language } from "../types";

// Helper: Efficiently compress image
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1024;
        let [w, h] = [img.width, img.height];
        
        if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
        else if (h > MAX) { w *= MAX / h; h = MAX; }

        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const OUTPUT_STRUCTURE = {
  is_food: "boolean (true only if edible food/drink)",
  _reasoning: "string (CRITICAL: Explain cooking method detection (fried/steamed?), portion estimation logic, and why GI is 0 for pure proteins)",
  request_id: "string",
  analysis_summary: {
    total_calories: "number (integer, required)",
    total_carbs: "number (integer, required)",
    total_protein: "number (integer, required)",
    total_fat: "number (integer, required)",
    overall_health_score: "number (1-10)",
    meal_type: "string (e.g., Breakfast, Snack)",
    short_description: "string (max 10 words)"
  },
  food_details: [{
    name: "string (specific name)",
    gi_value: "number (0-100, use 0 for pure meats/fats)",
    gi_level: "Low|Medium|High",
    glycemic_load: "number (integer)",
    portion_size: "string (e.g., 1 bowl, 200g)",
    calories_approx: "number",
    carbs_g: "number",
    protein_g: "number",
    fat_g: "number"
  }],
  nutritional_advice: { advice_list: ["string (short, actionable tip)"] }
};

export const analyzeFoodImage = async (file: File, lang: Language): Promise<AnalysisResult> => {
  try {
    const base64Data = await compressImage(file);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Improved Prompt with Chain of Thought (CoT) embedded in JSON
    const prompt = `
      You are an expert Clinical Dietitian and Food Scientist.
      Analyze the attached food image with extreme precision.

      ### ANALYSIS PROTOCOL (CHAIN OF THOUGHT):
      1.  **Detection**: Verify if it is food.
      2.  **Identify Ingredients & Method**: 
          - Differentiate strictly between *Deep-Fried* (High Fat), *Stir-fried* (Medium Fat), and *Steamed/Boiled* (Low Fat).
          - Identify sauces which hide calories.
      3.  **Macro Calculation**:
          - Pure Protein (Chicken breast, Egg whites, Fish) -> **GI is 0**.
          - Pure Fats (Oils, Butter) -> **GI is 0**.
          - Only Carbohydrates trigger GI.
      4.  **Portion Estimation**:
          - Don't just guess standard 100g. Look at the container/plate size.

      ### OUTPUT REQUIREMENT:
      - Return ONLY valid JSON.
      - **CRITICAL**: You MUST fill the "_reasoning" field first. Use it to "think out loud" about the cooking method and portion size before generating the numbers. This prevents hallucinations.
      - Structure: ${JSON.stringify(OUTPUT_STRUCTURE)}

      ### LANGUAGE:
      Respond strictly in ${lang === 'zh' ? 'Simplified Chinese (zh-CN)' : 'English'}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: { 
        responseMimeType: 'application/json',
        temperature: 0.5, // Lower temperature for more consistent numerical output
        topP: 0.95,
        topK: 40
      },
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      },
    });

    if (!response.text) throw new Error("No response from AI");
    
    // Clean up potential markdown formatting
    const cleanText = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Failed:", error);
    throw new Error(lang === 'zh' ? "分析失败，请检查网络或 API Key。" : "Analysis failed. Please check your API Key.");
  }
};