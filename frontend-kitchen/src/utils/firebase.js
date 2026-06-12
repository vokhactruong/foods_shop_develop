import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCj3vtkejVlyDSEKKzx6aLPYpbyZAMDfXo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'foods-shop-9ba1a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'foods-shop-9ba1a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'foods-shop-9ba1a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '673983193612',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:673983193612:web:f936f1315340e2c3b08429',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-K33FXKHLJN',
};

const app = initializeApp(firebaseConfig);

async function getSupportedMessaging() {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}

async function getFirebaseMessagingWorker() {
  if (!('serviceWorker' in navigator)) return undefined;

  return navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/firebase-cloud-messaging-push-scope',
  });
}

export async function requestForToken() {
  try {
    if (!('Notification' in window)) {
      throw new Error('Trinh duyet khong ho tro Notification API.');
    }

    const messaging = await getSupportedMessaging();
    if (!messaging) {
      throw new Error('Trinh duyet khong ho tro Firebase Messaging.');
    }

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error(`Quyen thong bao hien tai: ${permission}`);
    }

    const serviceWorkerRegistration = await getFirebaseMessagingWorker();
    const token = await getToken(messaging, {
      vapidKey:
        import.meta.env.VITE_FIREBASE_VAPID_KEY ||
        'BLS98wbOImD8QnLQjCjARoNBwT3MWJwFIvbcJDk4WNBueeheXrTXMPWfiF9Ow-Iz4QmIf9dMUIc5Za4Oa9OjNhk',
      serviceWorkerRegistration,
    });

    if (!token) {
      throw new Error('Firebase khong tra ve FCM token.');
    }

    console.log('FCM token:', token);
    return token;
  } catch (error) {
    console.error('Loi lay FCM token:', error);
    throw error;
  }
}

export function onMessageListener() {
  return new Promise(async (resolve) => {
    const messaging = await getSupportedMessaging();
    if (!messaging) {
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}
