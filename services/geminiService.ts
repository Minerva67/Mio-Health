import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Language } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Define the strict Schema for Gemini
const foodAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    is_food: { type: Type.BOOLEAN, description: "Set to true if the image contains edible food or drink. Set to false if it is an object, person, or non-food item." },
    request_id: { type: Type.STRING, description: "A unique UUID for this request" },
    analysis_summary: {
      type: Type.OBJECT,
      properties: {
        total_calories: { type: Type.NUMBER, description: "Estimated total calories" },
        total_carbs: { type: Type.NUMBER, description: "Total Carbohydrates in grams" },
        total_protein: { type: Type.NUMBER, description: "Total Protein in grams" },
        total_fat: { type: Type.NUMBER, description: "Total Fat in grams" },
        overall_health_score: { type: Type.NUMBER, description: "Health score from 1 to 10" },
        meal_type: { type: Type.STRING, description: "e.g., Breakfast, Lunch, Snack" },
        short_description: { type: Type.STRING, description: "A brief 1-sentence summary of the meal" }
      },
      required: ["total_calories", "total_carbs", "total_protein", "total_fat", "overall_health_score", "meal_type", "short_description"]
    },
    food_details: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Natural name of the food item (e.g. 'Beef', 'Rice', 'Sweet Potato Vermicelli'). Do NOT use words like 'Hidden' or '隐藏'." },
          gi_value: { type: Type.NUMBER, description: "Glycemic Index value (0-100)" },
          gi_level: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          glycemic_load: { type: Type.NUMBER, description: "Glycemic Load = (GI * Carbs) / 100" },
          portion_size: { type: Type.STRING, description: "Estimated portion size (e.g., '1 cup', '150g')" },
          calories_approx: { type: Type.NUMBER, description: "Calories for this item" },
          carbs_g: { type: Type.NUMBER, description: "Carbs in grams" },
          protein_g: { type: Type.NUMBER, description: "Protein in grams" },
          fat_g: { type: Type.NUMBER, description: "Fat in grams" }
        },
        required: ["name", "gi_value", "gi_level", "glycemic_load", "portion_size", "calories_approx", "carbs_g", "protein_g", "fat_g"]
      }
    },
    nutritional_advice: {
      type: Type.OBJECT,
      properties: {
        advice_list: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 specific tips. For high GI foods, suggest food swaps or eating order."
        }
      },
      required: ["advice_list"]
    }
  },
  required: ["is_food", "request_id", "analysis_summary", "food_details", "nutritional_advice"]
};

export const analyzeFoodImage = async (file: File, lang: Language): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imagePart = await fileToGenerativePart(file);
  
  const langInstruction = lang === 'zh' 
    ? "OUTPUT LANGUAGE: SIMPLIFIED CHINESE (zh-CN). All names, descriptions, and ADVICE must be in Chinese." 
    : "OUTPUT LANGUAGE: ENGLISH. All names, descriptions, and ADVICE must be in English.";

  const prompt = `
    Act as an expert clinical dietician and fitness coach. Analyze the provided image.
    
    TASK:
    1. **IDENTIFICATION (CRITICAL)**: 
       - Accurately identify the dish. 
       - **Hot Pot / Malatang vs Noodle Soup**: 
         - If you see a large pot with boiling broth and various raw or cooked ingredients (meat slices, vegetables, fish balls) WITHOUT a clear mound of noodles, identify it as **Hot Pot (火锅)** or **Malatang (麻辣烫)**. 
         - Do NOT hallucinate noodles if they are not clearly visible. 
         - Do NOT default to "Beef Noodle Soup" just because there is broth and meat.
       - **Communal Dishes**: If the dish looks like a shared platter, estimate the total value.

    2. **ESTIMATION**:
       - **Standard Portions**: Use restaurant standards as a baseline only if scale is unclear.
       - **Hot Pot Calculation**: For Hot Pot, estimate the *edible solids* intake for one person if it looks like a single serving, or the total pot content if it looks like a shared pot.
       - **Hidden Calories**: Account for oil saturation in cooked vegetables and meats in spicy broths.
       - **Sauces**: Increase calorie estimates by 20% for restaurant food due to oil/sugar/glazes.

    3. **ANALYZE DETAILS**:
       - Name items naturally (e.g. "Sweet Potato Vermicelli", "Beef Brisket", "Enoki Mushrooms").
       - Calculate GL: Glycemic Load = (GI * Carbs) / 100.
    
    ${langInstruction}
    
    Ensure strictly valid JSON output matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: foodAnalysisSchema,
        thinkingConfig: { thinkingBudget: 4096 }, 
        temperature: 0.2,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as AnalysisResult;
    return data;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};