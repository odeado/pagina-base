import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración para desarrollo y producción
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkDnJZhNvqEaRsWEypzqb8J8HVmiGaqtc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pagina-base-7876d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pagina-base-7876d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pagina-base-7876d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "43433634522",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:43433634522:web:ea95fe28386920ffc993e3"
};

// Verificación (solo para desarrollo)
if (typeof window !== 'undefined' && !firebaseConfig.projectId) {
  console.error("Firebase no está configurado correctamente");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
