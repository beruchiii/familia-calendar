import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXkDTf0H9wc_8ydwxZ3jCcDM-xFXG9LSM",
  authDomain: "familiapp-14ac9.firebaseapp.com",
  projectId: "familiapp-14ac9",
  storageBucket: "familiapp-14ac9.firebasestorage.app",
  messagingSenderId: "279469139140",
  appId: "1:279469139140:web:a4152edfad5015cad89591"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
