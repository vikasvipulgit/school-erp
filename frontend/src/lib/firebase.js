import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0QAZMBgM3j0k4RjCrpU9eepLXBWFeOwM",
  authDomain: "school-erp-6b4b4.firebaseapp.com",
  projectId: "school-erp-6b4b4",
  storageBucket: "school-erp-6b4b4.firebasestorage.app",
  messagingSenderId: "794104086352",
  appId: "1:794104086352:web:440fd0c2b7df401312b655",
  measurementId: "G-781Y8HBJ6M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
