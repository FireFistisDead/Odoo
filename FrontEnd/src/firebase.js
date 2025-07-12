// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcr-jEfx9oY8YTwwmn426C6MID9EAQTCI",
  authDomain: "grow-together-hackathon.firebaseapp.com",
  projectId: "grow-together-hackathon",
  storageBucket: "grow-together-hackathon.firebasestorage.app",
  messagingSenderId: "314262767682",
  appId: "1:314262767682:web:fb5a950d1c5f48650d05db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;