import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCA9mwqGnBsD0_3bbR30ZgVy1lKArfynLs",
  authDomain: "bootcamp-tracker.firebaseapp.com",
  projectId: "bootcamp-tracker",
  storageBucket: "bootcamp-tracker.firebasestorage.app",
  messagingSenderId: "551894156773",
  appId: "1:551894156773:web:086d4245cedef1cd91db0c",
  measurementId: "G-N4Q8WE2YLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase initialized with auth:", auth !== null);
console.log("Firestore initialized:", db !== null);

export { db, auth };