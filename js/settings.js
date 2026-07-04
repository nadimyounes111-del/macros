// #region Open/Close

function openSettings() {
  populateGoalInputs();
  document.getElementById("settings-modal").style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeSettings() {
  document.getElementById("settings-modal").style.display = "none";
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
