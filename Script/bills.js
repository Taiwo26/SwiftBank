import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { ref, get, update, push } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

let currentUser = null;
let currentBalance = 0;

// Step 1: check who's logged in and load their balance.
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const snapshot = await get(ref(db, "users/" + user.uid));
    if (snapshot.exists()) {
      const data = snapshot.val();
      currentBalance = data.balance;
      document.getElementById("availableBalance").textContent =
        "₦" + Number(data.balance).toLocaleString("en-NG", { minimumFractionDigits: 2 });
    }
  } else {
    window.location.href = "sign-in.html";
  }
});

// Step 2: let the user click a biller category card to highlight it.
// Only one card should be "active" (highlighted) at a time.
const billerItems = document.querySelectorAll(".biller-item");

billerItems.forEach((item) => {
  item.addEventListener("click", () => {
    billerItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");
  });
});

// Step 3: handle the "Pay bill" button.
document.getElementById("payBtn").addEventListener("click", async () => {
  const biller = document.getElementById("billerSelect").value;
  const meterNumber = document.getElementById("meterNumber").value;
  const amount = parseFloat(document.getElementById("billAmount").value);

  if (!biller || !meterNumber || !amount) {
    alert("Please fill in all fields");
    return;
  }

  if (amount > currentBalance) {
    alert("Insufficient balance");
    return;
  }

  try {
    const newBalance = currentBalance - amount;

    // Take the money out of the user's balance.
    await update(ref(db, "users/" + currentUser.uid), {
      balance: newBalance
    });

    // Save a record of this bill payment, same shape as a transfer transaction.
    await push(ref(db, "transactions/" + currentUser.uid), {
      type: "debit",
      amount: amount,
      description: biller + " Bill Payment",
      meterNumber: meterNumber,
      date: new Date().toISOString(),
      status: "success"
    });

    alert("Payment successful! ₦" + amount.toLocaleString() + " paid to " + biller);
    window.location.href = "dashboard.html";

  } catch (error) {
    alert("Payment failed: " + error.message);
  }
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