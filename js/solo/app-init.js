// Parser
let foods = [];
let selectedFood = null;

const YOUR_UID = "4zWkXoUNWxaBOOngN1jghHYOXiC3";

// Routing: this file only runs on app.html
const firebaseReady = new Promise((resolve) => {
  const check = () => (window.onAuthReady ? resolve() : setTimeout(check, 20));
  check();
});

function loadFoods(uid) {
  const csvFile = uid === YOUR_UID ? "foods.csv" : "database.csv";
  foods.length = 0; // clear in case this ever runs more than once

  return new Promise((resolve) => {
    Papa.parse(csvFile, {
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
}

firebaseReady.then(() => {
  if (sessionStorage.getItem("guestMode") === "true") {
    loadFoods("guest").then(() => {
      initGuestMode(() => initApp());
    });
    return;
  }

  window.onAuthReady((user) => {
    if (user) {
      window.currentUser = user;
      window.updateUserName();
      loadFoods(user.uid).then(() => {
        window.initFirestore(window.currentUser.uid, () => initApp());
      });
    } else {
      window.location.href = "/";
    }
  });
});

function initApp() {
  document.getElementById("loading-screen").classList.add("hidden");
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
  injectIcons();

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
    injectIcons(document.getElementById("onboarding-modal"));
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
      food: "Oats, Dry",
      meal: "Breakfast",
      calories: 149,
      protein: 6,
      carbs: 24,
      fat: 3,
      servings: 0.5,
      unitAmount: 0.5,
      unit: "cup",
      servingSize: "0.5cup",
      checked: true,
    },
    {
      food: "Banana",
      meal: "Breakfast",
      calories: 106,
      protein: 1,
      carbs: 26,
      fat: 0,
      servings: 120,
      unitAmount: 120,
      unit: "g",
      servingSize: "120g",
      checked: true,
    },
    {
      food: "Peanut Butter",
      meal: "Breakfast",
      calories: 95,
      protein: 4,
      carbs: 3,
      fat: 8,
      servings: 1,
      unitAmount: 1,
      unit: "tbsp",
      servingSize: "1tbsp",
      checked: true,
    },
    {
      food: "Chicken Breast, Skinless Cooked",
      meal: "Lunch",
      calories: 311,
      protein: 56,
      carbs: 0,
      fat: 8,
      servings: 180,
      unitAmount: 180,
      unit: "g",
      servingSize: "180g",
      checked: true,
    },
    {
      food: "Broccoli",
      meal: "Lunch",
      calories: 67,
      protein: 6,
      carbs: 8,
      fat: 1,
      servings: 7,
      unitAmount: 7,
      unit: "oz",
      servingSize: "7oz",
      checked: true,
    },
    {
      food: "Brown Rice, Cooked",
      meal: "Lunch",
      calories: 109,
      protein: 2,
      carbs: 21,
      fat: 1,
      servings: 0.5,
      unitAmount: 0.5,
      unit: "cup",
      servingSize: "0.5cup",
    },
    {
      food: "2% Greek Yogurt",
      meal: "Snack",
      calories: 279,
      protein: 39,
      carbs: 14,
      fat: 7,
      servings: 1.5,
      unitAmount: 1.5,
      unit: "cup",
      servingSize: "1.5cup",
    },
    {
      food: "Blueberry",
      meal: "Snack",
      calories: 81,
      protein: 1,
      carbs: 17,
      fat: 0,
      servings: 5,
      unitAmount: 5,
      unit: "oz",
      servingSize: "5oz",
    },
    {
      food: "Salmon, Raw",
      meal: "Dinner",
      calories: 413,
      protein: 40,
      carbs: 0,
      fat: 27,
      servings: 7,
      unitAmount: 7,
      unit: "oz",
      servingSize: "7oz",
    },
    {
      food: "Sweet Potato",
      meal: "Dinner",
      calories: 100,
      protein: 2,
      carbs: 19,
      fat: 1,
      servings: 130,
      unitAmount: 130,
      unit: "g",
      servingSize: "130g",
    },
    {
      food: "Olive Oil",
      meal: "Dinner",
      calories: 119,
      protein: 0,
      carbs: 0,
      fat: 14,
      servings: 1,
      unitAmount: 1,
      unit: "tbsp",
      servingSize: "1tbsp",
    },
  ],

  water: 1.5,
  goals: { calories: 2000, protein: 160, carbs: 140, fat: 70 },
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
  collapsedMeals: {
    Breakfast: true,
    Lunch: false,
    Dinner: false,
    Snack: true,
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

  const footer = document.querySelector(".footer");
  if (footer) footer.style.display = "none";

  window.saveToFirestore = async function () {
    console.log("Guest mode: changes are not saved.");
  };

  const data = GUEST_DATA;
  window.foodLog = data.foodLog;
  window.collapsedMeals = data.collapsedMeals;
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
