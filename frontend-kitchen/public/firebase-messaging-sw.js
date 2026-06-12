// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCj3vtkejVlyDSEKKzx6aLPYpbyZAMDfXo",
  authDomain: "foods-shop-9ba1a.firebaseapp.com",
  projectId: "foods-shop-9ba1a",
  storageBucket: "foods-shop-9ba1a.firebasestorage.app",
  messagingSenderId: "673983193612",
  appId: "1:673983193612:web:f936f1315340e2c3b08429",
  measurementId: "G-K33FXKHLJN"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Cấu hình cách hiển thị thông báo khi app đang tắt (Chạy ngầm)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Nhận thông báo ngầm: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png', // Icon hiển thị
    badge: '/icon-192.png', // Icon nhỏ trên thanh trạng thái Android
    data: payload.data // Dữ liệu đi kèm (ví dụ: link dẫn tới đơn hàng)
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});