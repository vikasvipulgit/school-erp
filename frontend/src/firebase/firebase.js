import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC3sYUrcn00e64fzcWhmRns84jlxYFQBBs",
  authDomain: "schoolerp-23c97.firebaseapp.com",
  projectId: "schoolerp-23c97",
  storageBucket: "schoolerp-23c97.firebasestorage.app",
  messagingSenderId: "1078063841691",
  appId: "1:1078063841691:web:5e93770bc8d4153eabe13e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { app, messaging, onMessage, getToken };
