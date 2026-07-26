// #region ===== Sets up add food page

function setupAddFood() {
  const searchInput = document.getElementById("food-search");
  const autocompleteList = document.getElementById("autocomplete-list");

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

    let matches = query
      ? foods.filter((f) => {
          if (!f.name) return false;
          const name = f.name.toLowerCase();
          return queryWords.every((word) => name.includes(word));
        })
      : foods;

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
        ? `<button class="delete-custom-btn">
             <svg class="delete-custom-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
               <path d="M232.7 69.9C237.1 56.8 249.3 48 263.1 48L377 48C390.8 48 403 56.8 407.4 69.9L416 96L512 96C529.7 96 544 110.3 544 128C544 145.7 529.7 160 512 160L128 160C110.3 160 96 145.7 96 128C96 110.3 110.3 96 128 96L224 96L232.7 69.9zM128 208L512 208L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 208zM216 272C202.7 272 192 282.7 192 296L192 488C192 501.3 202.7 512 216 512C229.3 512 240 501.3 240 488L240 296C240 282.7 229.3 272 216 272zM320 272C306.7 272 296 282.7 296 296L296 488C296 501.3 306.7 512 320 512C333.3 512 344 501.3 344 488L344 296C344 282.7 333.3 272 320 272zM424 272C410.7 272 400 282.7 400 296L400 488C400 501.3 410.7 512 424 512C437.3 512 448 501.3 448 488L448 296C448 282.7 437.3 272 424 272z"/>
             </svg>
           </button>`
        : ""
    } </div>
  `;

        if (food.isCustom) {
          li.querySelector(".delete-custom-btn").addEventListener(
            "click",
            function (e) {
              e.stopPropagation();
              deleteCustomFood(food.id);
            },
          );
        }

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

// #region ===== Meal selector in header

function toggleMealSelectMenu(wrapper) {
  const menu = wrapper.querySelector(".meal-menu-add");
  const isOpen = menu.classList.contains("open");

  document
    .querySelectorAll(".meal-menu-add.open")
    .forEach((m) => m.classList.remove("open"));

  if (!isOpen) {
    menu.classList.add("open");
  }
}

function selectMeal(btn, meal) {
  const wrapper = btn.closest(".meal-select-btn");
  wrapper.querySelector(".meal-select-label").textContent = meal;
  wrapper.querySelector(".meal-menu-add").classList.remove("open");
  window.selectedMeal = meal;
}

document.addEventListener("click", function () {
  document
    .querySelectorAll(".meal-menu-add.open")
    .forEach((m) => m.classList.remove("open"));
});

// #endregion

// #region ===== Filters

let activeFilter = null;

document.querySelectorAll(".filters button").forEach((btn) => {
  btn.addEventListener("click", function () {
    const tag = this.dataset.tag;
    if (tag === "recents") return;

    if (activeFilter === tag) {
      activeFilter = null;
      this.classList.remove("active");
    } else {
      document
        .querySelectorAll(".filters button")
        .forEach((b) => b.classList.remove("active"));
      activeFilter = tag;
      this.classList.add("active");
      closeCustomCard();
    }

    document.getElementById("food-search").dispatchEvent(new Event("input"));
  });
});

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
      <button class="save-food-btn" onclick="saveFood(false)">
        <span class="save-food-text">Add</span>
      </button>
    </div>
  `;

  injectIcons(div);

  const servingsInput = div.querySelector("#servings");
  servingsInput.oninput = updatePreview;
  servingsInput.addEventListener("click", (e) => e.stopPropagation());

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
    chip.textContent = `x ${food.unit}`;
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

document
  .querySelector(".custom-save-btn")
  .addEventListener("click", function () {
    const name = document.getElementById("custom-title").value.trim();
    const serving =
      parseFloat(document.getElementById("custom-serving").value) || 1;
    const unit =
      document.getElementById("custom-unit").value.trim() || "serving";
    const calories =
      parseFloat(document.getElementById("custom-cal").value) || 0;
    const protein =
      parseFloat(document.getElementById("custom-pro").value) || 0;
    const carbs = parseFloat(document.getElementById("custom-carb").value) || 0;
    const fat = parseFloat(document.getElementById("custom-fat").value) || 0;
    const note = document.getElementById("custom-subtitle").value.trim();

    if (!name) return;

    const fullName = note ? `${name}, ${note}` : name;
    const servingSize = document.getElementById("custom-serving").value.trim();
    const servingUnit = document.getElementById("custom-unit").value.trim();
    const combinedUnit = `${servingSize}${servingUnit}`;

    const newFood = {
      id: `custom-${Date.now()}`,
      name: fullName,
      serving: 1,
      unit: combinedUnit,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      isCustom: true,
    };

    window.customFoods = window.customFoods || [];
    window.customFoods.push(newFood);
    foods.push(newFood);
    showToast("Custom food added");

    saveCustomFoods();

    document.querySelector(".custom-card").classList.remove("visible");
    document.getElementById("autocomplete-list").style.display = "";
    document.getElementById("custom-title").value = "";
    document.getElementById("custom-serving").value = "";
    document.getElementById("custom-unit").value = "";
    document.getElementById("custom-cal").value = "";
    document.getElementById("custom-pro").value = "";
    document.getElementById("custom-carb").value = "";
    document.getElementById("custom-fat").value = "";
    document.getElementById("custom-subtitle").value = "";

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
