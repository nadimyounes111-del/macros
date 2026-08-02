// #region ===== Sets up add food page

function isPackFood(food) {
  return Object.keys(PACK_INFO).includes(food.tag);
}

function setupAddFood() {
  const searchInput = document.getElementById("food-search");
  const autocompleteList = document.getElementById("autocomplete-list");

  renderPackFilters();

  resetFoodSelection();
  searchInput.value = "";

  searchInput.oninput = function () {
    if (document.querySelector(".custom-card").classList.contains("visible")) {
      closeCustomCard();
    }
    collapseExpandedCard();
    if (document.querySelector(".custom-card").classList.contains("visible")) {
      closeCustomCard();
    }
    const query = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = "";

    const queryWords = query.split(/\s+/).filter(Boolean);

    const strip = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    let matches = query
      ? foods.filter((f) => {
          if (!f.name) return false;
          const name = strip(f.name);
          return queryWords.every((word) => name.includes(strip(word)));
        })
      : foods;

    matches = matches.filter((f) => !isPackFood(f) || activeFilter === f.tag);

    if (activeFilter === "custom") {
      matches = matches.filter((f) => f.isCustom);
    } else if (activeFilter) {
      matches = matches.filter((f) => {
        const tags = (f.tag || "").split(",").map((t) => t.trim());
        return tags.includes(activeFilter);
      });
    }

    matches = matches
      .slice()
      .sort((a, b) =>
        formatFoodName(a.name).title.localeCompare(
          formatFoodName(b.name).title,
        ),
      )
      .slice();

    if (matches.length === 0 && activeFilter === "custom") {
      autocompleteList.innerHTML = `
    <div class="empty-state-list">
      <div class="empty-state-list-wrap">
       <svg class="empty-state-list-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M197.1 96C214.4 96 231.3 99.4 247 105.7L301.8 190.9L226.4 266.3C224.9 267.8 224 269.9 224.1 272.1C224.2 274.3 225.1 276.3 226.7 277.8L338.7 381.8C341.6 384.5 346.1 384.7 349.2 382.1C352.3 379.5 353 375.1 350.9 371.7L290.5 273.6L381.2 198C383.8 195.9 384.7 192.3 383.6 189.2L360.4 124.6C383.6 106.3 412.6 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96z"/></svg>
        <div class="double-span">
       <span class="empty-state-list-text">You don't have any custom entries</span>
         <span class="empty-state-list-text">Tap the pencil icon to add</span>
         </div>
       
      </div>
    </div>
  `;
    } else if (matches.length === 0) {
      autocompleteList.innerHTML = `
    <div class="empty-state-list">
      <div class="empty-state-list-wrap">
        <svg class="empty-state-list-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M197.1 96C214.4 96 231.3 99.4 247 105.7L301.8 190.9L226.4 266.3C224.9 267.8 224 269.9 224.1 272.1C224.2 274.3 225.1 276.3 226.7 277.8L338.7 381.8C341.6 384.5 346.1 384.7 349.2 382.1C352.3 379.5 353 375.1 350.9 371.7L290.5 273.6L381.2 198C383.8 195.9 384.7 192.3 383.6 189.2L360.4 124.6C383.6 106.3 412.6 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96z"/></svg>
        <span class="empty-state-list-text">Can't find what you're looking for?</span>
      </div>

      <form action="https://formspree.io/f/xrenldgw" method="POST" class="mail-form">
        <input type="text" name="message" class="mail-input" placeholder="Request addition" required></input>
        <button class="mail-submit" type="submit">Send</button>
      </form>
    </div>
  `;

      const mailForm = autocompleteList.querySelector(".mail-form");
      mailForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const button = mailForm.querySelector("button");
        button.disabled = true;
        button.textContent = "Sending...";

        try {
          const response = await fetch(mailForm.action, {
            method: mailForm.method,
            body: new FormData(mailForm),
            headers: { Accept: "application/json" },
          });

          if (response.ok) {
            button.textContent = "Thank you!";
            button.classList.add("success");
            mailForm.reset();
          } else {
            button.textContent = "Error";
            button.disabled = false;
          }
        } catch (error) {
          button.textContent = "Network error";
          button.disabled = false;
        }
      });
    } else {
      matches.forEach(function (food) {
        const { title, subtitle } = formatFoodName(food.name);
        const li = document.createElement("li");
        li.className = "food-item";
        li.dataset.id = food.id;

        li.innerHTML = `
        <div class="food-with-delete">
            <div class="food-item-wrap">
                <span class="food-title">${title}</span>
                <span class="food-subtitle${subtitle ? "" : " hidden-subtitle"}">${subtitle || "-"}</span>
            </div>
            
     ${
       food.isCustom
         ? `<div class="swap-btn custom-options-btn" onclick="event.stopPropagation(); toggleCustomMenu(this, '${food.id}')">
       <svg class="custom-options-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M96 320C96 289.1 121.1 264 152 264C182.9 264 208 289.1 208 320C208 350.9 182.9 376 152 376C121.1 376 96 350.9 96 320zM264 320C264 289.1 289.1 264 320 264C350.9 264 376 289.1 376 320C376 350.9 350.9 376 320 376C289.1 376 264 350.9 264 320zM488 264C518.9 264 544 289.1 544 320C544 350.9 518.9 376 488 376C457.1 376 432 350.9 432 320C432 289.1 457.1 264 488 264z"/></svg>
         <div class="meal-menu">
           <button type="button" onclick="event.stopPropagation(); editCustomFood('${food.id}')">Edit</button>
           <button class="meal-menu-red" type="button" onclick="event.stopPropagation(); deleteCustomFood('${food.id}')">Delete</button>
         </div>
       </button>`
         : ""
     } </div>
      `;

        li.addEventListener("click", function () {
          const wasThisExpanded = this === expandedCardLi;

          collapseExpandedCard();

          if (wasThisExpanded) return;

          selectedFood = food;
          this.appendChild(getFoodPanel());
          this.classList.add("expanded");
          expandedCardLi = this;

          renderUnitSelector(food);
          updatePreview();
        });

        autocompleteList.appendChild(li);
      });
    }
  };

  searchInput.dispatchEvent(new Event("input"));

  document.getElementById("add-modal").onkeydown = function (e) {
    if (e.key === "Enter") saveFood();
  };
}

