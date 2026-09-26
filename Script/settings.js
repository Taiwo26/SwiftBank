import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "sign-in.html";
    return;
  }
  currentUser = user;

  // Fill in the withdrawal limit field with whatever is already saved,
  // if the user has changed it before.
  const snapshot = await get(ref(db, "users/" + user.uid));
  if (snapshot.exists()) {
    const data = snapshot.val();
    if (data.withdrawalLimit) {
      document.getElementById("withdrawalLimitInput").value =
        Number(data.withdrawalLimit).toLocaleString();
    }
  }
});

// --- Update withdrawal limit ---
document.getElementById("updateLimitBtn").addEventListener("click", async () => {
  // Strip out commas so "500,000" becomes the number 500000.
  const rawValue = document.getElementById("withdrawalLimitInput").value;
  const newLimit = parseFloat(rawValue.replace(/,/g, ""));

  if (!newLimit || newLimit <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  try {
    await update(ref(db, "users/" + currentUser.uid), {
      withdrawalLimit: newLimit
    });
    document.getElementById("withdrawalLimitInput").value = newLimit.toLocaleString();
    alert("Withdrawal limit updated to ₦" + newLimit.toLocaleString());
  } catch (error) {
    alert("Update failed: " + error.message);
  }
});

// --- Export transaction history as a CSV file ---
document.getElementById("exportDataBtn").addEventListener("click", async () => {
  const snapshot = await get(ref(db, "transactions/" + currentUser.uid));

  if (!snapshot.exists()) {
    alert("No transactions to export yet");
    return;
  }

  const transactions = Object.values(snapshot.val());

  // Start with a header row, then add one line per transaction.
  let csvContent = "Date,Description,Type,Amount,Status\n";

  transactions.forEach((txn) => {
    const date = new Date(txn.date).toLocaleString();
    // Wrap the description in quotes in case it contains a comma.
    csvContent += `${date},"${txn.description}",${txn.type},${txn.amount},${txn.status}\n`;
  });

  // Turn the CSV text into a downloadable file using a Blob.
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  // Create an invisible link, click it to trigger the download, then remove it.
  const link = document.createElement("a");
  link.href = url;
  link.download = "swiftbank-transactions.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

// --- Disconnect linked bank (visual only — no real bank link exists yet) ---
document.querySelectorAll(".disconnect-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const row = link.closest(".sub-recent");
    const bankName = row.querySelector(".rec-name").textContent;
    const confirmed = confirm("Disconnect " + bankName + "?");
    if (confirmed) {
      row.remove();
    }
  });
});

// --- Deactivate account ---
document.getElementById("deactivateBtn").addEventListener("click", async () => {
  const confirmed = confirm(
    "Are you sure you want to deactivate your account? This cannot be undone from here."
  );
  if (!confirmed) return;

  try {
    // We mark the account as deactivated rather than deleting it outright —
    // deleting a Firebase Auth user safely requires the user to have signed
    // in recently, which is a bigger feature to add properly.
    await update(ref(db, "users/" + currentUser.uid), {
      deactivated: true
    });

    await signOut(auth);
    alert("Your account has been deactivated.");
    window.location.href = "sign-in.html";

  } catch (error) {
    alert("Something went wrong: " + error.message);
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