document.querySelectorAll(".eye-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target)
    target.type = target.type === "password" ? "text" : "password"
    btn.textContent = target.type === "password" ? "👁️" : "🙈"
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