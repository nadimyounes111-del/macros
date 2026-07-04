// #region Open/Close

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

// #region Macro Goals

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

// #region Widget Toggles

let enabledWidgets = {};

function initWidgetToggles() {
  document.querySelectorAll(".settings-checkbox").forEach((btn) => {
    const widget = btn.dataset.widget;
    btn.addEventListener("click", () => toggleWidget(widget, btn));
  });
}

function isCurrentlyEnabled(widget) {
  return enabledWidgets[widget] === true; // default to false if never set
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
  document.querySelectorAll(".settings-checkbox").forEach((btn) => {
    const widget = btn.dataset.widget;
    applyWidgetState(widget, isCurrentlyEnabled(widget), btn);
  });
}

// #endregion

// #region Toggle protein count

let showMealProtein = true;
let dimCheckedEntries = true; // default ON

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
    .querySelector('[data-setting="dimCheckedEntries"]')
    .classList.toggle("is-checked", dimCheckedEntries);
  document.body.classList.toggle("hide-meal-protein", !showMealProtein);
  document.body.classList.toggle("dim-disabled", !dimCheckedEntries);
}

// #endregion
