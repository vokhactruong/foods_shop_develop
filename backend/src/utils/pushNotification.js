const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let initialized = false;

function readServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(__dirname, '../../foods-shop-9ba1a-firebase-adminsdk-fbsvc-1f70d9e28e.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn('Firebase service account not found. Push notifications are disabled.');
    return null;
  }

  return require(serviceAccountPath);
}

function ensureFirebaseAdmin() {
  if (initialized || admin.apps.length) {
    initialized = true;
    return true;
  }

  const serviceAccount = readServiceAccount();
  if (!serviceAccount) return false;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
  return true;
}

async function sendPushNotification(tokens, title, body, data = {}) {
  const tokenList = [...new Set([tokens].flat().filter(Boolean))];
  if (!tokenList.length || !ensureFirebaseAdmin()) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  const response = await admin.messaging().sendEachForMulticast({
    tokens: tokenList,
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])),
    webpush: {
      notification: {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      },
    },
  });

  const invalidTokens = response.responses
    .map((item, index) => ({ item, token: tokenList[index] }))
    .filter(({ item }) => {
      const code = item.error?.code;
      return code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token';
    })
    .map(({ token }) => token);

  return { ...response, invalidTokens };
}

module.exports = { sendPushNotification };
