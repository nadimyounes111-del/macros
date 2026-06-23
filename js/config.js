let foods = [];
let selectedFood = null;

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

const now = new Date();
document.getElementById("day-title").textContent = now.toLocaleDateString(
  "en-US",
  {
    weekday: "long",
    month: "short",
    day: "numeric",
  },
);
