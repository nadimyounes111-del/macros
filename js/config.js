// #region Parser

let foods = [];
let selectedFood = null;

const foodsReady = new Promise((resolve) => {
  Papa.parse("foods.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    step: (row) => {
      const firstCell = row.data[Object.keys(row.data)[0]];
      if (!firstCell || firstCell.startsWith("#")) return;
      foods.push(row.data);
    },
    complete: resolve,
  });
});

// #endregion

// #region initApp

function initApp() {
  renderLog();
  updateSummary();
  initGoalInputs();
  initNotes();
  initWidgetToggles();
  populateWidgetToggles();

  setTimeout(() => {
    document.getElementById("page").classList.add("visible");
    document.getElementById("pin-screen").style.display = "none";
  }, 50);
}

// #endregion

// #region Header Date

const now = new Date();
document.getElementById("day-title").textContent = now.toLocaleDateString(
  "en-US",
  {
    weekday: "short",
    month: "short",
    day: "numeric",
  },
);

function showPinLoading() {
  document.querySelector(".pin-svg").style.display = "none";
  document.getElementById("pin-loading").style.display = "flex";
}

// #endregion

// #region Firebase Config

const USERS = {
  3641: "Nad",
  4040: "Visitor",
  7184: "Maria",
};

let currentUser = null;

const firebaseReady = new Promise((resolve) => {
  const check = () =>
    window.initFirestore ? resolve() : setTimeout(check, 20);
  check();
});

Promise.all([foodsReady, firebaseReady]).then(() => {
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    // auto-login
    currentUser = savedUser;
    updateUserName();
    document.getElementById("pin-screen").style.display = "none";
    window.initFirestore(currentUser, () => initApp());
  } else {
    // show PIN screen, wait for user
    document.getElementById("pin-screen").style.display = "flex";
    document.getElementById("pin-input").focus();
  }
});

function submitPin() {
  const pin = document.getElementById("pin-input").value;
  const user = USERS[pin];

  if (!user) {
    document.getElementById("pin-label").textContent =
      "This PIN does not exist";
    document.getElementById("pin-label").classList.add("incorrect");
    document.getElementById("pin-input").value = "";
    document.getElementById("pin-input").focus();
    return;
  }

  currentUser = user;
  localStorage.setItem("user", user);
  updateUserName();
  showPinLoading();
  window.initFirestore(currentUser, () => initApp());
}

function signOut() {
  localStorage.removeItem("user");
  location.reload();
}

function updateUserName() {
  document.querySelector(".user-name").textContent = currentUser;
}

document.getElementById("pin-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") submitPin();
});

// #endregion
