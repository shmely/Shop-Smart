import { GroupId } from "../common/model/types";
import { FirebaseProductCacheService } from "./firebaseProductCacheService";
import { getFunctions, httpsCallable } from "firebase/functions";


const functions = getFunctions();

const callCategorizeItem = httpsCallable(functions, 'categorizeItemWithGemini');

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