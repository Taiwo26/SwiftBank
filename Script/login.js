import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

console.log("login.js loaded");

document.querySelectorAll(".eye-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    target.type = target.type === "password" ? "text" : "password";
    btn.textContent = target.type === "password" ? "👁️" : "🙈";
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
