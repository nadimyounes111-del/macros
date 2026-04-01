/* =========================
    PARSES CSV FILE
========================= */

let foods = [];
let selectedFood = null;

Papa.parse("foods.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  // This 'step' function handles your logic row-by-row
  step: function (row) {
    const firstCell = row.data[Object.keys(row.data)[0]];
    // Ignores empty rows or rows starting with #
    if (!firstCell || firstCell.startsWith("#")) return;
    foods.push(row.data);
  },
  // This 'complete' function triggers the UI updates
  complete: function () {
    console.log("Foods loaded:", foods);
    renderLog();
    updateSummary();
  },
});

/* =========================
   FOOD LOG
========================= */

const checkedSVG = `<svg class="check-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 283 440.5 289.9 440C296.8 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"/></svg>`;
const uncheckedSVG = `<svg class="check-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 144C488.8 144 496 151.2 496 160L496 480C496 488.8 488.8 496 480 496L160 496C151.2 496 144 488.8 144 480L144 160C144 151.2 151.2 144 160 144L480 144zM160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96z"/></svg>`;

let foodLog = JSON.parse(localStorage.getItem("foodLog")) || [];

function saveLog() {
  localStorage.setItem("foodLog", JSON.stringify(foodLog));
}

function renderLog() {
  const logBody = document.getElementById("log-body");
  logBody.innerHTML = "";

  foodLog.forEach(function (entry, index) {
    const unit = entry.servingSize
      ? entry.servingSize.replace(/^[\d.\/\s]+/, "")
      : "";

    const row = document.createElement("div");
    row.className = "log-row";
    row.innerHTML = `
      <div class="col-check">
        <button onclick="toggleCheck(this, ${index})" data-checked="${entry.checked || false}">
          ${entry.checked ? checkedSVG : uncheckedSVG}
        </button>
      </div>
      <div class="col-food">${entry.food}</div>
      <div class="col-servings">
        <input class="serving-edit" type="number" value="${entry.servings}" min="0.1" step="0.1" onchange="editServing(${index}, this.value)"/>
        <span class="serving-unit">${unit}</span>
      </div>
      <div class="col-cal">${entry.calories}</div>
      <div class="col-pro">${entry.protein}</div>
      <div class="col-carb">${entry.carbs}</div>
      <div class="col-fat">${entry.fat}</div>
      <div class="col-del">
        <button onclick="deleteEntry(${index})">
          <svg class="delete-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"/></svg>
        </button>
      </div>
    `;
    logBody.appendChild(row);
  });

  setupAddRow();
  updateSummary();
}

function setupAddRow() {
  const searchInput = document.getElementById("food-search");
  const autocompleteList = document.getElementById("autocomplete-list");
  const servingsInput = document.getElementById("servings");
  selectedFood = null;

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = "";
    if (!query) return;

    const rect = searchInput.getBoundingClientRect();
    autocompleteList.style.top = rect.bottom + window.scrollY + 4 + "px";
    autocompleteList.style.left = rect.left + "px";

    const matches = foods.filter((f) => f.Food.toLowerCase().includes(query));
    matches.forEach(function (food) {
      const li = document.createElement("li");
      li.textContent = food.Food;
      li.addEventListener("click", function () {
        searchInput.value = food.Food;
        autocompleteList.innerHTML = "";
        selectedFood = food;
        updatePreview();
      });
      autocompleteList.appendChild(li);
    });
  });

  // hide autocomplete when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !searchInput.contains(e.target) &&
      !autocompleteList.contains(e.target)
    ) {
      autocompleteList.innerHTML = "";
    }
  });

  servingsInput.addEventListener("input", updatePreview);

  document.getElementById("add-btn").addEventListener("click", function () {
    if (!selectedFood) return;
    const servings = parseFloat(servingsInput.value) || 0;
    if (servings <= 0) return;

    const entry = {
      food: selectedFood.Food,
      servings: servings,
      calories: parseFloat(
        (parseFloat(selectedFood.Calories) * servings).toFixed(1),
      ),
      protein: parseFloat(
        (parseFloat(selectedFood.Protein) * servings).toFixed(1),
      ),
      carbs: parseFloat((parseFloat(selectedFood.Carbs) * servings).toFixed(1)),
      fat: parseFloat((parseFloat(selectedFood.Fat) * servings).toFixed(1)),
      servingSize: selectedFood["Serving Size"],
    };

    foodLog.push(entry);
    saveLog();
    renderLog();
  });
}

function updatePreview() {
  if (!selectedFood) return;
  const servings = parseFloat(document.getElementById("servings").value) || 0;
  const unit = selectedFood["Serving Size"].replace(/^[\d.\/\s]+/, "");

  document.getElementById("serving-size-label").textContent = unit;
  document.getElementById("cal-preview").textContent = (
    parseFloat(selectedFood.Calories) * servings
  ).toFixed(1);
  document.getElementById("pro-preview").textContent = (
    parseFloat(selectedFood.Protein) * servings
  ).toFixed(1);
  document.getElementById("carb-preview").textContent = (
    parseFloat(selectedFood.Carbs) * servings
  ).toFixed(1);
  document.getElementById("fat-preview").textContent = (
    parseFloat(selectedFood.Fat) * servings
  ).toFixed(1);
}

function toggleCheck(btn, index) {
  foodLog[index].checked = !foodLog[index].checked;
  saveLog();
  renderLog();
}

function editServing(index, newServings) {
  newServings = parseFloat(newServings);
  if (!newServings || newServings <= 0) return;

  const original = foodLog[index];
  const ratio = newServings / original.servings;

  original.servings = newServings;
  original.calories = parseFloat((original.calories * ratio).toFixed(1));
  original.protein = parseFloat((original.protein * ratio).toFixed(1));
  original.carbs = parseFloat((original.carbs * ratio).toFixed(1));
  original.fat = parseFloat((original.fat * ratio).toFixed(1));

  saveLog();
  renderLog();
}

function deleteEntry(index) {
  foodLog.splice(index, 1);
  saveLog();
  renderLog();
}

/* =========================
   GOALS & SUMMARY
========================= */

const GOALS = { calories: 2200, protein: 185, carbs: 240, fat: 55 };

function updateSummary() {
  const totals = foodLog.reduce(
    (acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fat += entry.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  document.getElementById("sum-cal").textContent =
    totals.calories.toFixed(1) + " / " + GOALS.calories;
  document.getElementById("sum-pro").textContent =
    totals.protein.toFixed(1) + " / " + GOALS.protein;
  document.getElementById("sum-carb").textContent =
    totals.carbs.toFixed(1) + " / " + GOALS.carbs;
  document.getElementById("sum-fat").textContent =
    totals.fat.toFixed(1) + " / " + GOALS.fat;

  document.getElementById("bar-cal").style.width =
    Math.min((totals.calories / GOALS.calories) * 100, 100) + "%";
  document.getElementById("bar-pro").style.width =
    Math.min((totals.protein / GOALS.protein) * 100, 100) + "%";
  document.getElementById("bar-carb").style.width =
    Math.min((totals.carbs / GOALS.carbs) * 100, 100) + "%";
  document.getElementById("bar-fat").style.width =
    Math.min((totals.fat / GOALS.fat) * 100, 100) + "%";
}
