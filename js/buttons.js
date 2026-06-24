/* =========================
    Delete & Clear All
========================= */
let undoStack = [];

function deleteEntry(index) {
  undoStack.push({ entry: window.foodLog[index], index: index });
  window.foodLog.splice(index, 1);
  saveLog();
  renderLog();
}

function clearAll() {
  if (window.foodLog.length === 0) return;
  undoStack.push({ snapshot: [...window.foodLog] });
  window.foodLog = [];
  saveLog();

  water = 0;
  localStorage.setItem("water", 0);
  document.getElementById("water-val").textContent = "0 L";
  if (window.saveToFirestore) window.saveToFirestore({ water: 0 });

  creatineTaken = false;
  localStorage.setItem("creatine", false);
  const btn = document.getElementById("creatine-check-btn");
  btn.dataset.checked = false;
  btn.innerHTML = creatineuncheckedSVG;
  if (window.saveToFirestore) window.saveToFirestore({ creatine: false });

  renderLog();
}

/* =========================
    Undo
========================= */
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

document.getElementById("clear-all-btn").onclick = clearAll;

/* =========================
    Modal
========================= */
function openModal() {
  document.getElementById("add-modal").style.display = "flex";
  document.getElementById("food-search").focus();
}

function closeModal() {
  document.getElementById("add-modal").style.display = "none";
  setupAddFood();
}

document.getElementById("modal-overlay").addEventListener("click", closeModal);

document.querySelectorAll(".meal-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".meal-btn")
      .forEach((b) => b.classList.remove("active"));
    this.classList.add("active");
  });
});

document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && e.target === document.body) openModal();
});
