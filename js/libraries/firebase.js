import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxya9XqbeIwDJnrCRHQjzJRMZi8JNoLbI",
  authDomain: "macro-tracker-3cc53.firebaseapp.com",
  projectId: "macro-tracker-3cc53",
  storageBucket: "macro-tracker-3cc53.firebasestorage.app",
  messagingSenderId: "112928342238",
  appId: "1:112928342238:web:d1ed41546de73f67af824f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let docRef = null;

window.initFirestore = function (user, onFirstLoad) {
  docRef = doc(db, "users", user);

  window.saveToFirestore = async function (data) {
    try {
      await setDoc(docRef, data, { merge: true });
    } catch (e) {
      console.warn("Firestore save failed:", e);
    }
  };

  let isFirst = true;

  onSnapshot(docRef, (snap) => {
    if (!snap.exists()) {
      if (isFirst) {
        isFirst = false;
        onFirstLoad?.();
      }
      return;
    }

    const data = snap.data();

    if (data.foodLog) {
      window.foodLog = data.foodLog;
      window.renderLog?.();
    }
    if (data.water !== undefined) {
      water = data.water;
      document.getElementById("water-val").textContent = water + " L";
    }
    if (data.creatine !== undefined) {
      creatineTaken = data.creatine;
      const btn = document.getElementById("creatine-check-btn");
      btn.dataset.checked = creatineTaken;
      btn.innerHTML = creatineTaken ? creatinecheckedSVG : creatineuncheckedSVG;
    }
    if (data.goals) {
      GOALS = data.goals;
      updateSummary();
    }
    if (data.streak !== undefined) {
      streak = data.streak;
      lastStreakDate = data.lastStreakDate || null;
    }

    if (isFirst) {
      isFirst = false;
      onFirstLoad?.();
    }
  });
};
