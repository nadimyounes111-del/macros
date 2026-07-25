const checkedSVG = `<svg class="check-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 283 440.5 289.9 440C296.8 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"/></svg>`;
const uncheckedSVG = `<svg class="uncheck-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 144C488.8 144 496 151.2 496 160L496 480C496 488.8 488.8 496 480 496L160 496C151.2 496 144 488.8 144 480L144 160C144 151.2 151.2 144 160 144L480 144zM160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96z"/></svg>`;

window.foodLog = JSON.parse(localStorage.getItem("foodLog")) || [];
window.renderLog = renderLog;

window.expandedRows = window.expandedRows || new Set();

document.querySelector(".modal-header").addEventListener("click", function () {
  document
    .getElementById("autocomplete-list")
    .scrollTo({ top: 0, behavior: "smooth" });
});

// add food page
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

// food item swapper
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

let activeFilter = null; // null = no filter, show everything matching search

function changeEntryMeal(index, newMeal) {
  window.foodLog[index].meal = newMeal;
  window.expandedRows.delete(String(index)); // same reasoning as delete — index will shift after re-render since entries regroup by meal
  saveLog();
  renderLog();
}

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

let collapsedMeals = {};

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

function focusServingInput(event, wrap) {
  event.stopPropagation();
}

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
  const newIndex = window.foodLog.length - 1;
  saveLog();
  renderLog();
  collapseExpandedCard();
  showToast("Food added");
  closeAfter ? closeFoodModal() : resetFoodModalForNextEntry();
}

