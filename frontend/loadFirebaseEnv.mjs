import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const frontendDir = dirname(fileURLToPath(import.meta.url));
let envLoaded = false;

function normalizeValue(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadEnvFile(filename) {
  const filePath = join(frontendDir, filename);
  if (!existsSync(filePath)) return;

  const contents = readFileSync(filePath, 'utf8');

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    const value = line.slice(separatorIndex + 1);
    process.env[key] = normalizeValue(value);
  }
}

export function loadFrontendEnv() {
  if (envLoaded) return;

  loadEnvFile('.env');
  loadEnvFile('.env.local');
  envLoaded = true;
}

export function requireEnv(name) {
  loadFrontendEnv();

  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getFirebaseClientConfigFromEnv() {
  return {
    apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
    authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: requireEnv('VITE_FIREBASE_APP_ID'),
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };
}
