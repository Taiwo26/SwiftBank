import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

let realBalance = "₦0.00";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is logged in — fetch their data
    const snapshot = await get(ref(db, "users/" + user.uid));

    if (snapshot.exists()) {
      const data = snapshot.val();

      // Update the greeting name
      document.getElementById("userName").textContent = data.fullName;

      // Format and store the real balance so the eye-toggle can use it
      realBalance =
        "₦" +
        Number(data.balance).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
        });
      document.getElementById("balanceAmount").textContent = realBalance;

      // Update account number
      document.getElementById("accountNumber").textContent =
        "**** **** **** " + data.accountNumber.slice(-4);
    }
  } else {
    // No user logged in — redirect to login
    window.location.href = "sign-in.html";
  }
});

const logout = document.getElementById("logout");

logout.addEventListener("click", async (e) => {
  e.preventDefault();
  const confirmed = confirm("Are you sure you want to logout?");
  if (confirmed) {
    await signOut(auth);
    window.location.href = "sign-in.html";
  }
});

const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("sidebarOverlay");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
});

let toggleBalance = document.getElementById("toggleBalance");
let balanceAmount = document.getElementById("balanceAmount");
let eyeIcon = document.getElementById("eyeIcon");

let balanceVisible = true;

toggleBalance.addEventListener("click", () => {
  balanceVisible = !balanceVisible;

  if (balanceVisible) {
    balanceAmount.textContent = realBalance;
    eyeIcon.className = "bi bi-eye";
  } else {
    balanceAmount.textContent = "₦ ••••••••";
    eyeIcon.className = "bi bi-eye-slash";
  }
});

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  } else if (hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

document.getElementById("greeting").textContent = getGreeting();
