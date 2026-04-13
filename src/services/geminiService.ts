import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  baseServings: number;
  dietaryLabels: string[];
  allergens: string[];
  ingredients: Ingredient[];
  instructions: string[];
}

export async function searchRecipes(query: string, filters: any): Promise<Recipe[]> {
  const prompt = `
    Search the internet for 3-4 real food recipes based on the search query: "${query}".
    Consider these filters: ${JSON.stringify(filters)}.
    
    CRITICAL: DO NOT generate fake recipes. You MUST search the web and return real recipes from real websites.
    
    For each recipe, provide:
    - A unique ID
    - Title (exactly as it appears on the source website)
    - A short, appetizing description
    - A real image URL from the source website. If you absolutely cannot find one, use "https://picsum.photos/seed/{recipe_name_no_spaces}/800/600".
    - Preparation time in minutes
    - Cooking time in minutes
    - Base servings (e.g., 2, 4)
    - Dietary labels (e.g., "Vegan", "Gluten-Free", "High Protein")
    - Allergens (e.g., "Nuts", "Dairy", "Shellfish", "Soy"). If none, provide an empty array.
    - A list of ingredients. For EACH ingredient, provide the exact amount, unit, and nutritional information (calories, protein in grams, fat in grams, carbs in grams) for that specific amount. Estimate nutrition if not explicitly provided.
    - Step-by-step instructions.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            prepTime: { type: Type.NUMBER },
            cookTime: { type: Type.NUMBER },
            baseServings: { type: Type.NUMBER },
            dietaryLabels: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            allergens: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER }
                },
                required: ["name", "amount", "unit", "calories", "protein", "fat", "carbs"]
              }
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["id", "title", "description", "imageUrl", "prepTime", "cookTime", "baseServings", "dietaryLabels", "allergens", "ingredients", "instructions"]
        }
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as Recipe[];
  } catch (error) {
    console.error("Failed to parse recipes:", error);
    return [];
  }
}
