import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAX0lDahRpVnu17A2lu8exPPWxUbBlusmA",
  authDomain: "cropbuddy-98035.firebaseapp.com",
  projectId: "cropbuddy-98035",
  storageBucket: "cropbuddy-98035.firebasestorage.app",
  messagingSenderId: "514894419469",
  appId: "1:514894419469:web:1927b10cb6a08a971de744",
  measurementId: "G-NS0XD02CCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const db = getFirestore(app);
export const storage = getStorage(app);