// #endregion

// #region ===== Filters

let activeFilter = null;

function wireFilterButton(btn) {
  btn.addEventListener("click", function () {
    const tag = this.dataset.tag;
    if (tag === "recents") return;

    if (activeFilter === tag) {
      activeFilter = null;
      this.classList.remove("active");
    } else {
      document
        .querySelectorAll(".filters button, .pack-filters button")
        .forEach((b) => b.classList.remove("active"));
      activeFilter = tag;
      this.classList.add("active");
      closeCustomCard();
    }

    document.getElementById("food-search").dispatchEvent(new Event("input"));
  });
}

document.querySelectorAll(".filters button").forEach(wireFilterButton);

// #endregion

// #region ===== Food Pack Filters

document.querySelector(".food-pack-btn").addEventListener("click", function () {
  const anyEnabled = Object.keys(PACK_INFO).some((packKey) =>
    isPackEnabled(packKey),
  );

  if (!anyEnabled) {
    showToast(
      `<span class="toast-title">No packs enabled</span>
       <button class="toast-btn" onclick="openSettings()">Settings</button>`,
    );
    return;
  }

  const packs = document.querySelector(".pack-wrapper");
  const isOpen = this.classList.contains("active");

  this.classList.toggle("active", !isOpen);
  packs.classList.toggle("open", !isOpen);
});

const PACK_INFO = {
  subway: { label: "Subway", logo: "assets/subway.webp" },
  "chick-fil-a": { label: "Chick-fil-a", logo: "assets/chick.jpeg" },
};

function renderPackFilters() {
  const wrap = document.getElementById("pack-filters");
  if (!wrap) return;
  wrap.innerHTML = "";

  let anyRendered = false;

  Object.keys(PACK_INFO).forEach((packKey) => {
    if (!isPackEnabled(packKey)) return;

    anyRendered = true;

    const info = PACK_INFO[packKey];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.tag = packKey;
    if (activeFilter === packKey) btn.classList.add("active");
    btn.innerHTML = `
       <img src="${info.logo}" alt="${info.label}" class="filter-logo" />
      ${info.label}
    `;
    wireFilterButton(btn);
    wrap.appendChild(btn);
  });

  injectIcons(wrap);
  if (!anyRendered) {
    document.querySelector(".pack-wrapper")?.classList.remove("open");
    document.querySelector(".food-pack-btn")?.classList.remove("active");
  }
}

