import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

let currentUser = null;

// Step 1: check who's logged in and load their info onto the page.
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "sign-in.html";
    return;
  }

  currentUser = user;

  const snapshot = await get(ref(db, "users/" + user.uid));
  if (!snapshot.exists()) return;

  const data = snapshot.val();

  // Build initials from the full name, e.g. "Taiwo Ayorinde" -> "TA"
  const initials = data.fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  document.getElementById("profileAvatar").textContent = initials;
  document.getElementById("profileName").textContent = data.fullName;
  document.getElementById("profileEmail").textContent = data.email;

  // Fill in the editable form fields too.
  document.getElementById("fullNameInput").value = data.fullName;
  document.getElementById("emailInput").value = data.email;
  document.getElementById("phoneInput").value = data.phone || "";

  // "Member since" uses when the Firebase Auth account was created.
  if (user.metadata && user.metadata.creationTime) {
    const joined = new Date(user.metadata.creationTime);
    const monthYear = joined.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    document.getElementById("profileSince").textContent = "Member since " + monthYear;
  }
});

// Step 2: save changes when the button is clicked.
document.getElementById("saveProfileBtn").addEventListener("click", async () => {
  const fullName = document.getElementById("fullNameInput").value;
  const phone = document.getElementById("phoneInput").value;

  if (!fullName) {
    alert("Full name can't be empty");
    return;
  }

  try {
    // Only fullName and phone are updated here.
    // Email isn't included because it's tied to the login itself —
    // changing it safely needs Firebase's updateEmail() plus the user
    // re-confirming their password, which is a bigger feature on its own.
    await update(ref(db, "users/" + currentUser.uid), {
      fullName: fullName,
      phone: phone
    });

    // Reflect the change immediately without needing a page reload.
    document.getElementById("profileName").textContent = fullName;
    const initials = fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    document.getElementById("profileAvatar").textContent = initials;

    alert("Profile updated successfully!");

  } catch (error) {
    alert("Update failed: " + error.message);
  }
});

// The Security/Preferences switches don't have anywhere to save to yet —
// same situation as cards.js. Logging for now so you can see them firing.
["twoFAToggle", "emailNotifToggle", "smsNotifToggle", "darkModeToggle"].forEach((id) => {
  document.getElementById(id).addEventListener("change", (e) => {
    console.log(id + ":", e.target.checked);
  });
});

// Logout
document.getElementById("logout").addEventListener("click", async (e) => {
  e.preventDefault();
  const confirmed = confirm("Are you sure you want to logout?");
  if (confirmed) {
    await signOut(auth);
    window.location.href = "sign-in.html";
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