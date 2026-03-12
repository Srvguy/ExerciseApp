# Back Button Fix - History Stack Issue

## The Problem:

After editing an exercise during a workout:

```
1. Start workout (home → workout)
2. Click ✏️ edit (workout → edit-exercise)
3. Click SAVE (edit-exercise → workout)
4. Click ← back button
5. Goes back to edit-exercise! ❌
```

**Expected:** Back button should go to home  
**Actual:** Back button goes back to edit screen

## Root Cause:

The router history stack looked like this:

```
History: [home, workout, edit-exercise]
         └─ back    └─ back    └─ current

When you click back: edit-exercise → workout → edit-exercise
```

**Problem:** Using `router.navigate()` adds to history, so:
- Workout → Edit (adds edit to history)
- Edit → Workout via navigate() (adds workout AGAIN to history)
- Now history has: home, workout, edit, workout
- Back button goes: workout → edit ❌

## The Fix:

**Use `router.replace()` instead of `router.navigate()` when returning from edit.**

`replace()` replaces the current view WITHOUT adding to history.

### Added to router (app.js):

```javascript
replace(view, params = {}) {
    // Replace current view without adding to history
    this.currentView = view;
    this.currentParams = params;
    this.render();
}
```

### Updated save function (views.js):

```javascript
// OLD:
router.navigate('workout', {...});  // Adds to history

// NEW:
router.replace('workout', {...});  // Replaces current view
```

## How It Works Now:

### Navigation Flow:

```
1. Home
2. Click "UPPER BODY" → workout
   History: [home]
   Current: workout

3. Click ✏️ edit
   History: [home, workout]
   Current: edit-exercise

4. Click SAVE → replace with workout
   History: [home, workout]  ← Still the same!
   Current: workout  ← Replaced edit-exercise

5. Click ← back
   Goes to: home ✓
```

### Without Replace (BROKEN):

```
History stack after save:
[home, workout, edit-exercise, workout]
       └─ back  └─ back  └─ back   └─ current

Back clicks:
workout → edit-exercise ❌
```

### With Replace (FIXED):

```
History stack after save:
[home, workout]
       └─ back  └─ current

Back clicks:
workout → home ✓
```

## Comparison:

| Method | Behavior | When to Use |
|--------|----------|-------------|
| `navigate()` | Adds to history | Normal navigation |
| `replace()` | Replaces current | Redirects, returns |
| `back()` | Pops from history | Back button |

## Use Cases:

**Use `navigate()`:**
- Normal screen-to-screen navigation
- User clicking buttons to go somewhere new
- Want back button to return

**Use `replace()`:**
- Returning to previous screen after action
- Redirects (login → home)
- Don't want intermediate screen in history

**Use `back()`:**
- Back arrow button
- Cancel actions
- Pop from history stack

## Testing:

```
1. Start workout
2. Click ✏️ on any exercise
3. Change something
4. Click SAVE
5. Should return to workout ✓
6. Click ← back button
7. Should go to home (NOT back to edit) ✓
```

## Summary:

**Problem:** navigate() added duplicate entries to history  
**Fix:** Use replace() to replace current view instead  
**Result:** Back button works correctly ✓

**Navigation is now clean and predictable!** 🎯
