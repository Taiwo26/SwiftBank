import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

console.log("login.js loaded");

const eyeIcon = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>`;

const eyeOffIcon = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>`;

document.querySelectorAll(".eye-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    target.type = target.type === "password" ? "text" : "password";
    btn.innerHTML = target.type === "password" ? eyeIcon : eyeOffIcon;
  });
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("form submitted");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  try {
    // Remember me checked -> stays logged in after closing the browser.
    // Unchecked -> session ends when the browser tab/window closes.
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("LOGIN SUCCESS", userCredential);

    window.location.href = "dashboard.html";

  } catch (error) {
    console.log("LOGIN FAILED", error.code, error.message);

    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
      alert("Incorrect email or password.");
    } else if (error.code === "auth/user-not-found") {
      alert("No account found with that email.");
    } else {
      alert(error.message);
    }
  }
});
