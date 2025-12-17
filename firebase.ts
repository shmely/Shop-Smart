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
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
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