# Deload Week Banner on Home Screen

## What Was Added:

A prominent, animated notification banner on the home screen when it's a deload week.

---

## Visual Design:

```
┌──────────────────────────────────────┐
│              🔄                       │
│         DELOAD WEEK                   │
│ All weights will be reduced by 50%   │
│          for recovery                 │
└──────────────────────────────────────┘
         (pulsing animation)
```

### Styling:
- **Large icon:** 🔄 (40px)
- **Title:** "DELOAD WEEK" in orange/warning color (24px, bold)
- **Description:** "All weights will be reduced by 50% for recovery" (15px)
- **Background:** Orange gradient with transparency
- **Border:** 3px solid orange
- **Animation:** Gentle pulse (scale 1.0 to 1.02 every 2 seconds)

---

## When It Shows:

The banner appears on the home screen when:

1. **Manual deload (0):** User set deload to 0 in Setup
2. **Scheduled deload:** X weeks have passed since last deload

The banner appears BEFORE you select a category, so you know what to expect.

---

## User Flow:

### Without Banner (Normal Week):
```
Home Screen
├─ CUSTOM WORKOUT
├─ Upper Body
├─ Lower Body
└─ Core
```

### With Banner (Deload Week):
```
Home Screen
┌────────────────────────────┐
│       🔄 DELOAD WEEK       │  ← New banner!
│  Weights reduced by 50%    │
└────────────────────────────┘
├─ CUSTOM WORKOUT
├─ Upper Body
├─ Lower Body
└─ Core
```

User sees the warning BEFORE starting workout.

---

## Deload Indicators Throughout App:

Now deload is visible in THREE places:

### 1. Home Screen Banner (NEW!)
- Shows before selecting category
- Bright, animated, impossible to miss
- Sets expectation for the workout

### 2. Workout Screen Banner
- Shows during workout
- Orange banner at top
- Confirms weights are reduced

### 3. History Badge
- After completing deload workout
- Shows "DELOAD" badge in workout history
- Tracks which workouts were deload weeks

---

## Animation Details:

**Pulse animation:**
```css
@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.02);  /* Subtle grow */
        opacity: 0.95;            /* Slight fade */
    }
}
```

**Timing:** 2 seconds per cycle  
**Effect:** Gentle, attention-grabbing, not annoying  
**Purpose:** Draws eye to important recovery week

---

## When Deload Happens:

### Manual Deload (Set to 0):
1. Go to Setup → Deload Schedule
2. Set to 0
3. Save
4. Return to home
5. **Banner appears!** 🔄
6. Next workout is deload
7. After workout, change back to regular schedule

### Automatic Deload (Set to 1-12):
1. Set to 4 (deload every 4 weeks)
2. App tracks time automatically
3. After 4 weeks pass
4. **Banner appears on home screen!** 🔄
5. Deload week happens
6. Counter resets
7. 4 more weeks until next deload

---

## Color Scheme:

**Warning colors** to indicate something different:
- Orange background gradient
- Orange border
- Orange text for title
- Gray text for description

**Not alarming**, just informative - "Hey, this week is different!"

---

## Responsive Design:

The banner:
- ✅ Works on mobile (fits screen width)
- ✅ Works on desktop (centered, readable)
- ✅ Stands out without blocking navigation
- ✅ Clear typography at all sizes

---

## User Benefits:

### Before (No Home Banner):
- User clicks category
- Sees deload banner in workout screen
- "Wait, what? I didn't know!"
- Already committed to workout

### After (With Home Banner):
- User opens app
- **Immediately sees deload notification**
- "Ah, it's deload week, got it"
- Sets mental expectation
- Clicks category knowing what to expect

**Better UX:** Know before you commit!

---

## Technical Implementation:

### Home Screen Check:
```javascript
const isDeload = await shouldDeload();
if (isDeload) {
    // Show banner
}
```

**Order of elements:**
1. Header ("FITTRACK")
2. Content container starts
3. **Deload banner (if applicable)**
4. Custom Workout button
5. Category buttons
6. Utility buttons

Banner is FIRST thing user sees after header.

---

## Combined with Other Features:

This works seamlessly with:
- ✅ Manual deload (set to 0)
- ✅ Automatic deload (set to 1-12)
- ✅ Random category selection
- ✅ Manual exercise selection
- ✅ Custom workouts

No matter which workout type you choose, if it's deload week, you'll know!

---

## Summary:

**Before:** Deload only shown in workout screen (too late!)  
**Now:** Deload shown on home screen (perfect timing!)

**Visual:** Animated orange banner with 🔄 icon  
**Message:** Clear - "DELOAD WEEK - Weights reduced by 50%"  
**Benefit:** User knows before starting workout

**No surprises, better recovery planning!** 🔄💪
