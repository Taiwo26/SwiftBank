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

document.querySelectorAll(".eye-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target)
    target.type = target.type === "password" ? "text" : "password"
    btn.innerHTML = target.type === "password" ? eyeIcon : eyeOffIcon;

  })
})


const passwordInput = document.getElementById("password");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");

passwordInput.addEventListener('input', () => {
  const val = passwordInput.value;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  strengthFill.className = 'strength-fill';
  if (val.length === 0) {
    strengthFill.style.width = '0%';
    strengthLabel.textContent = 'Password strength';
  } else if (score <= 1) {
    strengthFill.classList.add('weak');
    strengthLabel.textContent = 'Weak password';
  } else if (score <= 2) {
    strengthFill.classList.add('medium');
    strengthLabel.textContent = 'Medium password';
  } else if (score <= 3) {
    strengthFill.classList.add('strong');
    strengthLabel.textContent = 'Strong password';
  } else {
    strengthFill.classList.add('very-strong');
    strengthLabel.textContent = 'Very strong password';
  }
});

console.log("auth.js loaded");

import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const bvn = document.getElementById('bvn').value;
  const phone = document.getElementById('phone').value;
  const dob = document.getElementById('dob').value;
  const accountType = document.getElementById('accountType').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsAccepted = document.getElementById('terms').checked;

  if (password !== confirmPassword) {
    alert("Passwords don't match");
    return;
  }

  if (!termsAccepted) {
    alert("Please agree to the Terms and Privacy Policy to continue");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await set(ref(db, 'users/' + user.uid), {
      fullName: fullName,
      email: email,
      bvn: bvn,
      phone: phone,
      dob: dob,
      accountType: accountType,
      balance: 0,
      accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    });

    alert("Account created successfully!");
    window.location.href = "dashboard.html";

  } catch (error) {
    alert(error.message);
  }
});