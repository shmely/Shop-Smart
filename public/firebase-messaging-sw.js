// Import and initialize the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// IMPORTANT: Replace this with your project's Firebase config object
const firebaseConfig = {
    apiKey: "AIzaSyBls2jHnIQXHaBU5Kaz3lu0XKqCC3DHTbg",
    authDomain: "gen-lang-client-0854447705.firebaseapp.com",
    projectId: "gen-lang-client-0854447705",
    storageBucket: "gen-lang-client-0854447705.appspot.com",
    messagingSenderId: "861915527720",
    appId: "1:861915527720:web:d382f5c27f1396de82931d",
    measurementId: "G-VECPP1CS9H"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// This handler will be called when a notification is received in the background
messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
    );

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});