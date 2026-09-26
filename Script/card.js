import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

// There's no real card number stored in the database, so we build a
// fake-but-consistent one out of the user's real account number.
// This just means the same user always sees the same "card number".
let fullCardNumber = "";
let maskedCardNumber = "";
let detailsVisible = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "sign-in.html";
    return;
  }

  const snapshot = await get(ref(db, "users/" + user.uid));
  if (snapshot.exists()) {
    const data = snapshot.val();

    document.getElementById("cardHolder").textContent = data.fullName;

    // Build a 16-digit-looking number: "4821" + the user's 10-digit
    // account number, padded to fill the remaining digits.
    const accountDigits = data.accountNumber.padStart(12, "0");
    fullCardNumber = "4821 " + accountDigits.slice(0, 4) + " " + accountDigits.slice(4, 8) + " " + accountDigits.slice(8, 12);
    maskedCardNumber = "4821 •••• •••• " + accountDigits.slice(-4);

    document.getElementById("cardNumber").textContent = maskedCardNumber;
  }
});

// "Show details" button — toggles between masked and full card number.
const showDetailsBtn = document.getElementById("showDetailsBtn");

showDetailsBtn.addEventListener("click", () => {
  detailsVisible = !detailsVisible;

  document.getElementById("cardNumber").textContent =
    detailsVisible ? fullCardNumber : maskedCardNumber;

  showDetailsBtn.innerHTML = detailsVisible
    ? '<i class="bi bi-eye-slash"></i> Hide details'
    : '<i class="bi bi-eye"></i> Show details';
});

// "Freeze card" button — just a visual on/off toggle for now.
// (There's nowhere in the database yet to actually store "frozen" state.)
const freezeBtn = document.getElementById("freezeBtn");
let isFrozen = false;

freezeBtn.addEventListener("click", () => {
  isFrozen = !isFrozen;

  if (isFrozen) {
    freezeBtn.innerHTML = '<i class="bi bi-unlock"></i> Unfreeze card';
    freezeBtn.classList.add("frozen");
    alert("Your card has been frozen. All transactions are blocked until you unfreeze it.");
  } else {
    freezeBtn.innerHTML = '<i class="bi bi-lock"></i> Freeze card';
    freezeBtn.classList.remove("frozen");
    alert("Your card has been unfrozen.");
  }
});

// The three switches (online payments, ATM, international use) don't
// need any JS to visually flip — that's plain CSS/HTML checkbox behavior.
// We just log the change for now since there's nowhere to save it yet.
document.getElementById("onlineToggle").addEventListener("change", (e) => {
  console.log("Online payments:", e.target.checked ? "enabled" : "disabled");
});

document.getElementById("atmToggle").addEventListener("change", (e) => {
  console.log("ATM withdrawals:", e.target.checked ? "enabled" : "disabled");
});

document.getElementById("intlToggle").addEventListener("change", (e) => {
  console.log("International use:", e.target.checked ? "enabled" : "disabled");
});

// --- Sidebar hamburger menu (unrelated to Firebase) ---
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