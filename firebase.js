import { initializeApp } from "firebase/app";
import {
    getAuth,
    setPersistence,             // פונקציה להגדרת המדיניות
    browserLocalPersistence     // המדיניות עצמה (לשמור מקומית)
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBW8SVnMR0DE4OkHwoE8Lk81snayuTBy2E",
    authDomain: "gen-lang-client-0854447705.firebaseapp.com",
    projectId: "gen-lang-client-0854447705",
    storageBucket: "gen-lang-client-0854447705.firebasestorage.app",
    messagingSenderId: "861915527720",
    appId: "1:861915527720:web:d382f5c27f1396de82931d",
    measurementId: "G-VECPP1CS9H"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
export const db = getFirestore(app);

