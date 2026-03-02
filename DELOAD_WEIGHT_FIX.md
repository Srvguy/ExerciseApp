# Deload Week Weight Fix - CRITICAL

## The Problem:

**Deload weights were being permanently saved to exercises!**

### What Was Happening:

```
Regular weight: 100 lbs
Deload week (50%): Shows 50 lbs ← Correct display
Complete workout
Exercise saved with: 50 lbs ← WRONG!
Next week (normal): Shows 50 lbs ← BUG!
```

**Result:** After deload week, exercise weight dropped permanently!

---

## Root Cause:

### Line 1043 in views.js (OLD):
```javascript
if (completed) {
    exercise.weight = finalWeight; // Saved deloaded weight!
    await db.updateExercise(exercise);
}
```

**Problem:** `finalWeight` contains the deloaded weight during deload week

---

## The Fix:

### Two Changes Made:

#### 1. **Save Original Weight During Deload Week:**

```javascript
if (completed) {
    exercise.lastUsedDate = Date.now();
    exercise.workoutsSinceLastUse = 0;
    
    // CRITICAL: During deload week, save original weight
    if (isDeload && exercise.originalWeight) {
        // Deload week: save the original weight
        exercise.weight = exercise.originalWeight;
    } else {
        // Normal week: save the adjusted weight
        exercise.weight = finalWeight;
    }
    
    exercise.timerSeconds = finalTimer;
    exercise.restTimerSeconds = finalRestTimer;
    await db.updateExercise(exercise);
}
```

**How it works:**
- `applyDeload()` stores `originalWeight` field
- Check if deload week AND originalWeight exists
- Save `originalWeight` instead of `finalWeight`
- Normal weeks work as before

#### 2. **Disable Progression During Deload Week:**

```javascript
// Don't calculate progression during deload week
const suggestion = !isDeload ? calculateProgression(...) : null;

// Show progression progress (but not during deload week)
if (!isDeload && ((exercise.weight && !isTimedExercise) || isTimedExercise)) {
    // Show progress counter
}

if (suggestion && !isDeload) {
    // Show progression suggestion
}
```

**Why:** Don't want to suggest increasing from deloaded weight!

---

## How It Works Now:

### Deload Week Flow:

**Step 1: applyDeload() is called**
```javascript
// utils.js
async function applyDeload(exercises, percentage = 50) {
    return exercises.map(ex => {
        const deloaded = { ...ex };
        deloaded.weight = `${reducedWeight}${unit}`;
        deloaded.originalWeight = ex.weight; // ← Stores original!
        return deloaded;
    });
}
```

**Step 2: Workout displays deloaded weight**
```
Bench Press
3 sets × 10 reps
50 lbs ← Shows deloaded weight
```

**Step 3: Complete workout**
```javascript
if (isDeload && exercise.originalWeight) {
    exercise.weight = exercise.originalWeight; // ← Saves 100 lbs!
}
```

**Step 4: Next week (normal)**
```
Bench Press
3 sets × 10 reps
100 lbs ← Back to original! ✓
```

---

## Before vs After:

### BEFORE (BROKEN):

```
Week 1 (Normal):
- Exercise weight: 100 lbs
- Displayed: 100 lbs
- Complete workout
- Saved: 100 lbs ✓

Week 2 (Deload 50%):
- Exercise weight: 100 lbs
- Displayed: 50 lbs
- Complete workout
- Saved: 50 lbs ← BUG!

Week 3 (Normal):
- Exercise weight: 50 lbs ← WRONG!
- Displayed: 50 lbs
- Lost 50% of progress!
```

### AFTER (FIXED):

```
Week 1 (Normal):
- Exercise weight: 100 lbs
- Displayed: 100 lbs
- Complete workout
- Saved: 100 lbs ✓

Week 2 (Deload 50%):
- Exercise weight: 100 lbs
- Displayed: 50 lbs
- Complete workout
- Saved: 100 lbs ✓ (original preserved!)

Week 3 (Normal):
- Exercise weight: 100 lbs ✓
- Displayed: 100 lbs
- Progress maintained!
```

---

## Progression During Deload:

### BEFORE:
```
Deload Week:
- Displayed weight: 50 lbs
- Progress counter: "3/3 completions - Ready to progress!"
- Suggestion: "Try 55 lbs" ← Based on deloaded weight!
```

### AFTER:
```
Deload Week:
- Displayed weight: 50 lbs
- Progress counter: HIDDEN
- Suggestion: HIDDEN
- Focus on recovery, not progression!
```

---

## What's Saved to History:

### Workout Records (show actual performed):
```javascript
await db.addWorkoutExerciseRecord({
    weight: finalWeight,  // ← Deloaded weight (50 lbs)
    completed: true
});
```

**Correct:** History shows what you actually lifted

### Exercise History (show actual performed):
```javascript
await db.addExerciseHistory({
    weight: finalWeight,  // ← Deloaded weight (50 lbs)
    completed: true
});
```

**Correct:** History shows what you actually lifted

### Exercise Object (for next workout):
```javascript
if (isDeload && exercise.originalWeight) {
    exercise.weight = exercise.originalWeight; // ← Original weight (100 lbs)
}
```

**Correct:** Next workout uses original weight

---

## The Key Insight:

**Deload weight is TEMPORARY, not PERMANENT**

- **History:** Record what you actually did (50 lbs)
- **Exercise:** Keep original weight for next time (100 lbs)
- **Progression:** Disabled during deload (prevents confusion)

---

## Testing:

### Test Scenario 1: Basic Deload
```
1. Set exercise to 100 lbs
2. Set deload to 50%, frequency to 0 (manual deload)
3. Go to home → See deload banner
4. Start workout → See 50 lbs displayed
5. Complete exercise
6. Finish workout
7. Edit exercise → Should still show 100 lbs ✓
8. Disable deload (set frequency to blank)
9. Start new workout → Should show 100 lbs ✓
```

### Test Scenario 2: Progression Block
```
1. Exercise at 100 lbs with 3/3 completions (ready to progress)
2. Enable deload week
3. Start workout
4. Should NOT see progression suggestion ✓
5. Should NOT see progress counter ✓
6. Complete workout at 50 lbs
7. Next week (normal)
8. Exercise should be 100 lbs ✓
9. Progression counter should show again ✓
```

### Test Scenario 3: History Accuracy
```
1. Do normal workout at 100 lbs
2. Check history → Shows 100 lbs ✓
3. Do deload workout at 50 lbs
4. Check history → Shows 50 lbs ✓
5. Do normal workout at 100 lbs
6. Check history → Shows 100 lbs ✓
7. All three workouts recorded correctly ✓
```

---

## Summary:

**Critical bug fixed:**
- ❌ Deload weights were being saved permanently
- ✅ Now saves original weight during deload
- ✅ Next workout uses correct weight
- ✅ Progression disabled during deload
- ✅ History shows actual weights lifted

**Deload week now works correctly as a temporary reduction!** 🔧✅
