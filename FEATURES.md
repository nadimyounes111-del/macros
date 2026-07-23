## Norm Specifications

### Base

- Date changes automatically every day

### Widgets

- Hydration: add/remove water amounts, toggle L or oz
- Supplements: custom entries to check throughout the day
- Weight: log weight, compares to previous log and shows increase/decrease, toggle kg or lbs
- Notes: write anything to keep

### Macro Cards

- Show daily goal, can be edited in settings
- Fill up as you add foods to log

### Food Log

- Top down: meal header > food item > info
- Meal header can show protein and calorie totals, can be turned off in settings
- Meal header also shows counter for held food items and how many are checked
- Food item shows name, editable servings, serving unit, checkbox and delete buttons that shows undo toast
- Food item can be dim/normal when checked, changed in settings
- Info section shows macros that update with serving change
- Info also contains meal swap button, opens menu to switch item to other section
- Clear button shows a toast confirmation before clearing entire log

### Log Food - Modal

- Opened by pressing green + button top right of thr screen
- Search bar and filters, can be mixed (search within a filtered list)
- List contains around 260 foods
- Pressing a food item allows editting of bottom card to choose servings, unit, and view macros as you edit
- Adding a food shows successful toast
- Empty state shows input option to request addition of food
- Footer shows small disclaimer surrounding data acquisition and advice
- All foods sourced from USDA FoodCentral or NCCDB, unless a brand name is written

### Settings - Modal

- Account: allows signing out
- Macros: edits daily macro goals for cards
- Food Log: allows dimming checked food entries, and showing protein/calories in meal headers
- Widgets: allow toggling which widgets get shown, if all are off the section gets removed entirely
- Contact us: provides email for contact

### Sign-in Page

- User can sign in with email/password, with password toggling visible/hidden
- User can sign up with email/password and input display name (currently not functional)
- Guest view option showing pre-filled fully functional page of the site, but does not save any data upon refresh
- Forgot password sends custom template email to user, routes to firebase reset page
- Customized authorization error messages
- Loading spinner on successful login

### Code

- Uses firebase to store all info (authorization, food log, widgets, etc.)
- Authorization stored in local storage so refresh allows auto log-in
- Loading screen while data is being written from firebase
