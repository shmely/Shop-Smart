import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {onCall, CallableRequest} from "firebase-functions/v2/https";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {ShoppingList, User} from "@/model/types";


admin.initializeApp();

export const sendNotificationOnItemAdd = functions.firestore.onDocumentUpdated(
  "shoppingLists/{listId}",
  async (event) => {
    if (!event.data) {
      console.error("event.data is undefined.");
      return null;
    }
    const listAfter = event.data.after.data() as ShoppingList;
    const listBefore = event.data.before.data() as ShoppingList;

    if (listAfter.items.length <= listBefore.items.length) {
      return null;
    }

    const beforeItemIds = new Set(listBefore.items.map((item) => item.id));
    const newItem = listAfter.items.find((item) => !beforeItemIds.has(item.id));

    if (!newItem) {
      return null;
    }

    // const membersToNotify = listAfter.members.filter(
    //   (memberId: string) => memberId !== newItem.addedBy
    // );
    const membersToNotify = listAfter.members;
    if (membersToNotify.length === 0) {
      return null;
    }

    const userPromises = membersToNotify.map((uid: string) =>
      admin.firestore().collection("users").doc(uid).get()
    );
    const userDocs = await Promise.all(userPromises);

    const allTokens = userDocs.flatMap((doc) => {
      const userData = doc.data() as User | undefined;
      return userData?.fcmTokens || [];
    });

    if (allTokens.length === 0) {
      console.log("Found members to notify, but no registered FCM tokens.");
      return null;
    }

    const payload = {
      notification: {
        title: `New item in "${listAfter.name}"`,
        body: `${newItem.name} was added to the list.`,
        icon: "/icon-192x192.png",
      },
    };

    console.log(
      `Sending notification about '${newItem.name}' to ` +
      `${allTokens.length} token(s).`
    );
    return admin.messaging().sendEachForMulticast({
      tokens: allTokens,
      notification: payload.notification,
    });
  });

let genAI: GoogleGenerativeAI | undefined;
let model: import("@google/generative-ai").GenerativeModel | undefined;


const initializeGemini = () => {
  if (!genAI) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error("FATAL: GEMINI_API_KEY secret not loaded.");
      throw new functions.https.HttpsError(
        "internal",
        "Server is missing API key configuration."
      );
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});
  }
};

interface CategorizeRequestData {
  itemName: string;
  language: "he" | "en";
  groups: string[];
}
// This is the new callable function for your frontend to use
// --- THIS IS THE CORRECTED DEFINITION ---
export const categorizeItemWithGemini = onCall(
  {secrets: ["GEMINI_API_KEY"]}, // Pass options as the first argument
  async (request: CallableRequest<CategorizeRequestData>) => {
    const {itemName, language, groups} = request.data;
    initializeGemini();
    if (!itemName || !language || !groups) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with 'itemName', 'language', and 'groups'."
      );
    }

    const prompt =
    `You are a grocery assistant. Categorize the item "${itemName}" ` +
    `(Language: ${language}) into exactly one of the following Group IDs: ` +
    `${groups.join(", ")}. Return ONLY the Group ID as a string. ` +
    "If unsure, use \"other\".";

    try {
      if (!model) {
        throw new functions.https.HttpsError(
          "internal",
          "Gemini model is not initialized."
        );
      }
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (groups.includes(responseText)) {
        return {groupId: responseText};
      } else {
        console.warn(
          `Gemini returned an invalid group ID: '${responseText}'. ` +
        "Defaulting to 'other'."
        );
        return {groupId: "other"};
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to categorize item with Gemini."
      );
    }
  });
