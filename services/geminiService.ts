import { GoogleGenAI, Type } from "@google/genai";
import { GroupId } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const categorizeItem = async (itemName: string, language: 'he' | 'en'): Promise<GroupId> => {
  try {
    const modelId = 'gemini-2.5-flash'; 
    
    // We want a very strict JSON response mapping the item to one of our enums
    const prompt = `
      You are a grocery assistant. 
      Categorize the item "${itemName}" (Language: ${language}) into exactly one of the following Group IDs:
      - ${GroupId.FRUITS_VEG}
      - ${GroupId.DAIRY}
      - ${GroupId.BAKERY}
      - ${GroupId.FROZEN}
      - ${GroupId.DRY_GOODS}
      - ${GroupId.CLEANING}
      - ${GroupId.OTHER}

      Return ONLY the Group ID as a string. If unsure, use ${GroupId.OTHER}.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            groupId: {
              type: Type.STRING,
              enum: Object.values(GroupId)
            }
          },
          required: ["groupId"]
        }
      }
    });

    let text = response.text || "{}";
    // Cleanup potential markdown code blocks if the model adds them despite JSON mime type
    if (text.trim().startsWith("```")) {
      text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const json = JSON.parse(text);
    return json.groupId as GroupId || GroupId.OTHER;

  } catch (error) {
    console.error("Gemini categorization failed:", error);
    return GroupId.OTHER; // Fallback
  }
};