run this in console to reset streak counter:

localStorage.removeItem("streak");
localStorage.removeItem("lastStreakDate");
streak = 0;
lastStreakDate = null;
updateStreakDisplay();
if (window.saveToFirestore) window.saveToFirestore({ streak: 0, lastStreakDate: null });

run this to reset pin and show it

sessionStorage.removeItem("user");
location.reload();

to add an extra column in the csv in second place
find: ^([^,#\n][^,]\*),
replace: $1,,
