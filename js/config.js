let foods = [];
let selectedFood = null;

// parser
Papa.parse("foods.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  step: function (row) {
    const firstCell = row.data[Object.keys(row.data)[0]];
    if (!firstCell || firstCell.startsWith("#")) return;
    foods.push(row.data);
  },
  complete: function () {
    console.log("Foods loaded:", foods);
    renderLog();
    updateSummary();

    document.getElementById("servings").onkeydown = function (e) {
      if (e.key === "Enter") {
        document.getElementById("save-btn").click();
      }
    };
  },
});

// header title
const now = new Date();
document.getElementById("day-title").textContent = now.toLocaleDateString(
  "en-US",
  {
    weekday: "long",
    month: "short",
    day: "numeric",
  },
);

// streak counter
let streak = parseInt(localStorage.getItem("streak")) || 0;
let lastStreakDate = localStorage.getItem("lastStreakDate") || null;

function updateStreakDisplay() {
  document.querySelector(".streak-num").textContent = streak;
}

function tapStreak() {
  const today = new Date().toDateString();
  if (lastStreakDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastStreakDate !== yesterday.toDateString()) streak = 0;

  streak++;
  lastStreakDate = today;
  localStorage.setItem("streak", streak);
  localStorage.setItem("lastStreakDate", lastStreakDate);
  updateStreakDisplay();
  if (window.saveToFirestore)
    window.saveToFirestore({ streak, lastStreakDate });
}

updateStreakDisplay();