// #endregion

// #region ===== Autocomplete list

document.querySelector(".modal-header").addEventListener("click", function () {
  document
    .getElementById("autocomplete-list")
    .scrollTo({ top: 0, behavior: "smooth" });
});

// #endregion

// #region ===== Food name format

function formatFoodName(rawName) {
  const [first, ...rest] = rawName.split(",");
  const capitalize = (s) =>
    s
      .trim()
      .replace(
        /(^|\s)([a-z])/gi,
        (_, boundary, c) => boundary + c.toUpperCase(),
      );
  const title = capitalize(first);
  const subtitle = rest.length ? capitalize(rest.join(",")) : "";
  return { title, subtitle };
}

// #endregion

// #region ===== Edit panel

function createFoodPanel() {
  const div = document.createElement("div");
  div.className = "food-edit";
  div.innerHTML = `

  
    
    <div class="servings-meal">
      <div class="add-food-servings">
        <input class="serving-edit-af" id="servings" placeholder="Servings" type="number" inputmode="decimal" min="0" />
      </div>
       <div id="serving-size-label"></div>
    </div>


    
    <div class="macros-save-wrap">
      <div id="macros-preview">
        <div class="macro-item">
         <span class="macro-edit-svg cal" data-icon="fire"></span>
          <span class="macro-edit" id="cal-preview"></span>
        </div>
        <div class="macro-item">
          <span class="macro-edit-svg pro" data-icon="chicken"></span>
          <span class="macro-edit" id="pro-preview"></span>
        </div>
        <div class="macro-item">
          <span class="macro-edit-svg carb" data-icon="wheat"></span>
          <span class="macro-edit" id="carb-preview"></span>
        </div>
        <div class="macro-item">
       <span class="macro-edit-svg fat" data-icon="avocado"></span>
          <span class="macro-edit" id="fat-preview"></span>
        </div>
      </div>
     
    </div>

         <div class="meal-options">
      <div class="meal-chip" data-meal="Breakfast">Breakfast</div>
      <div class="meal-chip" data-meal="Lunch">Lunch</div>
      <div class="meal-chip" data-meal="Snack">Snack</div>
      <div class="meal-chip" data-meal="Dinner">Dinner</div>
       <button class="save-food-btn" onclick="saveFood(false)">
        <span class="save-food-text">Add</span>
      </button>
    </div>
    

   
  `;

  injectIcons(div);

  const servingsInput = div.querySelector("#servings");
  servingsInput.oninput = updatePreview;
  servingsInput.addEventListener("click", (e) => e.stopPropagation());

  const mealChips = div.querySelectorAll(".meal-options .meal-chip");
  mealChips.forEach((chip) => {
    if (chip.dataset.meal === (window.selectedMeal || "Breakfast")) {
      chip.classList.add("active");
    }
    chip.addEventListener("click", function (e) {
      e.stopPropagation();
      mealChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      window.selectedMeal = chip.dataset.meal;
    });
  });

  const addBtn = div.querySelector(".save-food-btn");
  addBtn.addEventListener("click", (e) => e.stopPropagation());
  div
    .querySelector("#serving-size-label")
    .addEventListener("click", (e) => e.stopPropagation());

  return div;
}

let foodPanelEl = null;

function getFoodPanel() {
  if (!foodPanelEl) foodPanelEl = createFoodPanel();
  return foodPanelEl;
}

let expandedCardLi = null;

function collapseExpandedCard() {
  if (!expandedCardLi) return;
  resetFoodSelection();
  getFoodPanel().remove();
  expandedCardLi.classList.remove("expanded");
  expandedCardLi = null;
}

