# Edit Button Fix - Route Name Correction

## The Problem:

Clicking the ✏️ edit button during workout was returning to home screen instead of opening the edit form.

## Root Cause:

**Wrong route name used:**
```javascript
// WRONG:
router.navigate('edit-exercise', { id: exercise.id, returnToWorkout: true });

// The actual route in app.js is:
case 'add-edit-exercise':  // ← Different name!
```

## The Fix:

**Changed to correct route name:**
```javascript
// CORRECT:
router.navigate('add-edit-exercise', { id: exercise.id, returnToWorkout: true });
```

## Testing:

```
1. Start a workout
2. Click ✏️ on any exercise
3. Should open edit form ✓
4. Make changes
5. Click SAVE
6. Should return to workout ✓
7. Changes should be visible ✓
```

**Fixed!** The edit button now works correctly. ✅
