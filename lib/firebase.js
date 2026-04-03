import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.AIzaSyD8-CEB-HZMouwx_HLGmPfnOOD5HmF3nUM,
  authDomain: process.env.upload-cs2.firebaseapp.com,
  projectId: process.env.upload-cs2,
  storageBucket: process.env.upload-cs2.firebasestorage.app,
  messagingSenderId: process.env.611922955960,
  appId: process.env.1:611922955960:web:c9b87c819075e33446ae4d,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
