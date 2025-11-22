import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenAI, Type } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configure Multer (Memory Storage for handling file uploads)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use(express.json());

// 2. Define the Gemini Schema (Moved from Frontend to Backend)
const foodAnalysisSchema = {
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

// 3. The Controller Endpoint
app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("SERVER ERROR: API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server configuration error: API Key missing" });
    }

    const lang = req.body.lang || 'en';
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Initialize Gemini on the Server
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Construct Prompt
    const langInstruction = lang === 'zh' 
      ? "OUTPUT LANGUAGE: SIMPLIFIED CHINESE (zh-CN). All names, descriptions, and ADVICE must be in Chinese." 
      : "OUTPUT LANGUAGE: ENGLISH. All names, descriptions, and ADVICE must be in English.";

    const prompt = `
      Act as an expert clinical dietician and fitness coach. Analyze the provided image.
      
      TASK:
      1. **IDENTIFICATION**: Accurately identify the dish. If you see raw/boiling ingredients in a pot without noodles, identify as Hot Pot/Malatang.
      2. **ESTIMATION**: Estimate portions, calories (account for oil/sauces), carbs, protein, and fat.
      3. **ANALYZE DETAILS**: Calculate GL (Glycemic Load).
      
      ${langInstruction}
      
      Ensure strictly valid JSON output matching the schema.
    `;

    // Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: foodAnalysisSchema,
        temperature: 0.2,
      }
    });

    // Extract text and send back to client
    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    res.json(JSON.parse(resultText));

  } catch (error) {
    console.error("AI Processing Error:", error);
    res.status(500).json({ error: "AI Analysis Failed", details: error.message });
  }
});

// 4. Serve Frontend
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});