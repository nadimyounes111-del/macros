/* =========================
    PARSES CSV FILE
========================= */

let foods = [];
let selectedFood = null;

Papa.parse("foods.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  step: function (row) {
    const firstCell = row.data[Object.keys(row.data)[0]];
    if (!firstCell || firstCell.startsWith("#")) return;
    foods.push(row.data);
  },
  complete: function () {
    console.log("Foods loaded:", foods);
    renderLog();
    updateSummary();

    document.getElementById("servings").onkeydown = function (e) {
      if (e.key === "Enter") {
        document.getElementById("add-btn").click();
      }
    };
  },
});

window.foodLog = JSON.parse(localStorage.getItem("foodLog")) || [];
window.renderLog = renderLog;

/* =========================
   FOOD LOG
========================= */

const checkedSVG = `<svg class="check-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 283 440.5 289.9 440C296.8 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"/></svg>`;
const uncheckedSVG = `<svg class="check-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 144C488.8 144 496 151.2 496 160L496 480C496 488.8 488.8 496 480 496L160 496C151.2 496 144 488.8 144 480L144 160C144 151.2 151.2 144 160 144L480 144zM160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96z"/></svg>`;

const creatinecheckedSVG = `<svg class="creatine-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 283 440.5 289.9 440C296.8 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"/></svg>`;
const creatineuncheckedSVG = `<svg class="creatine-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 144C488.8 144 496 151.2 496 160L496 480C496 488.8 488.8 496 480 496L160 496C151.2 496 144 488.8 144 480L144 160C144 151.2 151.2 144 160 144L480 144zM160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96z"/></svg>`;

function saveLog() {
  localStorage.setItem("foodLog", JSON.stringify(window.foodLog));
  if (window.saveToFirestore) window.saveToFirestore(window.foodLog);
}

function renderLog() {
  const logBody = document.getElementById("log-body");
  logBody.innerHTML = "";

  const meals = ["Breakfast", "Lunch", "Snack", "Dinner"];

  meals.forEach(function (meal) {
    const entries = window.foodLog.filter(
      (e) => (e.meal || "Breakfast") === meal,
    );
    if (entries.length === 0) return;

    const mealProtein = entries.reduce((sum, e) => sum + e.protein, 0);

    const header = document.createElement("div");
    header.className = "meal-header";
    header.innerHTML = `
    <div class="header-wrap">
    <span class="meal-label">${meal} •</span>
    
    <span class="meal-protein">${Math.round(mealProtein)}g</span>
    <svg
        class="pro-svg-table"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 640"
      >
        <path
          d="M224 329.2C224 337.7 220.6 345.8 214.6 351.8L187.8 378.6C175.5 390.9 155.3 390 138.4 385.8C133.8 384.7 128.9 384 123.9 384C90.8 384 63.9 410.9 63.9 444C63.9 477.1 90.8 504 123.9 504C130.2 504 135.9 509.7 135.9 516C135.9 549.1 162.8 576 195.9 576C229 576 255.9 549.1 255.9 516C255.9 511 255.3 506.2 254.1 501.5C249.9 484.6 248.9 464.4 261.3 452.1L288.1 425.3C294.1 419.3 302.2 415.9 310.7 415.9L399.9 415.9C406.2 415.9 412.3 415.6 418.4 414.9C430.3 413.7 434.8 399.4 429.2 388.9C420.7 373.1 415.9 355.1 415.9 335.9C415.9 274 466 223.9 527.9 223.9C535.9 223.9 543.6 224.7 551.1 226.3C562.8 228.8 575.2 220.4 573.1 208.7C558.4 126.4 486.4 63.9 399.9 63.9C302.7 63.9 223.9 142.7 223.9 239.9L223.9 329.1z"
        />
      </svg>
    </div>
    `;
    logBody.appendChild(header);

    entries.forEach(function (entry, i) {
      const index = window.foodLog.indexOf(entry);
      const unit = entry.servingSize || "";

      const row = document.createElement("div");
      row.className = "log-row" + (i % 2 === 0 ? " row-alt" : "");
      row.innerHTML = `
        <div class="col-check">
          <button onclick="toggleCheck(this, ${index})" data-checked="${entry.checked || false}">
            ${entry.checked ? checkedSVG : uncheckedSVG}
          </button>
        </div>
        <div class="col-food" data-food="${entry.food}">${entry.food}</div>
        <div class="col-servings">
          <input class="serving-edit" type="number" value="${entry.servings}" min="0.1" step="0.1" onchange="editServing(${index}, this.value)"/>
          <span class="serving-unit">${unit}</span>
        </div>
        <div class="col-cal">${Math.round(entry.calories)}</div>
        <div class="col-pro">${Math.round(entry.protein)}</div>
        <div class="col-carb">${Math.round(entry.carbs)}</div>
        <div class="col-fat">${Math.round(entry.fat)}</div>
        <div class="col-del">
          <button onclick="deleteEntry(${index})">
            <svg class="delete-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"/></svg>
          </button>
        </div>
      `;
      logBody.appendChild(row);
    });
  });

  document.getElementById("empty-state").style.display =
    window.foodLog.length === 0 ? "flex" : "none";

  setupAddFood();
  updateSummary();
}

