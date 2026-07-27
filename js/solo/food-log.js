// #region ===== Render log

window.foodLog = [];
window.renderLog = renderLog;

function renderLog() {
  const logBody = document.getElementById("log-body");
  logBody.innerHTML = "";

  const meals = ["Breakfast", "Lunch", "Snack", "Dinner"];

  meals.forEach(function (meal) {
    const entries = window.foodLog.filter(
      (e) => (e.meal || "Breakfast") === meal,
    );
    if (entries.length === 0) return;

    const mealClass = "meal-" + meal.toLowerCase();
    const mealProtein = entries.reduce((sum, e) => sum + e.protein, 0);
    const mealCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const checkedCount = entries.filter((e) => e.checked).length;
    const allChecked = checkedCount === entries.length && entries.length > 0;

    const mealSection = document.createElement("div");
    mealSection.className = "meal-section " + mealClass;

    const header = document.createElement("div");
    header.className = "meal-header " + mealClass;
    if (collapsedMeals[meal]) {
      header.classList.add("collapsed");
    }
    header.onclick = () => toggleMealGroup(header, meal);

    header.innerHTML = `
  <div class="meal-header-wrap">
  <span class="meal-label">${meal}</span>
 
  

  <div class="count-wrap">
    

    <div class="cal-count-wrap">
      <span class="meal-cal">${Math.round(mealCalories)}</span>
      <svg
          class="meal-svg cal"
          fill="currentColor"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z"/></svg>
    </div>

    <div class="protein-count-wrap">
      <span class="meal-protein">${Math.round(mealProtein)}</span>
      <svg
          class="meal-svg pro"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
        >
          <path
            d="M224 329.2C224 337.7 220.6 345.8 214.6 351.8L187.8 378.6C175.5 390.9 155.3 390 138.4 385.8C133.8 384.7 128.9 384 123.9 384C90.8 384 63.9 410.9 63.9 444C63.9 477.1 90.8 504 123.9 504C130.2 504 135.9 509.7 135.9 516C135.9 549.1 162.8 576 195.9 576C229 576 255.9 549.1 255.9 516C255.9 511 255.3 506.2 254.1 501.5C249.9 484.6 248.9 464.4 261.3 452.1L288.1 425.3C294.1 419.3 302.2 415.9 310.7 415.9L399.9 415.9C406.2 415.9 412.3 415.6 418.4 414.9C430.3 413.7 434.8 399.4 429.2 388.9C420.7 373.1 415.9 355.1 415.9 335.9C415.9 274 466 223.9 527.9 223.9C535.9 223.9 543.6 224.7 551.1 226.3C562.8 228.8 575.2 220.4 573.1 208.7C558.4 126.4 486.4 63.9 399.9 63.9C302.7 63.9 223.9 142.7 223.9 239.9L223.9 329.1z"
          />
        </svg>
    </div>
    </div>
  </div>


  <div class="expand-svg-wrap">
  <span class="meal-progress${allChecked ? " all-checked" : ""}">${checkedCount}/${entries.length}</span>


  <svg class="expand-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z"/></svg>

  </div>

  `;
    mealSection.appendChild(header);

    const mealGroup = document.createElement("div");
    mealGroup.className = "meal-group " + mealClass;

    const mealGroupBody = document.createElement("div");
    mealGroupBody.className = "meal-group-body";

    entries.forEach(function (entry, i) {
      const index = window.foodLog.indexOf(entry);
      const displayAmount = entry.unitAmount ?? entry.servings;
      const unit = entry.unit || entry.servingSize || "";

      const row = document.createElement("div");
      row.className = "log-row" + (entry.checked ? " row-checked" : "");
      row.dataset.index = index;
      row.onclick = () => toggleRowExpand(row);
      row.innerHTML = `
  <div class="row-top">
    <div class="row-top-left">
      <div class="col-check">
       <button class="check-btn" onclick="toggleCheck(event, this, ${index})" data-checked="${entry.checked || false}">
          ${entry.checked ? ICONS.checkedSVG : ICONS.uncheckedSVG}
        </button>
      </div>
    <div class="col-food">${formatFoodName(entry.food).title}</div>
    </div>

      <div class="row-top-right">
      <div class="col-servings" onclick="focusServingInput(event, this)">
      <input
        inputmode="decimal"
        class="serving-edit"
        type="number"
        value="${displayAmount}"
        min="0.1"
        step="0.1"
        onchange="editServing(${index}, this.value)"
        onclick="event.stopPropagation(); this.select();"
      />
      <span class="serving-unit">${unit}</span>
    </div>
        <div class="col-del">
       <button class="delete-food-fl" onclick="deleteEntry(event, ${index})">
          <svg class="delete-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM232 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L232 344C218.7 344 208 333.3 208 320C208 306.7 218.7 296 232 296z"/></svg>
        </button>
      </div>
    </div>
  </div>

  <div class="row-bottom-wrap">

  <div class="macros-bottom">
      <div class="col-cal">
        <span class="macro-icon calories" data-icon="fire"></span>${Math.round(entry.calories)}
      </div>
      <div class="col-pro">
        <span class="macro-icon protein" data-icon="chicken"></span>${Math.round(entry.protein)}
      </div>
      <div class="col-carb">
        <span class="macro-icon carbs" data-icon="wheat"></span>${Math.round(entry.carbs)}
      </div>
      <div class="col-fat">
        <span class="macro-icon fat" data-icon="avocado"></span>${Math.round(entry.fat)}
      </div>
    
    </div>
  
    <div class="swap-btn" onclick="event.stopPropagation(); toggleMealMenu(this, ${index})">
    <span data-icon="swap" class="swap-svg"></span>
    <div class="meal-menu">
      <button type="button" onclick="event.stopPropagation(); changeEntryMeal(${index}, 'Breakfast')">Breakfast</button>
      <button type="button" onclick="event.stopPropagation(); changeEntryMeal(${index}, 'Lunch')">Lunch</button>
      <button type="button" onclick="event.stopPropagation(); changeEntryMeal(${index}, 'Snack')">Snack</button>
      <button type="button" onclick="event.stopPropagation(); changeEntryMeal(${index}, 'Dinner')">Dinner</button>
    </div>
  </div>
    

  </div>
  </div>
  `;

      if (window.expandedRows.has(String(index))) {
        row.classList.add("expanded");
      }
      mealGroupBody.appendChild(row);
    });

    mealGroup.appendChild(mealGroupBody);
    // CHANGED: append to mealSection instead of logBody
    mealSection.appendChild(mealGroup);
    // NEW: append the whole bundle to logBody
    logBody.appendChild(mealSection);
  });

  document.getElementById("empty-state").style.display =
    window.foodLog.length === 0 ? "flex" : "none";

  document
    .querySelector(".clear-btn")
    .classList.toggle("hidden", window.foodLog.length === 0);

  updateSummary();
  injectIcons(document.getElementById("log-body"));
}

