import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC43Jmp2za8nzErFO2P6QiwUzkMt1PfhMo",
  authDomain: "vendorvision11.firebaseapp.com",
  projectId: "vendorvision11",
  storageBucket: "vendorvision11.firebasestorage.app",
  messagingSenderId: "492923552280",
  appId: "1:492923552280:web:7ee9c4314a7474cd06b96d",
  measurementId: "G-6MW7XCMPVP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
