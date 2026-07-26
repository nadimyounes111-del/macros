// #region ===== Firebase SDK calls/imports

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
  sendPasswordResetEmail,
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

window.currentUser = null;

window.signIn = async function (email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

window.signUp = async function (email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
};

window.resetPassword = function (email) {
  return sendPasswordResetEmail(auth, email);
};

window.signOutUser = function () {
  return firebaseSignOut(auth);
};

window.onAuthReady = function (callback) {
  onAuthStateChanged(auth, callback);
};

// #endregion

// #region ===== Firestore write function & onSnapshot listener

function hasChanged(oldVal, newVal) {
  if (typeof oldVal === "object" || typeof newVal === "object") {
    return JSON.stringify(oldVal) !== JSON.stringify(newVal);
  }
  return oldVal !== newVal;
}

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
    if (snap.metadata.hasPendingWrites) return;

    if (!snap.exists()) {
      if (isFirst) {
        isFirst = false;
        onFirstLoad?.();
      }
      return;
    }

    const data = snap.data();
    let settingsChanged = false;

    if (data.foodLog) {
      const changed = hasChanged(window.foodLog, data.foodLog);
      window.foodLog = data.foodLog;
      if (changed) window.renderLog?.();
    }
    if (
      data.collapsedMeals !== undefined &&
      hasChanged(collapsedMeals, data.collapsedMeals)
    ) {
      collapsedMeals = data.collapsedMeals;
    }
    if (data.water !== undefined && hasChanged(water, data.water)) {
      water = data.water;
      if (document.getElementById("water-fill-rect")) updateWaterUI();
    }
    if (data.goals && hasChanged(GOALS, data.goals)) {
      GOALS = data.goals;
      updateSummary();
    }
    if (data.notes !== undefined) {
      const notesEl = document.getElementById("notes");
      if (notesEl && notesEl.value !== data.notes) notesEl.value = data.notes;
    }
    if (data.supplements && hasChanged(supplements, data.supplements)) {
      supplements = data.supplements;
      renderSupplements();
    }
    if (data.weightUnit !== undefined && hasChanged(unit, data.weightUnit)) {
      unit = data.weightUnit;
    }
    if (
      data.currentWeight !== undefined &&
      (hasChanged(currentWeight, data.currentWeight) ||
        hasChanged(previousWeight, data.previousWeight ?? null))
    ) {
      currentWeight = data.currentWeight;
      previousWeight = data.previousWeight || null;
      if (document.getElementById("weight-val")) updateWeightUI();
    }
    if (
      data.enabledWidgets !== undefined &&
      hasChanged(enabledWidgets, data.enabledWidgets)
    ) {
      enabledWidgets = data.enabledWidgets;
      populateWidgetToggles();
    }
    if (
      data.showMealProtein !== undefined &&
      hasChanged(showMealProtein, data.showMealProtein)
    ) {
      showMealProtein = data.showMealProtein;
      settingsChanged = true;
    }
    if (
      data.showMealCal !== undefined &&
      hasChanged(showMealCal, data.showMealCal)
    ) {
      showMealCal = data.showMealCal;
      settingsChanged = true;
    }
    if (
      data.dimCheckedEntries !== undefined &&
      hasChanged(dimCheckedEntries, data.dimCheckedEntries)
    ) {
      dimCheckedEntries = data.dimCheckedEntries;
      settingsChanged = true;
    }
    if (data.onboardingSeen !== undefined) {
      window.onboardingSeen = data.onboardingSeen;
    } else {
      window.onboardingSeen = false;
    }
    if (
      data.customFoods !== undefined &&
      hasChanged(window.customFoods, data.customFoods)
    ) {
      window.customFoods = data.customFoods;
      foods = foods.filter((f) => !f.isCustom).concat(window.customFoods);
    }
    if (data.waterUnit !== undefined && hasChanged(waterUnit, data.waterUnit)) {
      waterUnit = data.waterUnit;
    }

    if (settingsChanged) populateSettingsToggles();

    if (isFirst) {
      isFirst = false;
      onFirstLoad?.();
    }
  });
};

window.firebaseReady = new Promise((resolve) => {
  const check = () => (window.onAuthReady ? resolve() : setTimeout(check, 20));
  check();
});

// #endregion
