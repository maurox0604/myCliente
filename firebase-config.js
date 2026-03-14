// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBhDBYqPXh7wKxa0OeyhJw1s9ryvxnokCs",
    authDomain: "login-ice-queen.firebaseapp.com",
    projectId: "login-ice-queen",
    storageBucket: "login-ice-queen.firebasestorage.app",
    messagingSenderId: "293336610884",
    appId: "1:293336610884:web:fc655c8c3cef13e9976411"
};


// ✅ inicialización única
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);