function resetFoodModalForNextEntry() {
  selectedFood = null;
  selectedUnit = null;

  document.getElementById("food-search").value = "";
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
  <span class="meal-progress${allChecked ? " all-checked" : ""}">${checkedCount}/${entries.length}</span>


  <svg class="expand-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M297.4 470.6C309.9 483.1 330.2 483.1 342.7 470.6L534.7 278.6C547.2 266.1 547.2 245.8 534.7 233.3C522.2 220.8 501.9 220.8 489.4 233.3L320 402.7L150.6 233.4C138.1 220.9 117.8 220.9 105.3 233.4C92.8 245.9 92.8 266.2 105.3 278.7L297.3 470.7z"/></svg>

  </div>

  `;
    mealSection.appendChild(header);

    // wrapper div for this meal's rows
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
          ${entry.checked ? checkedSVG : uncheckedSVG}
        </button>
      </div>
    <div class="col-food">${formatFoodName(entry.food).title}</div>
    </div>

    <div class="row-top-right">
    <div class="col-servings" onclick="focusServingInput(event, this)">
<input inputmode="decimal" class="serving-edit" type="number" value="${displayAmount}" min="0.1" step="0.1" onchange="editServing(${index}, this.value)"  onclick="event.stopPropagation()"/>
<span class="serving-unit">${unit}</span>
</div>
      <div class="col-del">
       <button onclick="deleteEntry(event, ${index})">
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

  updateSummary();
  injectIcons(document.getElementById("log-body"));
}

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
    ${subtitle ? `<span class="food-subtitle">${subtitle}</span>` : ""}
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

          if (wasThisExpanded) return; // clicking an open card just closes it

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
function updatePreview() {
  const servingSizeLabel = document.getElementById("serving-size-label");
  const calEl = document.getElementById("cal-preview");
  const proEl = document.getElementById("pro-preview");
  const carbEl = document.getElementById("carb-preview");
  const fatEl = document.getElementById("fat-preview");

  // panel not attached to any card right now, nothing to update
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

function toggleCheck(event, btn, index) {
  event.stopPropagation();
  window.foodLog[index].checked = !window.foodLog[index].checked;
  btn.dataset.checked = window.foodLog[index].checked;
  btn.innerHTML = window.foodLog[index].checked ? checkedSVG : uncheckedSVG;
  const row = btn.closest(".log-row");
  row.classList.toggle("row-checked", window.foodLog[index].checked);
  saveLog();
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
  if (base === "count") return options; // slice, scoop, egg, etc — no toggle

  const alt = (food.altUnits || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  alt.forEach((u) => {
    if (u === food.unit) return;
    const uClass = unitClass(u);
    if (uClass === base) {
      options.push(u); // same-class, always convertible
    } else if (food.gPerBaseU) {
      options.push(u); // cross-class, only if density is provided
    }
    // else: silently skip — CSV requested a unit we can't actually convert to
  });

  return options;
}

function convertToBaseServings(food, amount, toUnit) {
  const baseClass = unitClass(food.unit);

  if (baseClass === "count") {
    // no unit math possible — amount is just a multiplier of the base serving
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

// --- new state, module-level (put near `let selectedUnit = null;`) ---
let expandedCardLi = null;
let foodPanelEl = null;

function createFoodPanel() {
  const div = document.createElement("div");
  div.className = "add-food-bottom";
  div.innerHTML = `
    <div class="servings-meal">
      <div class="add-food-servings">
        <input class="servings-edit" id="servings" placeholder="Servings" type="number" inputmode="decimal" min="0" />
      </div>
       <div id="serving-size-label"></div>
    </div>
    <div class="macros-save">
      <div id="macros-preview">
        <div class="macro-item">
         <svg class="macro-edit-svg cal" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z"/></svg>
          <span class="macro-edit" id="cal-preview"></span>
        </div>
        <div class="macro-item">
         <svg class="macro-edit-svg pro"  fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M224 329.2C224 337.7 220.6 345.8 214.6 351.8L187.8 378.6C175.5 390.9 155.3 390 138.4 385.8C133.8 384.7 128.9 384 123.9 384C90.8 384 63.9 410.9 63.9 444C63.9 477.1 90.8 504 123.9 504C130.2 504 135.9 509.7 135.9 516C135.9 549.1 162.8 576 195.9 576C229 576 255.9 549.1 255.9 516C255.9 511 255.3 506.2 254.1 501.5C249.9 484.6 248.9 464.4 261.3 452.1L288.1 425.3C294.1 419.3 302.2 415.9 310.7 415.9L399.9 415.9C406.2 415.9 412.3 415.6 418.4 414.9C430.3 413.7 434.8 399.4 429.2 388.9C420.7 373.1 415.9 355.1 415.9 335.9C415.9 274 466 223.9 527.9 223.9C535.9 223.9 543.6 224.7 551.1 226.3C562.8 228.8 575.2 220.4 573.1 208.7C558.4 126.4 486.4 63.9 399.9 63.9C302.7 63.9 223.9 142.7 223.9 239.9L223.9 329.1z"/></svg>
          <span class="macro-edit" id="pro-preview"></span>
        </div>
        <div class="macro-item">
         <svg class="macro-edit-svg carb"  fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M111.7 298.6C117.9 294.5 126.4 295.2 131.8 300.7L177.9 346.8L184 353.5C203.7 377.3 210.3 408.5 203.2 437.4C234.9 429.7 269.4 438.4 293.8 462.7L339.9 508.8C346.1 515 346.1 525.2 339.9 531.4L332.5 538.8C295 576.3 234.2 576.3 196.7 538.8L166.1 508.3L81.4 593C72 602.4 56.9 602.4 47.5 593C38.1 583.6 38.1 568.4 47.5 559.1L132.2 474.4L101.7 443.9C64.2 406.4 64.2 345.6 101.7 308.2L109.1 300.8L111.6 298.7zM215.7 194.6C221.9 190.5 230.4 191.2 235.8 196.7L281.9 242.8L288 249.5C307.7 273.3 314.3 304.5 307.2 333.4C338.9 325.7 373.4 334.4 397.8 358.7L443.9 404.8C450.1 411 450.1 421.2 443.9 427.4L436.5 434.8C399 472.3 338.2 472.3 300.7 434.8L205.8 339.9C168.3 302.4 168.3 241.6 205.8 204.2L213.2 196.8L215.7 194.7zM527.2 79C536.6 69.6 551.8 69.6 561.2 79C570 87.8 570.5 101.7 562.8 111.2L561.2 113L446.7 227.4C454.4 228.4 461.9 230.4 469.2 233.3L527.5 175C536.9 165.6 552.1 165.6 561.5 175C570.3 183.8 570.8 197.7 563.1 207.1L561.4 208.9L508.7 261.6L547.7 300.6C553.9 306.8 553.9 317 547.7 323.2L540.3 330.6C502.8 368.1 442 368.1 404.5 330.6L309.6 235.7C272.1 198.2 272.1 137.4 309.6 100L317 92.6L319.5 90.5C325.7 86.4 334.2 87.1 339.6 92.6L378.6 131.6L431.3 78.9C440.7 69.5 455.9 69.5 465.3 78.9C474.1 87.7 474.6 101.6 466.9 111L465.2 112.8L406.9 171.1C409.7 178.2 411.6 185.6 412.6 193.2L527.2 79z"/></svg>
          <span class="macro-edit" id="carb-preview"></span>
        </div>
        <div class="macro-item">
         <svg  class="macro-edit-svg fat" fill="currentColor" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"id="Capa_1"
                  x="0px"
                  y="0px"
                  viewBox="0 0 2122 2122"
                  style="enable-background: new 0 0 2122 2122"
                  xml:space="preserve"
                >
                  <g>
                    <path
                      d="M1694.555,1132.629c-12.692-69.272-34.358-136.575-50.499-205.126   c-11.191-47.556-19.746-95.717-25.579-144.189c-6.694-55.581-9.832-111.606-9.364-167.576   c0.92-110.66,15.142-225.764-26.022-328.482c-59.108-147.629-239.21-234.407-391.512-188.658   c-175.376,52.721-269.539,236.043-391.81,372.37C669.943,615.684,512.754,721.346,417.261,895.557   c-111.303,203.045-154.577,457.782-71.557,678.381c27.416,72.833,67.084,140.97,116.745,200.463   c65.306,78.334,147.912,141.661,242.489,180.935c101.135,41.973,210.046,59.639,317.344,54.387   c207.936-10.251,409.841-106.607,537.446-279.011C1684.752,1561.773,1732.386,1339.371,1694.555,1132.629z"
                    />
                    <path
                      d="M1623.559,1123.966c-11.386-62.168-30.831-122.524-45.301-184.019   c-0.218-0.927-0.397-1.861-0.614-2.788c-21.142-90.648-31.491-183.795-30.719-276.865c0.804-99.274,13.554-202.519-23.362-294.68   c-27.415-68.467-83.859-122.358-150.855-152.745c-62.578-28.385-134.383-36.302-200.35-16.468   c-157.325,47.274-241.822,211.737-351.483,334.012C704.413,660.239,563.419,755.011,477.728,911.308   c-88.053,160.628-128.604,357.344-85.885,537.276c5.695,24.113,12.916,47.917,21.72,71.274   c39.277,104.352,106.661,198.005,193.669,266.424c39.142,30.78,82.251,56.462,128.567,75.7   c90.743,37.666,188.433,53.525,284.706,48.774c186.518-9.164,367.619-95.605,482.09-250.265   C1614.779,1508.945,1657.503,1309.427,1623.559,1123.966z"
                    />
                    <path
                      d="M1623.559,1123.966c-11.386-62.168-30.831-122.524-45.301-184.019   c-0.218-0.927-0.397-1.861-0.614-2.788c-21.142-90.648-31.491-183.795-30.719-276.865c0.804-99.274,13.554-202.519-23.362-294.68   c-27.415-68.467-83.859-122.358-150.855-152.745c39.22,83.747,43.167,166.66,17.5,260.379   c-26.251,95.825-70.967,187.99-76.497,287.206c-2.312,41.487,2.36,82.676,9.599,123.739c-9.642-18.364-20.954-35.761-34.349-51.656   c-39.605-47.055-94.578-75.055-155.878-72.555c-2.026,0.083-4.059,0.195-6.085,0.336   c-154.991,11.333-301.208,163.24-360.063,298.372c-43.917,100.882-67.055,224.628-37.247,333.568   c6.387,23.416,15.221,46.105,26.831,67.771c4.38,8.179,9.117,16.005,14.126,23.541c-109.346-36.382-218.743-92.441-326.613-58.927   c-18.499,5.749-35.859,13.915-52.19,23.941c5.695,24.113,12.916,47.917,21.72,71.274   c39.277,104.352,106.661,198.005,193.669,266.424c39.142,30.78,82.251,56.462,128.567,75.7   c90.743,37.666,188.433,53.525,284.706,48.774c186.518-9.164,367.619-95.605,482.09-250.265   C1614.779,1508.945,1657.503,1309.427,1623.559,1123.966z"
                    />
                    <path
                      style="fill: #1a1a1a"
                      d="M1359.072,980.249c-8.582-33.073-19.91-65.872-35.76-96.056   c-9.642-18.364-20.954-35.761-34.349-51.656c-39.605-47.055-94.578-75.055-155.878-72.555c-2.026,0.083-4.059,0.195-6.085,0.336   c-154.991,11.333-301.208,163.24-360.063,298.372c-43.917,100.882-67.055,224.628-37.247,333.568   c6.387,23.416,15.221,46.105,26.831,67.771c4.38,8.179,9.117,16.005,14.126,23.541c67.32,101.282,189.312,144.172,309.191,119.508   c37.023-7.61,70.801-20.39,101.217-37.471c92.633-52.024,153.964-144.185,180.546-253.349   C1388.041,1203.625,1387.155,1088.463,1359.072,980.249z"
                    />
                    <path
                      d="M1644.056,927.503c-11.191-47.556-19.746-95.717-25.579-144.189   c-13.605,51.275-27.223,102.563-40.833,153.845c0.217,0.927,0.396,1.862,0.614,2.788c14.47,61.495,33.914,121.851,45.301,184.019   c33.944,185.462-8.78,384.979-120.964,536.526c-114.47,154.66-295.571,241.1-482.09,250.265   c-96.273,4.751-193.963-11.108-284.706-48.774c-46.317-19.238-89.425-44.919-128.567-75.7c-11.797-0.037-23.59-0.167-35.369-0.49   c-37.968-1.057-74.329-4.473-109.413-11.391c65.306,78.334,147.912,141.661,242.489,180.935   c101.135,41.973,210.046,59.639,317.344,54.387c207.936-10.251,409.841-106.607,537.446-279.011   c125.023-168.94,172.657-391.342,134.825-598.084C1681.863,1063.357,1660.197,996.054,1644.056,927.503z"
                    />
                    <path
                      style="fill: #1a1a1a"
                      d="M1133.084,759.981c67.162,124.94,83.635,277.184,41.525,412.925   c-30.831,99.41-95.216,192.492-189.242,237.101c-94.548,44.828-169.573,16.775-255.678-17.749   c6.387,23.416,15.221,46.105,26.831,67.771c4.38,8.179,9.117,16.005,14.126,23.541c67.32,101.282,189.312,144.172,309.191,119.508   c37.023-7.61,70.801-20.39,101.217-37.471c92.633-52.024,153.964-144.185,180.546-253.349   c26.441-108.633,25.554-223.795-2.529-332.009c-8.582-33.073-19.91-65.872-35.76-96.056c-9.642-18.364-20.954-35.761-34.349-51.656   C1249.357,785.482,1194.385,757.482,1133.084,759.981z"
                    />
                    <path
                      style="fill: #1a1a1a"
                      d="M960.675,1155.747c33.394-35.464,70.465-67.961,97.978-108.166   c15.99-23.367,28.809-50.299,28.433-78.616c-0.38-28.317-16.892-57.773-43.907-66.251c-19.513-6.119-40.779-0.736-59.649,7.152   c-84.307,35.24-140.984,117.607-170.562,204.063c-13.452,39.308-38.509,158.884,31.24,164.034   C891.594,1281.462,933.206,1184.916,960.675,1155.747z"
                    />
                    <path
                      d="M505.991,1057.233c20.936-6.709,23.639-35.586,31.513-53.793   c11.279-26.095,24.589-51.298,39.371-75.571c14.728-24.19,30.991-48.151,48.814-70.158c16.662-20.57,37.008-38.67,51.323-60.994   c5.184-8.093-4.843-16.731-12.59-12.59c-24.463,13.077-43.629,35.756-61.583,56.453c-18.68,21.54-35.776,43.81-51.084,67.902   c-15.97,25.14-29.836,51.591-41.773,78.87c-7.936,18.144-27.206,47.284-14.188,65.734   C498.045,1056.273,501.977,1058.519,505.991,1057.233z"
                    />
                    <path
                      d="M486.293,1256.585c7.849-16.838,4.273-35.562,5.852-53.788c1.9-21.866,9.393-42.641,10.694-64.477   c0.629-10.524-13.31-12.473-18.44-4.994c-12.205,17.798-15.684,40.136-18.222,61.242c-2.368,19.737-6.295,44.979,5.725,62.017   C475.151,1261.193,483.419,1262.758,486.293,1256.585z"
                    />
                    <path
                      d="M769.056,684.994c113.408-23.688,178.553-134.85,234.855-225.315   c33.53-53.88,69.447-109.803,122.314-146.777c23.362-16.341,49.296-29.062,77.018-35.936c32.779-8.127,59.79-2.865,92.039,2.699   c16.014,2.757,27.736-18.792,11.703-27.766c-46.885-26.251-110.738-12.331-156.507,9.169   c-56.102,26.353-98.582,71.956-133.725,121.958C943.209,487.67,893.377,619.406,764.028,666.748   C752.646,670.914,757.022,687.508,769.056,684.994z"
                    />
                  </g>
                </svg>
          <span class="macro-edit" id="fat-preview"></span>
        </div>
      </div>
      <button class="save-food-btn" onclick="saveFood(false)">
        <span class="save-food-svg">Add</span>
      </button>
    </div>
  `;
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

function getFoodPanel() {
  if (!foodPanelEl) foodPanelEl = createFoodPanel();
  return foodPanelEl;
}

// call this to close whatever card is currently open — panel still
// attached at this point, so resetFoodSelection can resolve its ids
function collapseExpandedCard() {
  if (!expandedCardLi) return;
  resetFoodSelection();
  getFoodPanel().remove();
  expandedCardLi.classList.remove("expanded");
  expandedCardLi = null;
}

let selectedUnit = null;

function renderUnitSelector(food) {
  const label = document.getElementById("serving-size-label");
  if (!label) return;

  label.className = "";
  label.innerHTML = "";

  if (!food) return;

  if (food.isCustom) {
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

// custom logic

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
      serving: 1, // always 1 — this food IS one unit of itself, no internal scaling
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
