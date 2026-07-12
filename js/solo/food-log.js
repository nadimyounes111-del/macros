const checkedSVG = `<svg class="check-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 283 440.5 289.9 440C296.8 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"/></svg>`;
const uncheckedSVG = `<svg class="uncheck-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 144C488.8 144 496 151.2 496 160L496 480C496 488.8 488.8 496 480 496L160 496C151.2 496 144 488.8 144 480L144 160C144 151.2 151.2 144 160 144L480 144zM160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96z"/></svg>`;

window.foodLog = JSON.parse(localStorage.getItem("foodLog")) || [];
window.renderLog = renderLog;

let collapsedMeals = {};

function focusServingInput(wrap) {
  wrap.querySelector(".serving-edit").focus();
}

function toggleRowExpand(topEl) {
  topEl.closest(".log-row").classList.toggle("expanded");
}

let mealSaveTimeout;

function toggleMealGroup(headerEl, mealName) {
  const isCollapsed = headerEl.classList.toggle("collapsed");
  collapsedMeals[mealName] = isCollapsed;

  clearTimeout(mealSaveTimeout);
  mealSaveTimeout = setTimeout(() => {
    if (window.saveToFirestore) window.saveToFirestore({ collapsedMeals });
  }, 400);
}

function saveFood(closeAfter = true) {
  const activeMealBtn = document.querySelector(".meal-btn.active");
  const meal = activeMealBtn ? activeMealBtn.dataset.meal : "Breakfast";
  const servingsInput = document.getElementById("servings");
  const searchInput = document.getElementById("food-search");

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
    const newIndex = window.foodLog.length - 1;
    saveLog();
    renderLog();
    if (closeAfter) {
      closeFoodModal();
    } else {
      resetFoodModalForNextEntry();
    }
    setTimeout(() => {
      const row = document.querySelector(`[data-index="${newIndex}"]`);
      if (row) row.classList.add("row-flash");
    }, 200);
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
    protein: parseInt((parseFloat(selectedFood.Protein) * servings).toFixed(0)),
    carbs: parseInt((parseFloat(selectedFood.Carbs) * servings).toFixed(0)),
    fat: parseInt((parseFloat(selectedFood.Fat) * servings).toFixed(0)),
    servingSize: selectedFood["Serving Size"],
  };

  window.foodLog.push(entry);
  const newIndex = window.foodLog.length - 1;
  saveLog();
  renderLog();
  if (closeAfter) {
    closeFoodModal();
  } else {
    resetFoodModalForNextEntry();
  }
  setTimeout(() => {
    const row = document.querySelector(`[data-index="${newIndex}"]`);
    if (row) row.classList.add("row-flash");
  }, 200);
}

function resetFoodModalForNextEntry() {
  selectedFood = null;
  document.getElementById("food-search").value = "";
  document.getElementById("servings").value = "";
  // reset any other fields you'd want cleared — custom macro preview inputs, etc.
  document.getElementById("food-search").focus(); // ready to type the next item immediately
}