function toggleCustomMode() {
  const btn = document.getElementById("custom-toggle");
  const isCustom = selectedFood === "custom";

  if (isCustom) {
    selectedFood = null;
    setCustomMode(false);
    btn.classList.remove("active");
  } else {
    selectedFood = "custom";
    setCustomMode(true);
    btn.classList.add("active");
  }
}

function setupAddFood() {
  const searchInput = document.getElementById("food-search");
  const autocompleteList = document.getElementById("autocomplete-list");
  const servingsInput = document.getElementById("servings");
  selectedFood = null;

  searchInput.value = "";
  searchInput.placeholder = "Add From List . . .";
  servingsInput.value = "";
  updatePreview();
  setCustomMode(false);

  const toggleBtn = document.getElementById("custom-toggle");
  if (toggleBtn) toggleBtn.classList.remove("active");

  searchInput.onfocus = function () {
    if (selectedFood === "custom") return;
    autocompleteList.scrollTop = 0;
    this.dispatchEvent(new Event("input"));
  };

  searchInput.oninput = function () {
    if (selectedFood === "custom") return;

    const query = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = "";

    const rect = searchInput.getBoundingClientRect();
    autocompleteList.style.top = rect.bottom + window.scrollY + 4 + "px";
    autocompleteList.style.left = rect.left + "px";

    const matches = query
      ? foods.filter((f) => f.Food.toLowerCase().includes(query))
      : foods;

    matches.forEach(function (food) {
      const li = document.createElement("li");
      li.textContent = food.Food;
      li.addEventListener("click", function () {
        autocompleteList.innerHTML = "";
        selectedFood = food;
        setCustomMode(false);
        searchInput.value = food.Food;
        updatePreview();
      });
      autocompleteList.appendChild(li);
    });
  };

  document.onclick = function (e) {
    if (
      !searchInput.contains(e.target) &&
      !autocompleteList.contains(e.target)
    ) {
      autocompleteList.innerHTML = "";
    }
  };

  servingsInput.oninput = updatePreview;

  document.getElementById("add-btn").onclick = function () {
    const activeMealBtn = document.querySelector(".meal-btn.active");
    const meal = activeMealBtn ? activeMealBtn.dataset.meal : "Breakfast";

    if (selectedFood === "custom") {
      const name = searchInput.value.trim();
      if (!name) return;
      const entry = {
        food: name,
        meal: meal,
        servings: 1,
        calories: parseInt(document.getElementById("cal-preview").value) || 0,
        protein: parseInt(document.getElementById("pro-preview").value) || 0,
        carbs: parseInt(document.getElementById("carb-preview").value) || 0,
        fat: parseInt(document.getElementById("fat-preview").value) || 0,
        servingSize: "",
      };
      window.foodLog.push(entry);
      saveLog();
      renderLog();
      closeModal();
      return;
    }

    if (!selectedFood) return;
    const servings = parseFloat(servingsInput.value) || 0;
    if (servings <= 0) return;

    const entry = {
      food: selectedFood.Food,
      meal: meal,
      servings: servings,
      calories: parseInt(
        (parseFloat(selectedFood.Calories) * servings).toFixed(0),
      ),
      protein: parseInt(
        (parseFloat(selectedFood.Protein) * servings).toFixed(0),
      ),
      carbs: parseInt((parseFloat(selectedFood.Carbs) * servings).toFixed(0)),
      fat: parseInt((parseFloat(selectedFood.Fat) * servings).toFixed(0)),
      servingSize: selectedFood["Serving Size"],
    };

    window.foodLog.push(entry);
    saveLog();
    renderLog();
    closeModal();
  };
}
function setCustomMode(on) {
  const servingsInput = document.getElementById("servings");
  const servingLabel = document.getElementById("serving-size-label");
  const searchInput = document.getElementById("food-search");
  const ids = ["cal-preview", "pro-preview", "carb-preview", "fat-preview"];

  if (on) {
    servingsInput.style.display = "none";
    servingLabel.style.display = "none";
    searchInput.value = "";
    searchInput.placeholder = "Custom Entry";
    searchInput.focus();
    ids.forEach(function (id) {
      const input = document.getElementById(id);
      input.disabled = false;
      input.value = "";
    });

    const inputs = [
      "cal-preview",
      "pro-preview",
      "carb-preview",
      "fat-preview",
    ];
    inputs.forEach(function (id) {
      document.getElementById(id).onkeydown = function (e) {
        if (e.key !== "Enter") return;
        const allFilled = inputs.every(function (i) {
          return document.getElementById(i).value !== "";
        });
        if (allFilled) document.getElementById("add-btn").click();
      };
    });
  } else {
    servingsInput.style.display = "";
    servingLabel.style.display = "";
    searchInput.value = "";
    searchInput.placeholder = "Add From List . . .";
    ids.forEach(function (id) {
      const input = document.getElementById(id);
      input.disabled = true;
      input.value = "";
    });
  }
}

