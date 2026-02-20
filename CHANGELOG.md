# FitTrack Changelog

## Version 1.1.0 - New Features Added

### 🎯 Three Major Improvements

---

### 1. ⚙️ Customizable Progression Threshold Per Exercise

**What it does:**
- Each exercise can now have its own progression threshold
- Set how many consecutive successful completions are needed before weight increase is suggested
- Default is 3, but you can customize it to any number (1-20+)

**Where to set it:**
- When adding a new exercise: "Progression Threshold" field
- When editing an existing exercise: Update the "Progression Threshold" field
- Default value: 3 completions

**How it works:**
- Complete an exercise with the same weight multiple times
- After reaching your set threshold, the app suggests increasing weight by 5 lbs
- Example: If threshold is 4, you need 4 consecutive completions before progression

**Benefits:**
- Different exercises progress at different rates
- Bodyweight exercises can have higher thresholds (5-6)
- Heavy lifts can have lower thresholds (2-3)
- Fully customizable to your training style

---

### 2. ⏱️ Rest Timer Between Exercise Sets

**What it does:**
- Automatic countdown timer for rest periods between sets
- Separate from the main exercise timer
- Plays sound and vibrates when rest is complete

**Where to set it:**
- When adding/editing an exercise: "Rest Timer (seconds)" field
- Example: Set to 30 for 30-second rest between plank sets
- Optional: Leave at 0 for no rest timer

**How it works:**
1. Complete your exercise timer (e.g., 60-second plank)
2. Timer automatically switches to REST TIMER
3. Counts down your rest period (e.g., 30 seconds)
4. Plays different sound/vibration when rest is done
5. Resets to exercise timer for next set

**Visual feedback:**
- Exercise timer: Red/orange colors, "EXERCISE TIMER" label
- Rest timer: Blue/cyan colors, "REST TIMER" label
- Clear visual distinction between work and rest

**During workout:**
- Timer automatically cycles: Exercise → Rest → Exercise → Rest
- Can adjust rest time with +5s / -5s buttons during workout
- Can skip rest by hitting RESET button

**Benefits:**
- No need to watch the clock between sets
- Consistent rest periods improve training quality
- Perfect for timed exercises like planks, wall sits, etc.

---

### 3. 📊 Progression Progress Display on Workout Screen

**What it shows:**
- Current number of consecutive completions at your current weight
- Your custom progression threshold for that exercise
- Visual indication when you're ready to progress

**Where you see it:**
- On the workout screen, below each exercise name
- Shows for all exercises with weight tracking

**Display format:**
```
Progress: 2/3 completions at current weight
```

Or when ready to progress:
```
🔥 3/3 completions - Ready to progress!
💡 Ready to progress! Try 140 lbs
```

**How it updates:**
- Automatically calculates from your exercise history
- Shows real-time progress toward next weight increase
- Counts consecutive completions at same weight
- Resets if you change weight or miss a completion

**Benefits:**
- See your progress at a glance
- Know exactly how many more completions until progression
- Motivating to see progress build up
- No guessing when to increase weight

---

## 💾 Database Changes

The following fields have been added to exercises:

1. **progressionThreshold** (integer, default: 3)
   - How many consecutive completions before suggesting progression
   - Customizable per exercise

2. **restTimerSeconds** (integer, default: 0)
   - Rest period between sets in seconds
   - 0 = no rest timer

**Existing exercises:**
- Will default to threshold of 3
- Will default to no rest timer (0 seconds)
- You can edit them to add these features

**New exercises:**
- Can set custom values when creating
- Sample exercises have been updated with examples

---

## 🎨 UI Improvements

### Timer Display Changes:
- Added status label: "EXERCISE TIMER" / "REST TIMER"
- Different colors for exercise (red/orange) vs rest (blue/cyan)
- Clearer button labels: "+5s" / "-5s" instead of just "+" / "-"
- More prominent display

### Progression Display:
- New progress counter on workout screen
- Shows X/Y format (current/threshold)
- Changes color when ready to progress
- Includes fire emoji (🔥) for motivation

### Add/Edit Exercise Screen:
- New "Rest Timer (seconds)" field with description
- New "Progression Threshold" field with description
- Helpful descriptions explain what each field does

---

## 📖 Usage Examples

### Example 1: Plank with Rest Timer
```
Exercise: Plank
Timer: 60 seconds
Rest Timer: 30 seconds
Progression Threshold: 3

During workout:
1. Start timer → counts down from 60 seconds
2. Complete plank → sound/vibration
3. Rest timer starts → counts down from 30 seconds
4. Rest complete → sound/vibration
5. Ready for next set
```

### Example 2: Progressive Bodyweight Exercise
```
Exercise: Pull-ups
Sets: 3
Reps: 8
Weight: bodyweight
Progression Threshold: 5

Workout history:
- Jan 1: Completed ✓
- Jan 3: Completed ✓
- Jan 5: Completed ✓
- Jan 7: Completed ✓
- Jan 9: Shows "Progress: 4/5 completions"
- Jan 11: Shows "🔥 5/5 completions - Ready to progress!"
         "💡 Ready to progress! Try add weight"
```

### Example 3: Heavy Lift with Low Threshold
```
Exercise: Deadlifts
Weight: 225 lbs
Progression Threshold: 2

After 2 successful completions:
"🔥 2/2 completions - Ready to progress!"
"💡 Ready to progress! Try 230 lbs"
```

---

## 🔄 Updating From Previous Version

If you were using the app before this update:

1. **Clear your browser cache** (Ctrl+Shift+Delete)
2. **Hard reload** the page (Ctrl+F5 or Cmd+Shift+R)
3. Your existing data is preserved
4. Existing exercises will have default values:
   - Progression threshold: 3
   - Rest timer: 0 (disabled)
5. Edit exercises to customize these values

---

## 🎯 Version Summary

**Version:** 1.1.0  
**Release Date:** February 2026  
**Files Updated:**
- ✓ db.js - Added new fields to schema
- ✓ utils.js - Updated progression calculation
- ✓ components.js - Enhanced timer component
- ✓ views.js - Updated workout and exercise screens
- ✓ index.html - Updated version numbers (v3)

**Backward Compatible:** Yes  
**Breaking Changes:** None  
**Data Migration:** Automatic (default values applied)

---

## 🚀 Getting Started with New Features

### Quick Start:

1. **Add Rest Timer to Existing Exercise:**
   - Go to "Manage Exercises"
   - Click ✏️ edit on any timed exercise
   - Set "Rest Timer (seconds)" to desired value
   - Save

2. **Customize Progression Threshold:**
   - Go to "Manage Exercises"
   - Click ✏️ edit on any exercise
   - Change "Progression Threshold" to desired number
   - Save

3. **See Progress During Workout:**
   - Start any workout
   - Look below exercise names
   - See "Progress: X/Y completions"

---

## 📝 Notes

- All three features work independently
- You can use rest timer without progression tracking
- You can customize progression without rest timer
- Fully backward compatible with existing data
- Sample exercises updated to demonstrate features

---

**Enjoy your enhanced workout tracking! 💪**
