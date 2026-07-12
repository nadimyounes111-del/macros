// Parser
let foods = [];
let selectedFood = null;

const foodsReady = new Promise((resolve) => {
  Papa.parse("foods.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    step: (row) => {
      const firstCell = row.data[Object.keys(row.data)[0]];
      if (
        !firstCell ||
        typeof firstCell !== "string" ||
        firstCell.startsWith("#")
      )
        return;
      foods.push(row.data);
    },
    complete: resolve,
  });
});

function initApp() {
  renderLog();
  updateSummary();
  updateWaterUI();
  initGoalInputs();
  initNotes();
  initWidgetToggles();
  populateWidgetToggles();
  populateUsernameField();
  initSettingsToggles();
  populateSettingsToggles();
  maybeShowOnboarding();

  setTimeout(() => {
    document.getElementById("page").classList.add("visible");
  }, 50);
}

const now = new Date();
document.getElementById("day-title").textContent = now.toLocaleDateString(
  "en-US",
  {
    weekday: "short",
    month: "short",
    day: "numeric",
  },
);

function maybeShowOnboarding() {
  if (!window.onboardingSeen) {
    document.getElementById("onboarding-modal").classList.add("active");
    document.body.classList.add("modal-open");
  }
}

function closeOnboarding() {
  document.getElementById("onboarding-modal").classList.remove("active");
  window.saveToFirestore({ onboardingSeen: true });
  document.body.classList.remove("modal-open");
}

async function submitNameChange() {
  const newName = document.getElementById("new-username").value.trim();
  if (!newName) return;

  const btn = document.querySelector(".user-btn");
  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = "Saving";

  try {
    await window.updateDisplayName(newName);
    window.currentUser.displayName = newName;
    window.updateUserName();
    document.getElementById("new-username").value = newName;

    btn.textContent = "Done!";
    btn.classList.add("saved");
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("saved");
      btn.disabled = false;
    }, 2400);
  } catch (e) {
    console.warn("Failed to update display name:", e);
    btn.textContent = "Failed";
    btn.classList.add("failed");
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("failed");
      btn.disabled = false;
    }, 2400);
  }
}

function signOut() {
  sessionStorage.removeItem("guestMode");
  window.signOutUser().then(() => {
    window.location.href = "/";
  });
}

const GUEST_DATA = {
  foodLog: [
    {
      food: "Chobani - 20g",
      meal: "Breakfast",
      calories: 140,
      carbs: 8,
      fat: 3,
      protein: 20,
      servingSize: "cup",
      servings: 1,
    },
    {
      food: "Grilled Chicken Breast",
      meal: "Lunch",
      calories: 280,
      carbs: 0,
      fat: 6,
      protein: 52,
      servingSize: "breast",
      servings: 1,
    },
    {
      food: "Brown Rice",
      meal: "Lunch",
      calories: 220,
      carbs: 45,
      fat: 2,
      protein: 5,
      servingSize: "cup",
      servings: 1,
    },
    {
      food: "Salmon Fillet",
      meal: "Dinner",
      calories: 367,
      carbs: 0,
      fat: 22,
      protein: 39,
      servingSize: "fillet",
      servings: 1,
    },
    {
      food: "Steamed Broccoli",
      meal: "Dinner",
      calories: 55,
      carbs: 11,
      fat: 0,
      protein: 4,
      servingSize: "cup",
      servings: 1,
    },
  ],
  water: 1.5,
  goals: { calories: 2400, protein: 180, carbs: 250, fat: 70 },
  notes: "This is a guest account, sign up to save your own data!",
  supplements: [
    { name: "Creatine", checked: false },
    { name: "Vitamin D", checked: true },
  ],
  weightUnit: "kg",
  currentWeight: 82.5,
  previousWeight: 85,
  enabledWidgets: {
    hydration: true,
    supplements: true,
    weight: true,
    notes: true,
  },
  showMealProtein: false,
  showMealCal: true,
  dimCheckedEntries: true,
  waterUnit: "L",
};

function initGuestMode(onFirstLoad) {
  window.currentUser = { displayName: "Guest", email: null, uid: "guest" };
  window.updateUserName();

  window.onboardingSeen = true;

  const banner = document.getElementById("guest-banner");
  if (banner) banner.style.display = "block";

  window.saveToFirestore = async function () {
    console.log("Guest mode: changes are not saved.");
  };

  const data = GUEST_DATA;
  window.foodLog = data.foodLog;
  window.renderLog?.();
  water = data.water;
  if (document.getElementById("water-fill-rect")) updateWaterUI();
  GOALS = data.goals;
  updateSummary();
  document.getElementById("notes").value = data.notes;
  supplements = data.supplements;
  renderSupplements();
  unit = data.weightUnit;
  currentWeight = data.currentWeight;
  previousWeight = data.previousWeight;
  if (document.getElementById("weight-val")) updateWeightUI();
  enabledWidgets = data.enabledWidgets;
  populateWidgetToggles();
  showMealProtein = data.showMealProtein;
  showMealCal = data.showMealCal;
  dimCheckedEntries = data.dimCheckedEntries;
  waterUnit = data.waterUnit;
  populateSettingsToggles();

  onFirstLoad?.();
}

// Routing: this file only runs on app.html
const firebaseReady = new Promise((resolve) => {
  const check = () => (window.onAuthReady ? resolve() : setTimeout(check, 20));
  check();
});

Promise.all([foodsReady, firebaseReady]).then(() => {
  if (sessionStorage.getItem("guestMode") === "true") {
    initGuestMode(() => initApp());
    return;
  }

  window.onAuthReady((user) => {
    if (user) {
      window.currentUser = user;
      window.updateUserName();
      window.initFirestore(window.currentUser.uid, () => initApp());
    } else {
      window.location.href = "/";
    }
  });
});
