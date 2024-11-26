// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyCzKLqYltrbSGwDAcJe4MiCdLzF64r_2tI",
  authDomain: "elearning-5f0a1.firebaseapp.com",
  projectId: "elearning-5f0a1",
  storageBucket: "elearning-5f0a1.appspot.com", 
  messagingSenderId: "42134704778",
  appId: "1:42134704778:web:9af061603cfec64746d373",
  measurementId: "G-7E85ZDC64K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
