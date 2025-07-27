// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Replace with your Firebase config from step 3 above
const firebaseConfig = {
  apiKey: "AIzaSyAJcP5mw2_1AdCAtr-NgqXnsgj9KvAJ4xI",
  authDomain: "student-council-portal-vit.firebaseapp.com",
  projectId: "student-council-portal-vit",
  storageBucket: "student-council-portal-vit.firebasestorage.app",
  messagingSenderId: "72879649822",
  appId: "1:72879649822:web:b4b7e197ef2860f8fd6a0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);