import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ShopSmartProvider } from './context/ShopSmartContext/ShopSmartContext';
import Header from './components/Header/Header';
import { UserProvider } from './context/UserContext';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

const vapidKey = "leJBBOx0ILR1M4bzC8gTepKjXc53GHzN1NIHFwzyT8Y";
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

function useFirebaseNotifications() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        const messaging = getMessaging(app);

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // Get FCM token
          const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
          });
          // TODO: Save this token to Firestore under the user's document
        }

        // Foreground messages
        onMessage(messaging, (payload) => {
          // Show in-app notification or UI update
          console.log("Foreground message:", payload);
        });
      });
    }
  }, []);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <UserProvider>
      <ShopSmartProvider>
        <Header />
        <App />
      </ShopSmartProvider>
    </UserProvider>
  </React.StrictMode>
);

export default useFirebaseNotifications;