import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function firebaseSwPlugin(env) {
  const templatePath = path.resolve(__dirname, 'src/firebase-messaging-sw.template.js');
  const publicSwPath = path.resolve(__dirname, 'public/firebase-messaging-sw.js');

  function processTemplate() {
    const template = fs.readFileSync(templatePath, 'utf-8');
    return template
      .replace(/__VITE_FIREBASE_API_KEY__/g, env.VITE_FIREBASE_API_KEY || '')
      .replace(/__VITE_FIREBASE_AUTH_DOMAIN__/g, env.VITE_FIREBASE_AUTH_DOMAIN || '')
      .replace(/__VITE_FIREBASE_PROJECT_ID__/g, env.VITE_FIREBASE_PROJECT_ID || '')
      .replace(/__VITE_FIREBASE_STORAGE_BUCKET__/g, env.VITE_FIREBASE_STORAGE_BUCKET || '')
      .replace(/__VITE_FIREBASE_MESSAGING_SENDER_ID__/g, env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')
      .replace(/__VITE_FIREBASE_APP_ID__/g, env.VITE_FIREBASE_APP_ID || '');
  }

  return {
    name: 'firebase-sw-env',
    // In build: write the processed SW to public/ so Vite copies it to dist/
    buildStart() {
      fs.writeFileSync(publicSwPath, processTemplate());
    },
    // In dev: intercept requests before Vite serves from public/
    configureServer(server) {
      server.middlewares.use('/firebase-messaging-sw.js', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.end(processTemplate());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), firebaseSwPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
