import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

// A small helper to turn a number into "₦1,234.00" style text.
// We use this everywhere instead of repeating the same formatting code.
function formatMoney(number) {
  return "₦" + Number(number).toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

// Runs automatically whenever Firebase knows whether someone is logged in.
onAuthStateChanged(auth, async (user) => {

  // Step 1: if nobody is logged in, send them to the login page and stop.
  if (!user) {
    window.location.href = "sign-in.html";
    return;
  }

  // Step 2: load this user's profile (name, balance, account number).
  const userSnapshot = await get(ref(db, "users/" + user.uid));

  if (userSnapshot.exists()) {
    const userData = userSnapshot.val();

    document.getElementById("userName").textContent = userData.fullName;
    document.getElementById("balanceAmount").textContent = formatMoney(userData.balance);
    document.getElementById("accountNumber").textContent =
      "**** **** **** " + userData.accountNumber.slice(-4);
  }

  // Step 3: load this user's transactions.
  const txnSnapshot = await get(ref(db, "transactions/" + user.uid));

  // These will add up as we loop through the transactions below.
  let totalCredits = 0;
  let totalDebits = 0;

  // This is where we'll build the HTML for every table row.
  let tableRowsHTML = "";

  if (txnSnapshot.exists()) {
    const transactions = txnSnapshot.val();

    // transactions is an object like { "-Nabc123": {...}, "-Nabc456": {...} }
    // Object.values() turns it into a plain array we can loop over.
    const transactionList = Object.values(transactions);

    // Loop through every transaction one at a time.
    for (let i = 0; i < transactionList.length; i++) {
      const txn = transactionList[i];

      // Add to our running totals.
      if (txn.type === "credit") {
        totalCredits += txn.amount;
      } else {
        totalDebits += txn.amount;
      }

      // Turn the stored date (e.g. "2026-07-05T08:12:00.000Z") into something readable.
      const date = new Date(txn.date);
      const formattedDate = date.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
      const formattedTime = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

      // Pick the right color/badge depending on whether it's money in or out.
      const isCredit = txn.type === "credit";
      const amountColor = isCredit ? "#10B981" : "#EF4444";
      const amountSign = isCredit ? "+" : "-";
      const badgeClass = isCredit ? "credit" : "debit";
      const badgeText = isCredit ? "Credit" : "Debit";

      // Build one <tr> row and add it to our growing HTML string.
      tableRowsHTML += `
        <tr>
          <td>${txn.description}</td>
          <td>${formattedDate} · ${formattedTime}</td>
          <td><span class="type-badge ${badgeClass}">${badgeText}</span></td>
          <td style="color:${amountColor}; font-weight:600;">${amountSign}${formatMoney(txn.amount)}</td>
          <td><span class="type-badge sucs">${txn.status}</span></td>
        </tr>
      `;
    }
  }

  // Step 4: put everything we built onto the actual page.
  document.getElementById("txnTableBody").innerHTML = tableRowsHTML || "<tr><td colspan='5'>No transactions yet</td></tr>";
  document.getElementById("totalCredits").textContent = "+" + formatMoney(totalCredits);
  document.getElementById("totalDebits").textContent = "-" + formatMoney(totalDebits);
  document.getElementById("netFlow").textContent = formatMoney(totalCredits - totalDebits);
});

// --- Everything below here is unrelated to Firebase ---
// It just shows/hides the sidebar on mobile when the hamburger icon is tapped.

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