function saveLog() {
  if (window.saveToFirestore)
    window.saveToFirestore({ foodLog: window.foodLog });
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

    const mealClass = "meal-" + meal.toLowerCase();
    const mealProtein = entries.reduce((sum, e) => sum + e.protein, 0);
    const mealCalories = entries.reduce((sum, e) => sum + e.calories, 0);

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
          class="cal-svg-table"
          fill="currentColor"
       xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z"/></svg>
    </div>

    <div class="protein-count-wrap">
      <span class="meal-protein">${Math.round(mealProtein)}</span>
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
    </div>
  </div>


  <div class="expand-svg-wrap">

  <svg class="expand-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z"/></svg>

  </div>

  `;
    logBody.appendChild(header);

    // wrapper div for this meal's rows
    const mealGroup = document.createElement("div");
    mealGroup.className = "meal-group " + mealClass;

    const mealGroupBody = document.createElement("div");
    mealGroupBody.className = "meal-group-body";

    entries.forEach(function (entry, i) {
      const index = window.foodLog.indexOf(entry);
      const unit = entry.servingSize || "";

      const row = document.createElement("div");
      row.className = "log-row" + (entry.checked ? " row-checked" : "");
      row.dataset.index = index;
      row.onclick = () => toggleRowExpand(row);
      row.innerHTML = `
  <div class="row-top">
    <div class="row-top-left">
      <div class="col-check">
        <button class="check-btn" onclick="toggleCheck(this, ${index})" data-checked="${entry.checked || false}">
          ${entry.checked ? checkedSVG : uncheckedSVG}
        </button>
      </div>
      <div class="col-food" data-food="${entry.food}">${entry.food}</div>
    </div>

    <div class="row-top-right">
     <div class="col-servings" onclick="focusServingInput(this)">
  <input inputmode="decimal" class="serving-edit" type="number" value="${entry.servings}" min="0.1" step="0.1" onchange="editServing(${index}, this.value)" onfocus="this.select()" onclick="event.stopPropagation()"/>
  <span class="serving-unit">${unit}</span>
</div>
      <div class="col-del">
        <button onclick="deleteEntry(${index})">
          <svg class="delete-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM232 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L232 344C218.7 344 208 333.3 208 320C208 306.7 218.7 296 232 296z"/></svg>
        </button>
      </div>
    </div>
  </div>

 <div class="row-bottom-wrap">
  <div class="row-bottom">
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
</div>
`;
      mealGroupBody.appendChild(row);
    });

    mealGroup.appendChild(mealGroupBody);
    logBody.appendChild(mealGroup);
  });

  document.getElementById("empty-state").style.display =
    window.foodLog.length === 0 ? "flex" : "none";

  setupAddFood();
  updateSummary();
  injectIcons(document.getElementById("log-body"));
}

function toggleCustomMode() {
  // const btn = document.getElementById("custom-toggle");
  const isCustom = selectedFood === "custom";

  if (isCustom) {
    selectedFood = null;
    setCustomMode(false);
    // btn.classList.remove("active");
  } else {
    selectedFood = "custom";
    setCustomMode(true);
    // btn.classList.add("active");
  }
}

function setupAddFood() {
  const searchInput = document.getElementById("food-search");
  const autocompleteList = document.getElementById("autocomplete-list");
  const servingsInput = document.getElementById("servings");
  selectedFood = null;

  searchInput.value = "";
  servingsInput.value = "";
  updatePreview();
  setCustomMode(false);

  // const toggleBtn = document.getElementById("custom-toggle");
  // if (toggleBtn) toggleBtn.classList.remove("active");

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
        document.getElementById("servings").focus();
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

  document.getElementById("add-modal").onkeydown = function (e) {
    if (e.key === "Enter") saveFood();
  };
}

function setCustomMode(on) {
  const servingsInput = document.getElementById("servings");
  const servingLabel = document.getElementById("serving-size-label");
  const searchInput = document.getElementById("food-search");
  const ids = ["cal-preview", "pro-preview", "carb-preview", "fat-preview"];

  if (on) {
    document.getElementById("servings").placeholder = "—";
    document.getElementById("servings").value = "";
    document.getElementById("servings").disabled = true;
    document.getElementById("servings").classList.add("custom");

    document.getElementById("serving-size-label").textContent = "";
    searchInput.value = "";
    searchInput.placeholder = "Create custom";
    searchInput.focus();

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
        if (allFilled) saveFood();
      };
    });
  } else {
    document.getElementById("servings").disabled = false;
    document.getElementById("servings").classList.remove("custom");
    document.getElementById("servings").placeholder = "Servings";
    document.getElementById("serving-size-label").textContent = "";
    document.getElementById("serving-size-label").classList.remove("custom");
    servingsInput.style.display = "";
    servingLabel.style.display = "";
    searchInput.value = "";
    searchInput.placeholder = "Choose from list";
    searchInput.focus();
    ids.forEach(function (id) {
      const input = document.getElementById(id);
      input.disabled = true;
      input.value = "";
    });
  }
  ids.forEach(function (id) {
    const input = document.getElementById(id);
    input.disabled = !on;
    input.value = "";
    input.classList.toggle("custom", on);
  });
  document
    .querySelectorAll(".macro-label")
    .forEach((el) => el.classList.toggle("custom", on));
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
  btn.dataset.checked = window.foodLog[index].checked;
  btn.innerHTML = window.foodLog[index].checked ? checkedSVG : uncheckedSVG;
  const row = btn.closest(".log-row");
  row.classList.toggle("row-checked", window.foodLog[index].checked);
  saveLog();
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
