import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { ref, get, update, push } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

let currentUser = null;
let currentBalance = 0;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const snapshot = await get(ref(db, 'users/' + user.uid));
    if (snapshot.exists()) {
      const data = snapshot.val();
      currentBalance = data.balance;
      document.getElementById('availableBalance').textContent =
        '₦' + Number(data.balance).toLocaleString('en-NG', { minimumFractionDigits: 2 });
    }
  } else {
    window.location.href = 'sign-in.html';
  }
});

document.getElementById('proceedBtn').addEventListener('click', () => {
  const accountNumber = document.getElementById('accountNumber').value;
  const bank = document.getElementById('bank').value;
  const recipientName = document.getElementById('recipientName').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value;

  if (!accountNumber || !bank || !recipientName || !amount) {
    alert("Please fill in all required fields");
    return;
  }

  if (amount > currentBalance) {
    alert("Insufficient balance");
    return;
  }

  window.transferDetails = { accountNumber, bank, recipientName, amount, description };

  // Reveal the PIN section instead of alert()
  const pinSection = document.getElementById('pinSection');
  pinSection.style.display = "block";
  pinSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('confirmBtn').addEventListener("click", async () => {
  const pin = Array.from(document.querySelectorAll(".pin"))
    .map(input => input.value).join("");

  if (pin.length < 4) {
    alert("Please enter your 4-digit PIN");
    return;
  }

  if (!window.transferDetails) {
    alert("Please fill in transfer details first");
    return;
  }

  const { accountNumber, bank, recipientName, amount, description } = window.transferDetails;

  try {
    const newBalance = currentBalance - amount;

    // Update balance
    await update(ref(db, "users/" + currentUser.uid), {
      balance: newBalance
    });

    // Save transaction
    await push(ref(db, "transactions/" + currentUser.uid), {
      type: "debit",
      amount: amount,
      recipientName: recipientName,
      recipientAccount: accountNumber,
      bank: bank,
      description: description || "Transfer",
      date: new Date().toISOString(),
      status: "success"
    });

    alert("Transfer successful! ₦" + amount.toLocaleString() + " sent to " + recipientName);
    window.location.href = "dashboard.html";

  } catch (error) {
    alert("Transfer failed: " + error.message);
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