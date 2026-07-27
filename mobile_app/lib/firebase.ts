import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDjSmC1_9DiD2nR-87wyDu_Xud3QtFjNbw",
  authDomain: "rishta-a82ba.firebaseapp.com",
  databaseURL: "https://rishta-a82ba-default-rtdb.firebaseio.com",
  projectId: "rishta-a82ba",
  storageBucket: "rishta-a82ba.firebasestorage.app",
  messagingSenderId: "84663408129",
  appId: "1:84663408129:web:efed33fae81006d4535200",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const database = getDatabase(app);
