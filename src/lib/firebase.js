// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKfdjLKtYmo6IAUTeBQ-YU7qMkB0gY6QE",
  authDomain: "hikaya-9c8be.firebaseapp.com",
  projectId: "hikaya-9c8be",
  storageBucket: "hikaya-9c8be.firebasestorage.app",
  messagingSenderId: "356218185547",
  appId: "1:356218185547:web:6611f2d3a59e489b336ace",
  measurementId: "G-6XFG8R8RJ7"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Only initialize analytics in the browser
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);

export { app, analytics, auth };