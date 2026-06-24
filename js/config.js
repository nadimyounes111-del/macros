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
    initApp();

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
  },
);

// streak counter
let streak = 0;
let lastStreakDate = null;
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
  updateStreakDisplay();
  if (window.saveToFirestore)
    window.saveToFirestore({ streak, lastStreakDate });
}

updateStreakDisplay();

// firebase pins
const USERS = {
  1234: "nadim",
  1111: "My bubu",
};

function updateUserName() {
  document.querySelector(".user-name").textContent = currentUser;
}

let currentUser = sessionStorage.getItem("user") || null;

function submitPin() {
  const pin = document.getElementById("pin-input").value;
  const user = USERS[pin];

  if (!user) {
    document.getElementById("pin-label").textContent =
      "This PIN does not exist";
    document.getElementById("pin-input").value = "";
    return;
  }

  currentUser = user;
  sessionStorage.setItem("user", user);
  updateUserName();
  document.getElementById("pin-screen").style.display = "none";
  window.initFirestore(user);
  initApp();
}

document.getElementById("pin-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") submitPin();
});
