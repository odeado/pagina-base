import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkDnJZhNvqEaRsWEypzqb8J8HVmiGaqtc",
  authDomain: "pagina-base-7876d.firebaseapp.com",
  projectId: "pagina-base-7876d",
  storageBucket: "pagina-base-7876d.firebasestorage.app",
  messagingSenderId: "43433634522",
  appId: "1:43433634522:web:ea95fe28386920ffc993e3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
