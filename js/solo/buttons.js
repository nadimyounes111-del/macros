// #region Delete & Clear

let undoStack = [];

function deleteEntry(event, index) {
  event.stopPropagation();
  undoStack.push({ entry: window.foodLog[index], index: index });
  window.foodLog.splice(index, 1);
  window.expandedRows.clear();
  saveLog();
  renderLog();
}

function clearAll() {
  if (window.foodLog.length === 0) return;
  undoStack.push({ snapshot: [...window.foodLog] });
  window.foodLog = [];
  saveLog();
  renderLog();
}

// #endregion

// #region Undo

function undoDelete() {
  if (undoStack.length === 0) return;
  const last = undoStack.pop();

  if (last.snapshot) {
    // undo a clear all
    window.foodLog = [...last.snapshot];
  } else {
    // undo a single delete
    window.foodLog.splice(last.index, 0, last.entry);
  }

  saveLog();
  renderLog();
}

// #endregion

// #region Add Food

function addModalEnter(e) {
  if (e.key === "Enter") saveFood();
}

function openFoodModal() {
  document.getElementById("add-modal").classList.add("active");
  injectIcons(document.getElementById("add-modal"));
  document.getElementById("add-modal").classList.add("active");
  document.getElementById("food-search").focus();
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", addModalEnter);
}

function closeFoodModal() {
  document.getElementById("add-modal").classList.remove("active");
  setupAddFood();
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", addModalEnter);
}

// document.querySelectorAll(".meal-btn").forEach(function (btn) {
//   btn.addEventListener("click", function () {
//     document
//       .querySelectorAll(".meal-btn")
//       .forEach((b) => b.classList.remove("active"));
//     this.classList.add("active");
//   });
// });
// shortcuts
document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && e.target === document.body) openFoodModal();

  if ((e.metaKey || e.ctrlKey) && e.key === "z") {
    e.preventDefault();
    undoDelete();
  }

  if (
    (e.metaKey || e.ctrlKey) &&
    (e.key === "Backspace" || e.key === "Delete")
  ) {
    e.preventDefault();
    if (confirm("Clear food log?")) clearAll();
  }
});

// #endregion
