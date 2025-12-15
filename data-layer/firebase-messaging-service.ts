import { getMessaging, getToken } from "firebase/messaging";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, app } from "../firebase.js";// Assuming you have this export

const VAPID_KEY = "BPehY3HLjxtf7b_yI_QxaY4K3bo-gGL565ZiiT8F_QrOo_DmTz1vENCl8xzDyWR3CzETnIHB7ZUdIidu_9CO76g"; // IMPORTANT: Replace this!

/**
 * Requests permission to show notifications and retrieves the FCM token.
 * @returns {Promise<string | null>} The FCM token if permission is granted, otherwise null.
 */
export async function requestPermissionAndGetToken(): Promise<string | null> {
  try {
    const messaging = getMessaging(app);

    // 1. Ask the user for permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");
      // 2. If permission is granted, get the token
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (currentToken) {
        console.log("FCM Token received:", currentToken);
        return currentToken;
      } else {
        console.log("No registration token available. Request permission to generate one.");
        return null;
      }
    } else {
      console.log("Unable to get permission to notify.");
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
    return null;
  }
}

/**
 * Saves the FCM token to the user's document in Firestore.
 * @param {string} userId - The ID of the user.
 * @param {string} token - The FCM token to save.
 */
export async function saveTokenToFirestore(userId: string, token: string): Promise<void> {
  if (!userId || !token) return;

  const userDocRef = doc(db, "users", userId);

  try {
    // Use arrayUnion to add the token only if it's not already present.
    await updateDoc(userDocRef, {
      fcmTokens: arrayUnion(token),
    });
    console.log("FCM Token saved to user's document.");
  } catch (error) {
    console.error("Error saving FCM token to Firestore: ", error);
  }
}