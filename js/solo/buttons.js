// #region ===== Toast

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

// #endregion

// #region ===== Delete from food log

let lastDeleted = null;

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

// #endregion

// #region ===== Clear all

let lastClearedLog = null;

function clearAll() {
  if (window.foodLog.length === 0) return;
  showToast(
    `<span class="toast-title">Confirm clear?</span>
     <button class="toast-btn" onclick="confirmClearAll()">Yes</button>`,
  );
}

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

// #region ===== Open add food page

function openFoodModal() {
  document.getElementById("add-modal").classList.add("active");
  injectIcons(document.getElementById("add-modal"));
  setupAddFood();
  document.getElementById("food-search").focus();
  document.body.classList.add("modal-open");
}

function closeFoodModal() {
  document.getElementById("add-modal").classList.remove("active");
  resetFoodSelection();
  document.body.classList.remove("modal-open");
}

// #endregion

// #region ===== Custom entry

function closeCustomCard() {
  const card = document.querySelector(".custom-card");
  const list = document.getElementById("autocomplete-list");
  const footer = document.querySelector(".footer-text");
  const filters = document.querySelector(".filters-wrapper");
  const packs = document.querySelector(".pack-wrapper");

  card.classList.remove("visible");
  list.style.display = "";
  footer.classList.remove("hidden");
  filters.classList.remove("hidden");
  packs.classList.remove("hidden");
  document.querySelector(".search-bar").classList.remove("hidden");
  document.querySelector(".food-pack-btn").classList.remove("hidden");

  document.querySelector(".custom-icon-btn").classList.remove("active");

  editingFoodId = null;
}

document.querySelectorAll(".custom-icon-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
  });
});

document
  .querySelector(".custom-icon-btn")
  .addEventListener("click", function () {
    const card = document.querySelector(".custom-card");
    const list = document.getElementById("autocomplete-list");
    const isOpen = card.classList.contains("visible");
    const footer = document.querySelector(".footer-text");
    const searchInput = document.getElementById("food-search");

    if (isOpen) {
      closeCustomCard();
    } else {
      document
        .querySelectorAll(".filters button")
        .forEach((b) => b.classList.remove("active"));
      activeFilter = null;
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));

      resetCustomForm();
      editingFoodId = null;

      showCustomCard();
    }
  });

// #endregion
