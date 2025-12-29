import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ShopSmartProvider } from './context/ShopSmartContext/ShopSmartContext';
import Header from './components/Header/Header';
import { UserProvider } from './context/UserContext';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

const vapidKey = 'BPehY3HLjxtf7b_yI_QxaY4K3bo-gGL565ZiiT8F_QrOo_DmTz1vENCl8xzDyWR3CzETnIHB7ZUdIidu_9CO76g';
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

function useFirebaseNotifications() {
  useEffect(() => {
    const setupFCM = async () => {
      if (!('serviceWorker' in navigator)) return;
      console.log('Registering service worker for FCM...');
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
          });
          console.log('Token:', token);
          // SAVE TOKEN TO FIRESTORE HERE
        }

        // IMPORTANT: onMessage returns an unsubscribe function
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('Foreground message received!!', payload);
          // Since it's foreground, the browser WON'T show a popup automatically.
          // You should trigger a custom UI toast here.
          alert(`${payload.notification?.title}: ${payload.notification?.body}`);
        });

        return unsubscribe;
      } catch (err) {
        console.error('FCM Setup Error:', err);
      }
    };

    setupFCM();
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
