import { initializeApp } from "firebase/app";
import {
    getAuth,
    setPersistence,             // פונקציה להגדרת המדיניות
    browserLocalPersistence,     // המדיניות עצמה (לשמור מקומית)
    connectAuthEmulator
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
};


export const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
export const db = getFirestore(app);
const functions = getFunctions(app);

if (window.location.hostname === "localhost") {
  console.log("Connecting to local Firebase emulators...");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectFunctionsEmulator(functions, "localhost", 5001);
}