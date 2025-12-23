import * as functions from "firebase-functions";
import admin from "firebase-admin";
import { onCall, CallableRequest } from "firebase-functions/v2/https";
// Updated to v2 firestore for compatibility with Node 24
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  CategorizeRequestData,
  ShoppingList,
  User,
} from "./common/model/types.js";

admin.initializeApp();

export const categorizeItemWithGemini = onCall(
  { secrets: ["GEMINI_API_KEY"],
    cors: true,
    region: "us-central1",
    invoker: "public"
   },
  async (request: CallableRequest<CategorizeRequestData>) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("FATAL: GEMINI_API_KEY secret not loaded or is empty.");
      throw new functions.https.HttpsError(
        "internal",
        "Server is missing API key configuration."
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Corrected model name to 1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { itemName, language, groups } = request.data;

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
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim(); // Trimmed to avoid accidental whitespace errors

      if (groups.includes(responseText)) {
        return { groupId: responseText };
      } else {
        console.warn(
          `Gemini returned an invalid group ID: '${responseText}'. ` +
          "Defaulting to 'other'."
        );
        return { groupId: "other" };
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new functions.https.HttpsError(
        "internal",
        `Failed to categorize item with Gemini: ${error}`
      );
    }
  }
);

export const sendNotificationOnItemAdd = onDocumentUpdated(
  "shoppingLists/{listId}",
  async (event) => {
    const data = event.data;
    if (!data) {
      console.error("event.data is undefined.");
      return;
    }

    const listAfter = data.after.data() as ShoppingList;
    const listBefore = data.before.data() as ShoppingList;

    // Check if items were actually added
    if (!listAfter.items || !listBefore.items || listAfter.items.length <= listBefore.items.length) {
      return;
    }

    const beforeItemIds = new Set(listBefore.items.map((item: any) => item.id));
    const newItem = listAfter.items.find((item: any) => !beforeItemIds.has(item.id));

    if (!newItem) {
      return;
    }

    const membersToNotify = listAfter.members?.filter(uid => uid !== newItem.addedBy);
    if (membersToNotify.length === 0) {
      return;
    }

    const userPromises = membersToNotify.map((uid: string) =>
      admin.firestore().collection("users").doc(uid).get()
    );
    const userDocs = await Promise.all(userPromises);

    const allTokens = userDocs.flatMap((doc: any) => {
      const userData = doc.data() as User | undefined;
      return userData?.fcmTokens || [];
    });

    if (allTokens.length === 0) {
      console.log("Found members to notify, but no registered FCM tokens.");
      return;
    }

    const notificationPayload = {
      notification: {
        title: `מוצר חדש "${listAfter.name}"`,
        body: `${newItem.name} נוסף לרשימה.`,
      },
    };

    console.log(
      `Sending notification about '${newItem.name}' to ${allTokens.length} token(s).`
    );

    try {
      await admin.messaging().sendEachForMulticast({
        tokens: allTokens,
        notification: notificationPayload.notification,
      });
    } catch (error) {
      console.error("Error sending multicast notification:", error);
    }
  }
);