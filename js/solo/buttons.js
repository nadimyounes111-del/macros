// #region Delete & Clear

let lastDeleted = null;

function deleteEntry(event, index) {
  event.stopPropagation();
  lastDeleted = { entry: window.foodLog[index], index: index };
  window.foodLog.splice(index, 1);
  window.expandedRows.clear();
  saveLog();
  renderLog();
  showUndoToast("Undo");
}

function showUndoToast(message) {
  const toast = document.getElementById("toast");
  clearTimeout(toastTimeout);
  toast.className = "toast-base toast-undo visible";
  toast.textContent = message;

  toast.onclick = () => {
    undoDelete();
    toast.classList.remove("visible");
  };

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
    lastDeleted = null;
  }, 4000);
}

function undoDelete() {
  if (!lastDeleted) return;
  window.foodLog.splice(lastDeleted.index, 0, lastDeleted.entry);
  lastDeleted = null;
  saveLog();
  renderLog();
}

function clearAll() {
  if (window.foodLog.length === 0) return;
  showConfirmToast("Tap to confirm clear", confirmClearAll);
}

function confirmClearAll() {
  undoStack.push({ snapshot: [...window.foodLog] });
  window.foodLog = [];
  saveLog();
  renderLog();
  showToast("Log cleared");
}

function showConfirmToast(message, onConfirm) {
  const toast = document.getElementById("toast");
  clearTimeout(toastTimeout);
  toast.className = "toast-base toast-confirm visible";
  toast.textContent = `${message}`;

  toast.onclick = () => {
    onConfirm();
    toast.classList.remove("visible");
  };

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 4000);
}
// #endregion

// #region Undo

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
  resetFoodSelection();
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
