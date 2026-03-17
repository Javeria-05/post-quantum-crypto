// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEkLjlu7BWS8663ek7EHO41Q_3NK8dczg",
  authDomain: "post-quantum-demo.firebaseapp.com",
  projectId: "post-quantum-demo",
  storageBucket: "post-quantum-demo.firebasestorage.app",
  messagingSenderId: "786211166876",
  appId: "1:786211166876:web:21c615edeb7ce79aeaab59",
  measurementId: "G-SLKW83VEE3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);