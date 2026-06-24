/* =========================
    Creatine
========================= */
let creatineTaken = false;
const creatineBtn = document.getElementById("creatine-check-btn");
creatineBtn.dataset.checked = creatineTaken;
creatineBtn.innerHTML = creatineTaken
  ? creatinecheckedSVG
  : creatineuncheckedSVG;

function toggleCreatine(btn) {
  creatineTaken = !creatineTaken;
  btn.dataset.checked = creatineTaken;
  btn.innerHTML = creatineTaken ? creatinecheckedSVG : creatineuncheckedSVG;
  if (window.saveToFirestore)
    window.saveToFirestore({ creatine: creatineTaken });
}

/* =========================
    Water
========================= */
let water = 0;

function adjustWater(amount) {
  water = Math.max(0, parseFloat((water + amount).toFixed(1)));
  document.getElementById("water-val").textContent = water + " L";
  if (window.saveToFirestore) window.saveToFirestore({ water });
}

document.getElementById("water-val").textContent = water + " L";
