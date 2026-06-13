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
let messagingPromise;
const SERVICE_WORKER_TIMEOUT_MS = 8000;

async function getSupportedMessaging() {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => (supported ? getMessaging(app) : null));
  }

  return messagingPromise;
}

async function getActiveServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) return undefined;

  const timeout = new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error('Service worker chua san sang. Hay reload PWA roi thu lai.')), SERVICE_WORKER_TIMEOUT_MS);
  });

  try {
    return await Promise.race([navigator.serviceWorker.ready, timeout]);
  } catch {
    const existingRegistration = await navigator.serviceWorker.getRegistration('/');
    if (existingRegistration) return existingRegistration;

    return navigator.serviceWorker.register('/firebase-messaging-sw.js');
  }
}

export const requestForToken = async () => {
  try {
    if (!('Notification' in window)) {
      throw new Error('Trinh duyet khong ho tro Notification API.');
    }

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission !== 'granted') {
      throw new Error(`Quyen thong bao hien tai: ${permission}`);
    }

    const messaging = await getSupportedMessaging();
    if (!messaging) {
      throw new Error('Trinh duyet khong ho tro Firebase Messaging.');
    }

    const serviceWorkerRegistration = await getActiveServiceWorkerRegistration();
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
};

export async function showSystemNotification(payload) {
  if (!('serviceWorker' in navigator) || Notification.permission !== 'granted') return false;

  const registration = await getActiveServiceWorkerRegistration();
  const title = payload.notification?.title || payload.data?.title || 'Thong bao moi';
  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
    tag: payload.data?.type || 'foods-shop-notification',
  };

  await registration.showNotification(title, options);
  return true;
}

export async function subscribeToForegroundMessages(callback) {
  const messaging = await getSupportedMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, callback);
}
