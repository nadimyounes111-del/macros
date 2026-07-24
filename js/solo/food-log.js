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
  window.selectedMeal = meal; // whatever variable saveFood() should read from now
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
  const capitalize = (s) => s.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  const title = capitalize(first);
  const subtitle = rest.length ? capitalize(rest.join(",")) : "";
  return { title, subtitle };
}

function focusServingInput(event, wrap) {
  event.stopPropagation();
  wrap.querySelector(".serving-edit").focus();
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
  resetFoodSelection();
  showToast("Food added");
  closeAfter ? closeFoodModal() : resetFoodModalForNextEntry();
}

function resetFoodModalForNextEntry() {
  selectedFood = null;
  selectedUnit = null;

  document.getElementById("food-search").value = "";
  document.getElementById("servings").value = "";
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
<input inputmode="decimal" class="serving-edit" type="number" value="${displayAmount}" min="0.1" step="0.1" onchange="editServing(${index}, this.value)" onfocus="this.select()" onclick="event.stopPropagation()"/>
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

  setupAddFood();
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
    }
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
          const alreadySelected = this.classList.contains("active");

          autocompleteList
            .querySelectorAll("li")
            .forEach((item) => item.classList.remove("active"));

          if (alreadySelected) {
            resetFoodSelection();
            return;
          }

          selectedFood = food;
          renderUnitSelector(food);
          updatePreview();
          this.classList.add("active");
          document.getElementById("servings").focus();
        });

        autocompleteList.appendChild(li);
      });
    }
  };

  searchInput.dispatchEvent(new Event("input"));

  document.getElementById("servings").oninput = updatePreview;

  document.getElementById("add-modal").onkeydown = function (e) {
    if (e.key === "Enter") saveFood();
  };
}

function resetFoodSelection() {
  selectedFood = null;
  renderUnitSelector(null);

  const servingsInput = document.getElementById("servings");
  servingsInput.value = "";
  servingsInput.placeholder = "Servings";

  document.getElementById("serving-size-label").textContent = "";

  ["cal-preview", "pro-preview", "carb-preview", "fat-preview"].forEach(
    (id) => {
      document.getElementById(id).textContent = "0";
    },
  );

  updatePreview();
}

function updatePreview() {
  if (!selectedFood) {
    document.getElementById("serving-size-label").textContent = "";
    document.getElementById("cal-preview").textContent = "0";
    document.getElementById("pro-preview").textContent = "0";
    document.getElementById("carb-preview").textContent = "0";
    document.getElementById("fat-preview").textContent = "0";
    return;
  }
  const rawAmount = parseFloat(document.getElementById("servings").value) || 0;
  const unit = selectedUnit || selectedFood.unit;
  const servings = convertToBaseServings(selectedFood, rawAmount, unit) || 0;

  document.getElementById("cal-preview").textContent = (
    parseFloat(selectedFood.calories) * servings
  ).toFixed(0);
  document.getElementById("pro-preview").textContent = (
    parseFloat(selectedFood.protein) * servings
  ).toFixed(0);
  document.getElementById("carb-preview").textContent = (
    parseFloat(selectedFood.carbs) * servings
  ).toFixed(0);
  document.getElementById("fat-preview").textContent = (
    parseFloat(selectedFood.fat) * servings
  ).toFixed(0);
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

let selectedUnit = null;

function renderUnitSelector(food) {
  const label = document.getElementById("serving-size-label");
  if (!food) {
    label.innerHTML = "";
    return;
  }
  if (food.isCustom) {
    label.innerHTML = `<span>x ${food.unit}</span>`;
    return;
  }
  const options = getUnitOptions(food);
  selectedUnit = food.unit;
  label.innerHTML = "";

  if (options.length <= 1) {
    const span = document.createElement("span");
    const servingNum = parseFloat(food.serving);
    span.textContent =
      servingNum === 1 ? food.unit : `${food.serving}${food.unit}`;
    label.appendChild(span);
    return;
  }

  const select = document.createElement("select");
  select.id = "unit-select";
  options.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u;
    opt.textContent = u;
    select.appendChild(opt);
  });
  select.value = food.unit;
  select.addEventListener("change", function () {
    selectedUnit = this.value;
    updatePreview();
  });
  label.appendChild(select);
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

    saveCustomFoods(); // writes window.customFoods to Firestore — see below

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

  lastDeletedCustomFood = food;
  window.customFoods = window.customFoods.filter((f) => f.id !== id);
  foods = foods.filter((f) => f.id !== id);
  saveCustomFoods();

  if (selectedFood && selectedFood.id === id) {
    resetFoodSelection();
  }

  document.getElementById("food-search").dispatchEvent(new Event("input"));
  showToast(
    `<span class="toast-title">Item removed</span>
    
   <button class="toast-btn" onclick="undoDeleteCustomFood()">Undo</button>`,
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