function updatePreview() {
  if (!selectedFood || selectedFood === "custom") {
    if (selectedFood !== "custom") {
      document.getElementById("serving-size-label").textContent = "";
      document.getElementById("cal-preview").value = "";
      document.getElementById("pro-preview").value = "";
      document.getElementById("carb-preview").value = "";
      document.getElementById("fat-preview").value = "";
    }
    return;
  }
  const servings = parseFloat(document.getElementById("servings").value) || 0;
  const unit = selectedFood["Serving Size"];

  document.getElementById("serving-size-label").textContent = unit;
  document.getElementById("cal-preview").value = (
    parseFloat(selectedFood.Calories) * servings
  ).toFixed(0);
  document.getElementById("pro-preview").value = (
    parseFloat(selectedFood.Protein) * servings
  ).toFixed(0);
  document.getElementById("carb-preview").value = (
    parseFloat(selectedFood.Carbs) * servings
  ).toFixed(0);
  document.getElementById("fat-preview").value = (
    parseFloat(selectedFood.Fat) * servings
  ).toFixed(0);
}

function toggleCheck(btn, index) {
  window.foodLog[index].checked = !window.foodLog[index].checked;
  saveLog();
  renderLog();
}

function editServing(index, newServings) {
  newServings = parseFloat(newServings);
  if (!newServings || newServings <= 0) return;

  const original = window.foodLog[index];
  const ratio = newServings / original.servings;

  original.servings = newServings;
  original.calories = parseFloat((original.calories * ratio).toFixed(0));
  original.protein = parseFloat((original.protein * ratio).toFixed(0));
  original.carbs = parseFloat((original.carbs * ratio).toFixed(0));
  original.fat = parseFloat((original.fat * ratio).toFixed(0));

  saveLog();
  renderLog();
}

/* =========================
   SUMMARY TABLE
========================= */

const GOALS = { calories: 2200, protein: 185, carbs: 240, fat: 55 };

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

/* =========================
    UNDO BUTTON
========================= */

let undoStack = [];

function deleteEntry(index) {
  undoStack.push({ entry: window.foodLog[index], index: index });
  window.foodLog.splice(index, 1);
  saveLog();
  renderLog();
}

function clearAll() {
  if (window.foodLog.length === 0) return;
  undoStack.push({ snapshot: [...window.foodLog] }); // clear all still uses a snapshot
  window.foodLog = [];
  saveLog();
  renderLog();
}

function undoDelete() {
  if (undoStack.length === 0) return;
  const last = undoStack.pop();

  if (last.snapshot) {
    // undo a clear all
    window.foodLog = [...last.snapshot];
  } else {
    // undo a single delete
    window.foodLog.splice(last.index, 0, last.entry);
  }

  saveLog();
  renderLog();
}

document.getElementById("clear-all-btn").onclick = clearAll;

// creatine

let creatineTaken = localStorage.getItem("creatine") === "true";

const creatineBtn = document.getElementById("creatine-check-btn");
creatineBtn.dataset.checked = creatineTaken;
creatineBtn.innerHTML = creatineTaken
  ? creatinecheckedSVG
  : creatineuncheckedSVG;

function toggleCreatine(btn) {
  creatineTaken = !creatineTaken;
  localStorage.setItem("creatine", creatineTaken);
  btn.dataset.checked = creatineTaken;
  btn.innerHTML = creatineTaken ? creatinecheckedSVG : creatineuncheckedSVG;
}

// open modal

function openModal() {
  document.getElementById("add-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("add-modal").style.display = "none";
}

document.getElementById("modal-overlay").addEventListener("click", closeModal);

document.querySelectorAll(".meal-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".meal-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
  });
});

document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && e.target === document.body) openModal();
});

// water counter
let water = parseFloat(localStorage.getItem("water")) || 0;

function adjustWater(amount) {
  water = Math.max(0, parseFloat((water + amount).toFixed(1)));
  localStorage.setItem("water", water);
  document.getElementById("water-val").textContent = water + " L";
}

document.getElementById("water-val").textContent = water + " L";

// title date
const now = new Date();
document.getElementById("day-title").textContent = now.toLocaleDateString(
  "en-US",
  {
    weekday: "long",
    month: "short",
    day: "numeric",
  },
);
