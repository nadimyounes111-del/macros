// #region Goals

window.foodLog = [];
let GOALS = { calories: 0, protein: 0, carbs: 0, fat: 0 };

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

// #endregion
