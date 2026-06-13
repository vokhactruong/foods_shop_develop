import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve('.env'));
loadEnvFile(path.resolve('.env.local'));

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_VAPID_KEY',
];

const optionalKeys = ['VITE_FIREBASE_MEASUREMENT_ID'];

const missing = requiredKeys.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing Firebase env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const config = Object.fromEntries(
  [...requiredKeys, ...optionalKeys].map((key) => [key, process.env[key] || ''])
);

const publicDir = path.resolve('public');
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(
  path.join(publicDir, 'firebase-config.js'),
  `self.FOODS_SHOP_FIREBASE_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  'utf8'
);
