// #region ===== Open/close page

function openSettings() {
  populateGoalInputs();
  document.getElementById("settings-modal").classList.add("active");
  document.body.classList.add("modal-open");
  document
    .getElementById("settings-modal")
    .querySelector(".modal-body").scrollTop = 0;
}

function closeSettings() {
  document.getElementById("settings-modal").classList.remove("active");
  document.body.classList.remove("modal-open");
}

// #endregion

// #region ===== Macro goals

function populateGoalInputs() {
  document.getElementById("goal-cal").value = GOALS.calories;
  document.getElementById("goal-pro").value = GOALS.protein;
  document.getElementById("goal-carb").value = GOALS.carbs;
  document.getElementById("goal-fat").value = GOALS.fat;
}

function saveGoals() {
  GOALS.calories =
    parseInt(document.getElementById("goal-cal").value) || GOALS.calories;
  GOALS.protein =
    parseInt(document.getElementById("goal-pro").value) || GOALS.protein;
  GOALS.carbs =
    parseInt(document.getElementById("goal-carb").value) || GOALS.carbs;
  GOALS.fat = parseInt(document.getElementById("goal-fat").value) || GOALS.fat;

  if (window.saveToFirestore) window.saveToFirestore({ goals: GOALS });
  updateSummary();
}

function initGoalInputs() {
  ["goal-cal", "goal-pro", "goal-carb", "goal-fat"].forEach((id) => {
    document.getElementById(id).addEventListener("input", saveGoals);
  });
}

// #endregion

// #region ===== Widgets

let enabledWidgets = {};

function initWidgetToggles() {
  document
    .querySelectorAll(".settings-checkbox[data-widget]")
    .forEach((btn) => {
      const widget = btn.dataset.widget;
      btn.addEventListener("click", () => toggleWidget(widget, btn));
    });
}

function isCurrentlyEnabled(widget) {
  return enabledWidgets[widget] === true;
}

function toggleWidget(widget, btn) {
  enabledWidgets[widget] = !isCurrentlyEnabled(widget);
  applyWidgetState(widget, enabledWidgets[widget], btn);
  if (window.saveToFirestore) window.saveToFirestore({ enabledWidgets });
}

function applyWidgetState(widget, isEnabled, btn) {
  btn.classList.toggle("is-checked", isEnabled);

  const thumb = document.querySelector(".widget-thumbnail." + widget);
  if (thumb) thumb.style.display = isEnabled ? "" : "none";

  const card = document.querySelector(
    '.widget-card[data-widget="' + widget + '"]',
  );
  if (card) card.style.display = isEnabled ? "" : "none";
}

function populateWidgetToggles() {
  document
    .querySelectorAll(".settings-checkbox[data-widget]")
    .forEach((btn) => {
      const widget = btn.dataset.widget;
      applyWidgetState(widget, isCurrentlyEnabled(widget), btn);
    });

  if (widgetModalOpen) {
    showAllActiveWidgetCards();
  }
}

// #endregion

// #region ===== Food log options

let showMealProtein = false;
let showMealCal = true;
let dimCheckedEntries = true;

function initSettingsToggles() {
  wireSettingToggle(
    "showMealProtein",
    (val) => {
      showMealProtein = val;
      document.body.classList.toggle("hide-meal-protein", !val);
    },
    () => showMealProtein,
  );

  wireSettingToggle(
    "showMealCal",
    (val) => {
      showMealCal = val;
      document.body.classList.toggle("hide-meal-cal", !val);
    },
    () => showMealCal,
  );

  wireSettingToggle(
    "dimCheckedEntries",
    (val) => {
      dimCheckedEntries = val;
      document.body.classList.toggle("dim-disabled", !val);
    },
    () => dimCheckedEntries,
  );
}

function wireSettingToggle(settingKey, onChange, getValue) {
  const btn = document.querySelector(`[data-setting="${settingKey}"]`);
  btn.addEventListener("click", () => {
    const newVal = !getValue();
    onChange(newVal);
    btn.classList.toggle("is-checked", newVal);
    if (window.saveToFirestore)
      window.saveToFirestore({ [settingKey]: newVal });
  });
}

function populateSettingsToggles() {
  document
    .querySelector('[data-setting="showMealProtein"]')
    .classList.toggle("is-checked", showMealProtein);
  document
    .querySelector('[data-setting="showMealCal"]')
    .classList.toggle("is-checked", showMealCal);
  document
    .querySelector('[data-setting="dimCheckedEntries"]')
    .classList.toggle("is-checked", dimCheckedEntries);
  document.body.classList.toggle("hide-meal-protein", !showMealProtein);
  document.body.classList.toggle("hide-meal-cal", !showMealCal);
  document.body.classList.toggle("dim-disabled", !dimCheckedEntries);
}

// #endregion

// #region ===== Food Packs

let enabledPacks = {};

function initPackToggles() {
  document.querySelectorAll("[data-pack]").forEach((btn) => {
    const pack = btn.dataset.pack;
    btn.addEventListener("click", () => togglePack(pack, btn));
  });
}

function isPackEnabled(pack) {
  return enabledPacks[pack] === true;
}

function togglePack(pack, btn) {
  enabledPacks[pack] = !isPackEnabled(pack);
  applyPackState(pack, enabledPacks[pack], btn);
  if (window.saveToFirestore) window.saveToFirestore({ enabledPacks });
}

function applyPackState(pack, isEnabled, btn) {
  btn.classList.toggle("is-checked", isEnabled);
}

function populatePackToggles() {
  document.querySelectorAll("[data-pack]").forEach((btn) => {
    const pack = btn.dataset.pack;
    applyPackState(pack, isPackEnabled(pack), btn);
  });
}

// #endregion
