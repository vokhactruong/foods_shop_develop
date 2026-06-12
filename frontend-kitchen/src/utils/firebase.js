// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCj3vtkejVlyDSEKKzx6aLPYpbyZAMDfXo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "foods-shop-9ba1a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "foods-shop-9ba1a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "foods-shop-9ba1a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "673983193612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:673983193612:web:f936f1315340e2c3b08429",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K33FXKHLJN",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    // 1. Xin quyền thông báo từ trình duyệt
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // 2. Lấy FCM Token định danh thiết bị này
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BLS98wbOImD8QnLQjCjARoNBwT3MWJwFIvbcJDk4WNBueeheXrTXMPWfiF9Ow-Iz4QmIf9dMUIc5Za4Oa9OjNhk" 
      });
      
      if (token) {
        console.log("FCM Token của thiết bị:", token);
        // LƯU Ý: Bạn cần gửi token này lên Backend (Node.js) qua API 
        // để Backend lưu vào Database, gắn liền với tài khoản Admin này.
        return token;
      }
    } else {
      console.log("Người dùng từ chối cấp quyền thông báo.");
    }
  } catch (error) {
    console.error("Lỗi lấy FCM Token:", error);
  }
};

// Lắng nghe thông báo khi người dùng ĐANG MỞ APP (Chạy nổi)
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
