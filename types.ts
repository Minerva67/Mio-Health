
// Analysis Result Interface matching the JSON Schema
export interface AnalysisSummary {
  total_calories: number;
  total_carbs: number;    // Added for Diabetics/Fitness
  total_protein: number;  // Added for Fitness
  total_fat: number;      // Added for Fitness
  overall_health_score: number; // 1-10
  meal_type: string;
  short_description: string;
}

export enum GiLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High"
}

export interface FoodItem {
  name: string;
  gi_value: number;
  gi_level: GiLevel;
  glycemic_load: number; // Added: GL is crucial for diabetics (GI * Carbs / 100)
  portion_size: string;
  calories_approx: number;
  carbs_g: number;       // Added
  protein_g: number;     // Added
  fat_g: number;         // Added
}

export interface NutritionalAdvice {
  advice_list: string[];
}

export interface AnalysisResult {
  is_food: boolean; // New: Checks if the image is actually food
  request_id: string;
  analysis_summary: AnalysisSummary;
  food_details: FoodItem[];
  nutritional_advice: NutritionalAdvice;
}

export type AppStatus = 'idle' | 'analyzing' | 'success' | 'error';

export type Language = 'en' | 'zh';

// --- NEW: User Profile & Tracking ---

export type Gender = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export interface UserProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender;
  activity: ActivityLevel;
  goal: Goal;
  bmr: number;        // Basal Metabolic Rate
  tdee: number;       // Total Daily Energy Expenditure (Target Calories)
}

export interface MealEntry {
  id: string;
  timestamp: number;
  name: string; // e.g. "Lunch"
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  items: string[]; // names of food items
}

export interface DailyLog {
  date: string;       // YYYY-MM-DD
  entries: MealEntry[]; // Changed from flat numbers to array of entries
}