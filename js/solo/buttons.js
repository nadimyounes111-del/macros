// #region Delete & Clear

let lastDeleted = null;

let toastTimeout;

function showToast(html, extraClass = "") {
  const toast = document.getElementById("toast");
  clearTimeout(toastTimeout);
  toast.className = `toast ${extraClass}`.trim();
  toast.innerHTML = html;
  toast.classList.add("visible");

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 4000);
}

function deleteEntry(event, index) {
  event.stopPropagation();
  lastDeleted = { entry: window.foodLog[index], index: index };
  window.foodLog.splice(index, 1);
  window.expandedRows.clear();
  saveLog();
  renderLog();
  showToast(
    `<span class="toast-title">Item removed</span>
    
   <button class="toast-btn" onclick="undoDelete()">Undo</button>`,
  );
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
  showToast(
    `<span class="toast-title">Confirm clear?</span>
     <button class="toast-btn" onclick="confirmClearAll()">Yes</button>`,
  );
}

let lastClearedLog = null;

function confirmClearAll() {
  lastClearedLog = [...window.foodLog];
  window.foodLog = [];
  saveLog();
  renderLog();
  showToast(
    `Log cleared <button class="toast-btn" onclick="undoClearAll()">Undo</button>`,
  );
}

function undoClearAll() {
  if (!lastClearedLog) return;
  window.foodLog = lastClearedLog;
  lastClearedLog = null;
  saveLog();
  renderLog();
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

// custom
document.querySelectorAll(".custom-icon-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
  });
});

function closeCustomCard() {
  const card = document.querySelector(".custom-card");
  const list = document.getElementById("autocomplete-list");
  const bottom = document.querySelector(".add-food-bottom");
  const footer = document.querySelector(".footer-text");

  card.classList.remove("visible");
  list.style.display = "";
  bottom.classList.remove("hidden");
  footer.classList.remove("hidden");

  document.querySelector(".custom-icon-btn").classList.remove("active");
}

document
  .querySelector(".custom-icon-btn")
  .addEventListener("click", function () {
    const card = document.querySelector(".custom-card");
    const list = document.getElementById("autocomplete-list");
    const isOpen = card.classList.contains("visible");
    const bottom = document.querySelector(".add-food-bottom");
    const footer = document.querySelector(".footer-text");

    if (isOpen) {
      closeCustomCard();
    } else {
      card.classList.add("visible");
      list.style.display = "none";
      bottom.classList.add("hidden");
      footer.classList.add("hidden");
      this.classList.add("active");
    }
  });
