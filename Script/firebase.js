import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBkPrl24buwZOP5ouiqP8YexT62igA1k_I",
  authDomain: "swiftbank-final.firebaseapp.com",
  projectId: "swiftbank-final",
  storageBucket: "swiftbank-final.firebasestorage.app",
  messagingSenderId: "527739596033",
  appId: "1:527739596033:web:3e956cfd2eda360698bf00"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

