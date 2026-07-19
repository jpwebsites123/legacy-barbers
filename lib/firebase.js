import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1wnD-DsXtxOaQtmuuZFrI4mK5VHC1_cM",
  authDomain: "barber-pro-9dc1e.firebaseapp.com",
  projectId: "barber-pro-9dc1e",
  storageBucket: "barber-pro-9dc1e.firebasestorage.app",
  messagingSenderId: "374270439378",
  appId: "1:374270439378:web:d39cc0d8d5e7c442bae20b",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