function resetFoodSelection() {
  selectedFood = null;
  renderUnitSelector(null);

  const servingsInput = document.getElementById("servings");
  if (servingsInput) {
    servingsInput.value = "";
    servingsInput.placeholder = "Servings";
  }

  const label = document.getElementById("serving-size-label");
  if (label) label.textContent = "";

  ["cal-preview", "pro-preview", "carb-preview", "fat-preview"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "0";
    },
  );

  updatePreview();
}

// #endregion

// #region ===== Unit conversions

const WEIGHT_UNITS = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };
const VOLUME_UNITS = {
  ml: 1,
  l: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  floz: 29.5735,
  cup: 236.588,
};

function unitClass(unit) {
  if (WEIGHT_UNITS[unit]) return "weight";
  if (VOLUME_UNITS[unit]) return "volume";
  return "count";
}

function getUnitOptions(food) {
  const base = unitClass(food.unit);
  const options = [food.unit];
  if (base === "count") return options;

  const alt = (food.altUnits || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  alt.forEach((u) => {
    if (u === food.unit) return;
    const uClass = unitClass(u);
    if (uClass === base) {
      options.push(u);
    } else if (food.gPerBaseU) {
      options.push(u);
    }
  });

  return options;
}

function convertToBaseServings(food, amount, toUnit) {
  const baseClass = unitClass(food.unit);

  if (baseClass === "count") {
    return amount;
  }

  const targetClass = unitClass(toUnit);

  if (baseClass === targetClass) {
    const table = baseClass === "weight" ? WEIGHT_UNITS : VOLUME_UNITS;
    const baseAmountInUnits = table[food.unit] * food.serving;
    const targetAmountInUnits = table[toUnit] * amount;
    return targetAmountInUnits / baseAmountInUnits;
  }

  if (!food.gPerBaseU) return null;
  const baseGrams = food.gPerBaseU * food.serving;
  const targetGrams = WEIGHT_UNITS[toUnit] * amount;
  return targetGrams / baseGrams;
}

// #endregion

// #region ===== Unit options in edit panel m

let selectedUnit = null;

function renderUnitSelector(food) {
  const label = document.getElementById("serving-size-label");
  if (!label) return;

  label.className = "";
  label.innerHTML = "";

  if (!food) return;

  if (food.isCustom) {
    selectedUnit = food.unit;
    label.className = "unit-options";
    const chip = document.createElement("div");
    chip.className = "unit-chip active";
    chip.textContent = food.unit;
    label.appendChild(chip);
    return;
  }

  const options = getUnitOptions(food);
  selectedUnit = food.unit;
  label.className = "unit-options";

  if (options.length <= 1) {
    const servingNum = parseFloat(food.serving);
    const chip = document.createElement("div");
    chip.className = "unit-chip active";
    chip.textContent =
      servingNum === 1 ? food.unit : `${food.serving}${food.unit}`;
    label.appendChild(chip);
    return;
  }

  options.forEach((u) => {
    const chip = document.createElement("div");
    chip.className = "unit-chip" + (u === food.unit ? " active" : "");
    chip.textContent = u;
    chip.addEventListener("click", function (e) {
      e.stopPropagation();
      label
        .querySelectorAll(".unit-chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedUnit = u;
      updatePreview();
    });
    label.appendChild(chip);
  });
}

// #endregion

// #region ===== Edit panel macros

function updatePreview() {
  const servingSizeLabel = document.getElementById("serving-size-label");
  const calEl = document.getElementById("cal-preview");
  const proEl = document.getElementById("pro-preview");
  const carbEl = document.getElementById("carb-preview");
  const fatEl = document.getElementById("fat-preview");

  if (!calEl || !proEl || !carbEl || !fatEl) return;

  if (!selectedFood) {
    if (servingSizeLabel) servingSizeLabel.textContent = "";
    calEl.textContent = "0";
    proEl.textContent = "0";
    carbEl.textContent = "0";
    fatEl.textContent = "0";
    return;
  }

  const servingsInput = document.getElementById("servings");
  const rawAmount = parseFloat(servingsInput?.value) || 0;
  const unit = selectedUnit || selectedFood.unit;
  const servings = convertToBaseServings(selectedFood, rawAmount, unit) || 0;

  calEl.textContent = (parseFloat(selectedFood.calories) * servings).toFixed(0);
  proEl.textContent = (parseFloat(selectedFood.protein) * servings).toFixed(0);
  carbEl.textContent = (parseFloat(selectedFood.carbs) * servings).toFixed(0);
  fatEl.textContent = (parseFloat(selectedFood.fat) * servings).toFixed(0);
}

// #endregion

// #region ===== Save food & reset page

function saveFood(closeAfter = true) {
  const meal = window.selectedMeal || "Breakfast";
  const servingsInput = document.getElementById("servings");
  const searchInput = document.getElementById("food-search");

  if (!selectedFood) return;
  const rawAmount = parseFloat(servingsInput.value) || 0;
  if (rawAmount <= 0) return;
  const unit = selectedUnit || selectedFood.unit;
  const servings = convertToBaseServings(selectedFood, rawAmount, unit);
  if (servings === null) return;

  const entry = {
    food: selectedFood.name,
    meal: meal,
    servings: servings,
    unitAmount: rawAmount,
    unit: unit,
    calories: parseFloat(selectedFood.calories) * servings,
    protein: parseFloat(selectedFood.protein) * servings,
    carbs: parseFloat(selectedFood.carbs) * servings,
    fat: parseFloat(selectedFood.fat) * servings,
    servingSize: `${rawAmount}${unit}`,
  };

  window.foodLog.push(entry);
  saveLog();
  renderLog();
  collapseExpandedCard();
  showToast("Food added");
  closeAfter ? closeFoodModal() : resetFoodModalForNextEntry();
}

function resetFoodModalForNextEntry() {
  const searchInput = document.getElementById("food-search");
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("input"));
}

// #endregion

// #region ===== Creates custom item

function showCustomCard() {
  const card = document.querySelector(".custom-card");
  const list = document.getElementById("autocomplete-list");
  const footer = document.querySelector(".footer-text");
  const filters = document.querySelector(".filters-wrapper");
  const packs = document.querySelector(".pack-wrapper");

  card.classList.add("visible");
  list.style.display = "none";
  footer.classList.add("hidden");
  filters.classList.add("hidden");
  packs.classList.add("hidden");
  document.querySelector(".search-bar").classList.add("hidden");
  document.querySelector(".food-pack-btn").classList.add("hidden");

  document
    .querySelectorAll(".filters button, .pack-filters button")
    .forEach((b) => b.classList.remove("active"));
  activeFilter = null;

  document.querySelector(".custom-icon-btn").classList.add("active");
}

function resetCustomForm() {
  document.getElementById("custom-title").value = "";
  document.getElementById("custom-serving").value = "";
  document.getElementById("custom-unit").value = "";
  document.getElementById("custom-cal").value = "";
  document.getElementById("custom-pro").value = "";
  document.getElementById("custom-carb").value = "";
  document.getElementById("custom-fat").value = "";
  document.getElementById("custom-subtitle").value = "";

  document.querySelector(".custom-edit-label").classList.add("hidden");
}

function toggleCustomMenu(btn, foodId) {
  const menu = btn.querySelector(".meal-menu");
  const isOpen = menu.classList.contains("open");
  const foodItem = btn.closest(".food-item");

  document.querySelectorAll(".meal-menu.open").forEach((m) => {
    m.classList.remove("open");
    m.classList.remove("open-downward");
  });
  document
    .querySelectorAll(".food-item.menu-open")
    .forEach((el) => el.classList.remove("menu-open"));

  if (!isOpen) {
    menu.classList.add("open");
    foodItem.classList.add("menu-open");

    const btnRect = btn.getBoundingClientRect();
    const listRect = document
      .getElementById("autocomplete-list")
      .getBoundingClientRect();
    const spaceAbove = btnRect.top - listRect.top;

    if (spaceAbove < 82) {
      menu.classList.add("open-downward");
    }
  }
}

document
  .querySelector(".custom-save-btn")
  .addEventListener("click", function () {
    const name = document.getElementById("custom-title").value.trim();
    const rawServingSize =
      parseFloat(document.getElementById("custom-serving").value) || 1;
    const servingUnit =
      document.getElementById("custom-unit").value.trim() || "serving";
    const calories =
      parseFloat(document.getElementById("custom-cal").value) || 0;
    const protein =
      parseFloat(document.getElementById("custom-pro").value) || 0;
    const carbs = parseFloat(document.getElementById("custom-carb").value) || 0;
    const fat = parseFloat(document.getElementById("custom-fat").value) || 0;
    const note = document.getElementById("custom-subtitle").value.trim();

    if (!name) return;
    if (rawServingSize <= 0) return;

    const fullName = note ? `${name}, ${note}` : name;

    if (editingFoodId) {
      [window.customFoods, foods].forEach((list) => {
        const food = list.find((f) => f.id === editingFoodId);
        if (food) {
          food.name = fullName;
          food.unit = servingUnit;
          food.calories = calories / rawServingSize;
          food.protein = protein / rawServingSize;
          food.carbs = carbs / rawServingSize;
          food.fat = fat / rawServingSize;
        }
      });
      showToast("Custom food updated");
      document.getElementById("food-search").dispatchEvent(new Event("input"));
      editingFoodId = null;
    } else {
      const newFood = {
        id: `custom-${Date.now()}`,
        name: fullName,
        serving: 1,
        unit: servingUnit,
        calories: calories / rawServingSize,
        protein: protein / rawServingSize,
        carbs: carbs / rawServingSize,
        fat: fat / rawServingSize,
        altUnits: null,
        gPerBaseU: null,
        tag: null,
        brand: null,
        source: "custom",
        isCustom: true,
      };

      window.customFoods = window.customFoods || [];
      window.customFoods.push(newFood);
      foods.push(newFood);
      showToast("Custom food added");
    }

    saveCustomFoods();

    document.querySelector(".custom-card").classList.remove("visible");
    document.getElementById("autocomplete-list").style.display = "";
    resetCustomForm();

    closeCustomCard();
  });

function saveCustomFoods() {
  if (window.saveToFirestore) {
    window.saveToFirestore({ customFoods: window.customFoods });
  }
}

// #endregion

// #region ===== Delete custom item

let lastDeletedCustomFood = null;

function deleteCustomFood(id) {
  const food = window.customFoods.find((f) => f.id === id);
  if (!food) return;

  showToast(
    `<span class="toast-title">Confirm delete</span>
     <button class="toast-btn" onclick="confirmDeleteCustomFood('${id}')">Yes</button>`,
  );
}

function confirmDeleteCustomFood(id) {
  const food = window.customFoods.find((f) => f.id === id);
  if (!food) return;

  lastDeletedCustomFood = food;
  window.customFoods = window.customFoods.filter((f) => f.id !== id);
  foods = foods.filter((f) => f.id !== id);
  saveCustomFoods();

  if (selectedFood && selectedFood.id === id) {
    resetFoodSelection();
  }

  document.getElementById("food-search").dispatchEvent(new Event("input"));
  showToast(
    `Item removed <button class="toast-btn" onclick="undoDeleteCustomFood()">Undo</button>`,
  );
}

function undoDeleteCustomFood() {
  if (!lastDeletedCustomFood) return;
  window.customFoods.push(lastDeletedCustomFood);
  foods.push(lastDeletedCustomFood);
  saveCustomFoods();
  lastDeletedCustomFood = null;
  document.getElementById("food-search").dispatchEvent(new Event("input"));
}

// #endregion

// #region ===== Edid custom item

let editingFoodId = null;

function editCustomFood(id) {
  const food = window.customFoods.find((f) => f.id === id);
  if (!food) return;

  editingFoodId = id;

  const [name, ...noteParts] = food.name.split(",");
  document.getElementById("custom-title").value = name.trim();
  document.getElementById("custom-subtitle").value = noteParts.join(",").trim();
  document.getElementById("custom-serving").value = 1;
  document.getElementById("custom-unit").value = food.unit;
  document.getElementById("custom-cal").value = food.calories;
  document.getElementById("custom-pro").value = food.protein;
  document.getElementById("custom-carb").value = food.carbs;
  document.getElementById("custom-fat").value = food.fat;

  document.querySelector(".custom-edit-label").classList.remove("hidden");

  showCustomCard();
}

// #endregion
