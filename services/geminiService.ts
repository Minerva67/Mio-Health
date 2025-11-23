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

// Existing app structure must be maintained for frontend compatibility
// BUT we strictly enforce the logic from the Expert Prompt provided by user.
const OUTPUT_STRUCTURE = {
  is_food: "boolean (true if edible)",
  request_id: "string",
  _analysis_log: "string (CRITICAL: Strict log of volumetric calculation. Must state: 'Reference object: [X]. Est. Volume: [Y]. Density: [Z]. Calc. Weight: [W]g.')",
  analysis_summary: {
    total_calories: "number (integer, sum of all items)",
    total_carbs: "number (integer)",
    total_protein: "number (integer)",
    total_fat: "number (integer)",
    overall_health_score: "number (1-10, penalize for high sugar sauces/deep frying)",
    meal_type: "string (Breakfast/Lunch/Dinner/Snack)",
    short_description: "string (technical name, e.g., 'Soy-Braised Beef Brisket')"
  },
  food_details: [{
    name: "string (Specific dish name)",
    gi_value: "number (0-100. Base GI + Sauce Correction)",
    gi_level: "Low|Medium|High",
    glycemic_load: "number (Formula: Modified GI * Total Carbs / 100)",
    portion_size: "string (e.g. '150g' or '1 bowl')",
    calories_approx: "number (integer)",
    carbs_g: "number (integer. Include sauce/breading carbs!)",
    protein_g: "number (integer)",
    fat_g: "number (integer)"
  }],
  nutritional_advice: { advice_list: ["string (3 strictly scientific, clinical suggestions based on the analysis)"] }
};

export const analyzeFoodImage = async (file: File, lang: Language): Promise<AnalysisResult> => {
  try {
    const base64Data = await compressImage(file);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // ADVANCED CLINICAL PROMPT (Based on User's "Prompt Expert" Design)
    const prompt = `
      **ROLE**: Senior Clinical Dietitian & Visual Food Analyst (15+ years exp).
      **TASK**: Based on Physics, Volumetric Analysis, and Biochemistry, strictly analyze the food image.
      **OUTPUT LANGUAGE**: ${lang === 'zh' ? 'Simplified Chinese (zh-CN)' : 'English'}.

      ---
      ### 🔬 STEP 1: VOLUMETRIC WEIGHT ESTIMATION (Physics-Based)
      **Goal**: Convert visual pixels to Grams.
      1. **Identify Reference Object**:
         - *Priority A*: Standard objects (Chopsticks, Spoon, 4.5" Rice Bowl).
         - *Priority B*: Container size (assume standard 8-10" plate if undefined).
      2. **Volume Estimation**: Estimate volume (ml/cups) based on container fullness.
      3. **Density Application**:
         - *Leafy Greens*: Low Density (~0.3-0.5 g/ml).
         - *Rice/Starch*: Medium Density (~0.7-1.0 g/ml).
         - *Meat/Protein*: High Density (~1.0-1.2 g/ml).
         - *Mixed Dish*: Decompose into parts (e.g., 60% veg, 40% meat) and sum.
      4. **Result**: Volume (ml) * Density = Weight (g).
      *Constraint*: You MUST log this calculation in the '_analysis_log' field.

      ---
      ### 🧪 STEP 2: GL/GI "BASE + CORRECTION" ALGORITHM
      **Goal**: Identify cooking methods that alter the Base GI.
      1. **Determine Base Value**: Lookup raw ingredient GI.
      2. **Apply Correction Factors**:
         - **Shiny/Sticky Glaze (Red Braised/Teriyaki)**: Indicates Sugar/Starch/Soy. 
           -> ACTION: **ADD Carbs** (Sugars). **RAISE GI** (e.g., Stewed Beef GI 0 -> 45).
         - **Breading/Deep Fried**:
           -> ACTION: **ADD Carbs** (Flour) & **ADD Fat** (Oil).
         - **Steamed/Blanched**: 
           -> ACTION: Use Base Value.
      3. **Calculate GL**: GL = (Modified GI * Total Carbs) / 100.

      ---
      ### 📝 STEP 3: STRICT CLINICAL ADVICE
      - Provide exactly 3 bullet points.
      - Focus on: Blood sugar impact, Nutrient density, Digestion.
      - **NO** generic advice like "Drink more water".

      ### OUTPUT
      Return ONLY valid JSON matching this structure (no markdown, no code blocks):
      ${JSON.stringify(OUTPUT_STRUCTURE)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: { 
        responseMimeType: 'application/json',
        temperature: 0.1, // Very low for calculation precision
        topP: 0.8,
        topK: 20
      },
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      },
    });

    if (!response.text) throw new Error("No response from AI");
    
    const cleanText = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as AnalysisResult;

  } catch (error: any) {
    console.error("Analysis Failed:", error);
    const errString = error.toString().toLowerCase();
    
    // Handle Quota/Rate Limit Errors specifically
    if (errString.includes('429') || errString.includes('quota') || errString.includes('exhausted')) {
       throw new Error("QUOTA_EXCEEDED");
    }

    throw new Error(lang === 'zh' ? "分析失败，请检查图片或网络。" : "Analysis failed. Please check image or network.");
  }
};