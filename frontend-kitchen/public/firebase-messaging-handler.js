importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCj3vtkejVlyDSEKKzx6aLPYpbyZAMDfXo',
  authDomain: 'foods-shop-9ba1a.firebaseapp.com',
  projectId: 'foods-shop-9ba1a',
  storageBucket: 'foods-shop-9ba1a.firebasestorage.app',
  messagingSenderId: '673983193612',
  appId: '1:673983193612:web:f936f1315340e2c3b08429',
  measurementId: 'G-K33FXKHLJN',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Thong bao moi';
  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data || {},
    tag: payload.data?.type || 'foods-shop-notification',
  };

  self.registration.showNotification(title, options);
});
