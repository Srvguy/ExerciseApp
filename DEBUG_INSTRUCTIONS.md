# Debugging Instructions - Workout State Issue

I've added extensive logging to track what's happening. Here's how to debug:

## Step 1: Open Browser Console

Press **F12** to open Developer Tools, then click the **Console** tab.

## Step 2: Start a Workout

1. Start any workout
2. You should see in console:
```
=== EXERCISES LOADED ===
Exercise IDs: [{id: 1, name: "Bench Press"}, {id: 2, name: "Squats"}, ...]
=== END EXERCISES LOADED ===

=== WORKOUT LOADING ===
sessionStorage content: null
No saved state found in sessionStorage
=== END WORKOUT LOADING ===
```

## Step 3: Complete Some Exercises

1. Check off exercise 1
2. Check off exercise 2
3. You should see in console:
```
Exercise 1 (Bench Press): completedSet.has = false, completedSet = []
Exercise 2 (Squats): completedSet.has = false, completedSet = []
...

(after checking them off, it re-renders)

Exercise 1 (Bench Press): completedSet.has = true, completedSet = [1, 2]
Exercise 2 (Squats): completedSet.has = true, completedSet = [1, 2]
```

## Step 4: Click Edit Button

1. Click ✏️ on exercise 3
2. You should see in console:
```
Saving workout state: {
  categoryId: 1,
  customExerciseIds: null,
  categoryName: "Upper Body",
  exercises: [1, 2, 3, 4, 5],
  completedIds: [1, 2],  ← Should have your completed exercises!
  adjustedWeights: {},
  workoutNotes: {},
  isDeload: false
}
```

## Step 5: Save the Edit

1. Make any change
2. Click SAVE
3. You should see in console:
```
=== WORKOUT LOADING ===
sessionStorage content: {"categoryId":1,"customExerciseIds":null,...,"completedIds":[1,2],...}
Parsed state: {categoryId: 1, ..., completedIds: [1, 2], ...}
completedIds from state: [1, 2]
Attempting to restore completed exercises: [1, 2]
Adding to completedSet: 1 type: number
Adding to completedSet: 2 type: number
completedSet after restore: [1, 2]
=== END WORKOUT LOADING ===

=== EXERCISES LOADED ===
Exercise IDs: [{id: 1, name: "Bench Press"}, {id: 2, name: "Squats"}, ...]
=== END EXERCISES LOADED ===

Exercise 1 (Bench Press): completedSet.has = true, completedSet = [1, 2]
Exercise 2 (Squats): completedSet.has = true, completedSet = [1, 2]
```

## What to Look For:

**If you see this:**
```
sessionStorage content: null
```
→ The state isn't being saved properly OR isn't surviving navigation

**If you see this:**
```
completedIds from state: []
```
→ The state is being saved but completedIds is empty

**If you see this:**
```
completedSet after restore: [1, 2]
```
But then:
```
Exercise 1: completedSet.has = false
```
→ There's an ID type mismatch (string vs number)

## Please Send Me:

1. The **entire console output** from steps 2-5
2. Specifically these lines:
   - "Saving workout state:"
   - "completedIds from state:"
   - "completedSet after restore:"
   - "Exercise X: completedSet.has = ..."

This will tell me exactly where the problem is!
