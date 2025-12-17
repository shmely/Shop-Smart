import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// --- THIS IS THE CRITICAL CHANGE ---
// Use the "@/" alias you defined in tsconfig.json. Do NOT use "../../"
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
