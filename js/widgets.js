// #region Widget Overlay

function openWidgetEdit() {
  document.getElementById("widget-show-modal").style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeWidgetEdit() {
  document.getElementById("widget-show-modal").style.display = "none";
  document.body.classList.remove("modal-open");
}

// #endregion

// #region Water

let water = 0;
const WATER_GOAL = 3;

function adjustWater(amount) {
  water = Math.max(0, parseFloat((water + amount).toFixed(1)));
  updateWaterUI();
  if (window.saveToFirestore) window.saveToFirestore({ water });
}

function updateWaterUI() {
  const pct = Math.min(water / WATER_GOAL, 1);
  const fillHeight = pct * 528;
  const fillY = 576 - fillHeight;

  document.getElementById("water-fill-rect").setAttribute("y", fillY);
  document.getElementById("water-fill-rect").setAttribute("height", fillHeight);
  document.getElementById("water-val").textContent = water.toFixed(1) + " L";
}

// #endregion

// #region Supplements

let supplements = [];

function renderSupplements() {
  const list = document.getElementById("supp-list");
  list.innerHTML = "";

  supplements.forEach((supp, i) => {
    const item = document.createElement("div");
    item.className = "supp-item";
    item.innerHTML = `
    <div class="supp-check-name">
      <button class="check-btn ${supp.checked ? "checked" : ""}" onclick="toggleSupp(${i})">
        ${supp.checked ? checkedSVG : uncheckedSVG}
      </button>
      <span class="supp-name">${supp.name}</span>
      </div>
      <button class="del-btn" onclick="deleteSupp(${i})"><svg class="delete-svg" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"/></svg></button>
    `;
    list.appendChild(item);
  });
}

function toggleSupp(i) {
  supplements[i].checked = !supplements[i].checked;
  saveSupplements();
  renderSupplements();
}

function deleteSupp(i) {
  supplements.splice(i, 1);
  saveSupplements();
  renderSupplements();
}

function addSupp() {
  const input = document.getElementById("supp-input");
  const name = input.value.trim();
  if (!name) return;
  supplements.push({ name, checked: false });
  input.value = "";
  saveSupplements();
  renderSupplements();
}

function saveSupplements() {
  if (window.saveToFirestore) window.saveToFirestore({ supplements });
}

// #endregion

// #region Weight

let currentWeight = null;
let previousWeight = null;
let unit = "kg";

function toDisplay(kg) {
  return unit === "kg" ? parseFloat(kg).toFixed(1) : (kg * 2.205).toFixed(1);
}

function toKg(val) {
  return unit === "kg" ? val : val / 2.205;
}

function toggleUnit() {
  unit = unit === "kg" ? "lbs" : "kg";
  if (window.saveToFirestore) window.saveToFirestore({ weightUnit: unit });
  updateWeightUI();
}

function submitWeight() {
  const val = parseFloat(document.getElementById("weight-input").value);
  if (!val || val <= 0) return;
  logWeight(toKg(val)); // always store in kg
  document.getElementById("weight-input").value = "";
}

function logWeight(newWeightKg) {
  previousWeight = currentWeight;
  currentWeight = newWeightKg;
  updateWeightUI();
  if (window.saveToFirestore)
    window.saveToFirestore({ currentWeight, previousWeight });
}

function updateWeightUI() {
  document.getElementById("unit-toggle").textContent = unit;
  if (!currentWeight) return;

  document.getElementById("weight-val").textContent =
    toDisplay(currentWeight) + " " + unit;

  const diffEl = document.getElementById("weight-diff");

  if (!previousWeight) {
    diffEl.textContent = "";
    return;
  }

  const diff = currentWeight - previousWeight;
  const sign = diff < 0 ? "↓" : "↑";
  diffEl.textContent = sign + " " + toDisplay(Math.abs(diff)) + " " + unit;
  diffEl.classList.remove("weight-up", "weight-down");
  diffEl.classList.add(diff < 0 ? "weight-down" : "weight-up");
}

// #endregion

// #region Notes

function initNotes() {
  document.getElementById("notes").addEventListener("input", function () {
    if (window.saveToFirestore) window.saveToFirestore({ notes: this.value });
  });
}

// #endregion
