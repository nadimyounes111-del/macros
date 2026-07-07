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
  goals: { calories: 2200, protein: 185, carbs: 240, fat: 55 },
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
  currentUser = { displayName: "Guest", email: null, uid: "guest" };
  updateUserName();

  window.saveToFirestore = async function () {
    // no-op — guest changes aren't persisted
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

function enterGuestMode() {
  document.getElementById("auth-screen").style.display = "none";
  initGuestMode(() => initApp());
}
