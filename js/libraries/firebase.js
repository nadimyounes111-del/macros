// #region Imports & Const

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

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
const auth = getAuth(app);
let docRef = null;

// #endregion

// #region Save Functions

window.signUp = async function (email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
};

window.signIn = async function (email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

window.signOutUser = function () {
  return firebaseSignOut(auth);
};

window.onAuthReady = function (callback) {
  onAuthStateChanged(auth, callback);
};

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
      if (document.getElementById("water-fill-rect")) updateWaterUI();
    }
    if (data.goals) {
      GOALS = data.goals;
      updateSummary();
    }
    if (data.notes !== undefined) {
      document.getElementById("notes").value = data.notes;
    }
    if (data.supplements) {
      supplements = data.supplements;
      renderSupplements();
    }
    if (data.weightUnit !== undefined) {
      unit = data.weightUnit;
    }
    if (data.currentWeight !== undefined) {
      currentWeight = data.currentWeight;
      previousWeight = data.previousWeight || null;
      if (document.getElementById("weight-val")) updateWeightUI();
    }
    if (data.enabledWidgets !== undefined) {
      enabledWidgets = data.enabledWidgets;
      populateWidgetToggles();
    }
    if (data.showMealProtein !== undefined) {
      showMealProtein = data.showMealProtein;
    }
    if (data.showMealCal !== undefined) {
      showMealCal = data.showMealCal;
    }
    if (data.dimCheckedEntries !== undefined) {
      dimCheckedEntries = data.dimCheckedEntries;
    }
    if (data.waterUnit !== undefined) {
      waterUnit = data.waterUnit;
    }
    populateSettingsToggles();

    if (isFirst) {
      isFirst = false;
      onFirstLoad?.();
    }
  });
};

// #endregion
