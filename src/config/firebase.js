import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2IPd8fNirqvFXI3xRbRzI6GAI073LhzA",
  authDomain: "finterra-apps.firebaseapp.com",
  projectId: "finterra-apps",
  storageBucket: "finterra-apps.firebasestorage.app",
  messagingSenderId: "922876532948",
  appId: "1:922876532948:web:60e49b184cc4e499ed0341",
  measurementId: "G-VVJJ2HN6N5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;