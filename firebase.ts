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
    apiKey: "AIzaSyBW8SVnMR0DE4OkHwoE8Lk81snayuTBy2E",
    authDomain: "gen-lang-client-0854447705.firebaseapp.com",
    projectId: "gen-lang-client-0854447705",
    storageBucket: "gen-lang-client-0854447705.firebasestorage.app",
    messagingSenderId: "861915527720",
    appId: "1:861915527720:web:d382f5c27f1396de82931d",
    measurementId: "G-VECPP1CS9H"
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