import { GroupId } from "../common/model/types";
import { FirebaseProductCacheService } from "./firebaseProductCacheService";
import { getFunctions, httpsCallable } from "firebase/functions";


const functions = getFunctions();

const callCategorizeItem = httpsCallable(functions, 'categorizeItemWithGemini');
// export const categorizeItem = async (itemName: string, language: 'he' | 'en'): Promise<GroupId> => {
//   try {
//     // First, check the local cache
//     const cachedItem = FirebaseProductCacheService.searchSimilar(itemName);
//     if (cachedItem) {
//       console.log(`Found cached category for "${itemName}": ${cachedItem.groupId}`);
//       return cachedItem.groupId;
//     }

//     // If not found in cache, use AI
//     console.log(`Using AI to categorize "${itemName}"`);
//     const modelId = 'gemini-2.5-flash';

//     const prompt = `
//       You are a grocery assistant. 
//       Categorize the item "${itemName}" (Language: ${language}) into exactly one of the following Group IDs:
//       - ${GroupId.FRUITS_VEG}
//       - ${GroupId.DAIRY}
//       - ${GroupId.BAKERY}
//       - ${GroupId.FROZEN}
//       - ${GroupId.DRY_GOODS}
//       - ${GroupId.CLEANING}
//       - ${GroupId.BUTCHER}
//       - ${GroupId.OTHER}
//       - ${GroupId.FISHS}
//       - ${GroupId.DRINKS}
//       - ${GroupId.ALCOHOL}
     

//       Return ONLY the Group ID as a string. If unsure, use ${GroupId.OTHER}.
//     `;

//     const response = await genAI.models.generateContent({
//       model: modelId,
//       contents: prompt,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             groupId: {
//               type: Type.STRING,
//               enum: Object.values(GroupId)
//             }
//           },
//           required: ["groupId"]
//         }
//       }
//     });

//     let text = response.text || "{}";
//     if (text.trim().startsWith("```")) {
//       text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
//     }

//     const json = JSON.parse(text);
//     const groupId = json.groupId as GroupId || GroupId.OTHER;

//     return groupId;

//   } catch (error) {
//     console.error("Gemini categorization failed:", error);
//     return GroupId.OTHER;
//   }
// };

export const categorizeItem = async (itemName: string, language: 'he' | 'en'): Promise<GroupId> => {
  try {
    const cachedItem = FirebaseProductCacheService.searchSimilar(itemName);
    if (cachedItem) {
      console.log(`Found cached category for "${itemName}": ${cachedItem.groupId}`);
      return cachedItem.groupId;
    }

    console.log(`Using Cloud Function to categorize "${itemName}"`);
    
    // Call the backend function with the required data
    const response = await callCategorizeItem({ 
      itemName, 
      language,
      groups: Object.values(GroupId) // Pass all possible group IDs
    });

    const data = response.data as { groupId: GroupId };
    const groupId = data.groupId || GroupId.OTHER;

    return groupId;

  } catch (error) {
    console.error("Cloud Function for categorization failed:", error);
    // If the function fails, default to 'other'
    return GroupId.OTHER;
  }
};