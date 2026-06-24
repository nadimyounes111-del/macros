window.foodLog = [];
let GOALS = { calories: 0, protein: 0, carbs: 0, fat: 0 };

function saveGoals() {
  GOALS.calories =
    parseInt(document.getElementById("goal-cal").value) || GOALS.calories;
  GOALS.protein =
    parseInt(document.getElementById("goal-pro").value) || GOALS.protein;
  GOALS.carbs =
    parseInt(document.getElementById("goal-carb").value) || GOALS.carbs;
  GOALS.fat = parseInt(document.getElementById("goal-fat").value) || GOALS.fat;
  localStorage.setItem("goals", JSON.stringify(GOALS));
  if (window.saveToFirestore) window.saveToFirestore({ goals: GOALS });
  updateSummary();
  closeGoalsModal();
}

function checkOverage(id, total, goal) {
  const warn = document.getElementById("warn-" + id);
  warn.style.display = total > goal ? "inline" : "none";
}

function updateSummary() {
  const totals = window.foodLog.reduce(
    (acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fat += entry.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  document.getElementById("sum-cal").textContent = totals.calories.toFixed(0);
  document.getElementById("sum-pro").textContent = totals.protein.toFixed(0);
  document.getElementById("sum-carb").textContent = totals.carbs.toFixed(0);
  document.getElementById("sum-fat").textContent = totals.fat.toFixed(0);

  document.getElementById("sum-cal").textContent =
    totals.calories.toFixed(0) + " / " + GOALS.calories;
  document.getElementById("sum-pro").textContent =
    totals.protein.toFixed(0) + " / " + GOALS.protein;
  document.getElementById("sum-carb").textContent =
    totals.carbs.toFixed(0) + " / " + GOALS.carbs;
  document.getElementById("sum-fat").textContent =
    totals.fat.toFixed(0) + " / " + GOALS.fat;

  document.getElementById("bar-cal").style.width =
    Math.min((totals.calories / GOALS.calories) * 100, 100) + "%";
  document.getElementById("bar-pro").style.width =
    Math.min((totals.protein / GOALS.protein) * 100, 100) + "%";
  document.getElementById("bar-carb").style.width =
    Math.min((totals.carbs / GOALS.carbs) * 100, 100) + "%";
  document.getElementById("bar-fat").style.width =
    Math.min((totals.fat / GOALS.fat) * 100, 100) + "%";

  checkOverage("cal", totals.calories, GOALS.calories);
  checkOverage("pro", totals.protein, GOALS.protein);
  checkOverage("carb", totals.carbs, GOALS.carbs);
  checkOverage("fat", totals.fat, GOALS.fat);
}

// edit modal
function openGoalsModal() {
  document.getElementById("goal-cal").value = GOALS.calories;
  document.getElementById("goal-pro").value = GOALS.protein;
  document.getElementById("goal-carb").value = GOALS.carbs;
  document.getElementById("goal-fat").value = GOALS.fat;
  document.getElementById("goals-modal").style.display = "flex";
}

function closeGoalsModal() {
  document.getElementById("goals-modal").style.display = "none";
}

document
  .getElementById("goals-modal-overlay")
  .addEventListener("click", closeGoalsModal);