function saveLog() {
  if (window.saveToFirestore)
    window.saveToFirestore({ foodLog: window.foodLog });
}

// #endregion

// #region ===== Expand meal header & food row item

let mealSaveTimeout;
let collapsedMeals = {};

function toggleMealGroup(headerEl, mealName) {
  const isCollapsed = headerEl.classList.toggle("collapsed");
  collapsedMeals[mealName] = isCollapsed;

  clearTimeout(mealSaveTimeout);
  mealSaveTimeout = setTimeout(() => {
    if (window.saveToFirestore) window.saveToFirestore({ collapsedMeals });
  }, 400);
}

window.expandedRows = window.expandedRows || new Set();

function toggleRowExpand(row) {
  const index = row.dataset.index;
  if (window.expandedRows.has(index)) {
    window.expandedRows.delete(index);
    row.classList.remove("expanded");
  } else {
    window.expandedRows.add(index);
    row.classList.add("expanded");
  }
}

// #endregion

// #region ===== Meal swapper

function toggleMealMenu(swapBtn, index) {
  const menu = swapBtn.querySelector(".meal-menu");
  const mealGroupBody = swapBtn.closest(".meal-group-body");
  const isOpen = menu.classList.contains("open");

  document
    .querySelectorAll(".meal-menu.open")
    .forEach((m) => m.classList.remove("open"));
  document
    .querySelectorAll(".meal-group-body.menu-open")
    .forEach((el) => el.classList.remove("menu-open"));

  if (!isOpen) {
    menu.classList.add("open");
    mealGroupBody.classList.add("menu-open");
  }
}

document.addEventListener("click", function () {
  document
    .querySelectorAll(".meal-menu.open")
    .forEach((m) => m.classList.remove("open"));
  document
    .querySelectorAll(".meal-group-body.menu-open")
    .forEach((el) => el.classList.remove("menu-open"));
});

function changeEntryMeal(index, newMeal) {
  window.foodLog[index].meal = newMeal;
  window.expandedRows.delete(String(index));
  saveLog();
  renderLog();
}

// #endregion

// #region ===== Check toggle

function toggleCheck(event, btn, index) {
  event.stopPropagation();
  window.foodLog[index].checked = !window.foodLog[index].checked;
  saveLog();
  renderLog();
}

// #endregion

// #region ===== Edit servings

function focusServingInput(event, wrap) {
  event.stopPropagation();
  const input = wrap.querySelector(".serving-edit");
  if (input) input.select();
}

function editServing(index, newValue) {
  newValue = parseFloat(newValue);
  if (!newValue || newValue <= 0) return;
  const original = window.foodLog[index];
  const oldAmount = original.unitAmount ?? original.servings;
  const ratio = newValue / oldAmount;
  original.servings = original.servings * ratio;
  original.unitAmount = newValue;
  original.calories = original.calories * ratio;
  original.protein = original.protein * ratio;
  original.carbs = original.carbs * ratio;
  original.fat = original.fat * ratio;
  saveLog();
  renderLog();
}

// #endregion
