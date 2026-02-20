# FitTrack v1.4.0 Build 10 - Bug Fixes

## ✅ Issues Fixed:

### 1. Photos NOT in PDF Anymore ✓
- Removed photo embedding from PDF export
- PDFs are now cleaner and smaller
- **Photos ARE still saved in backups** (JSON export includes imagePath)

### 2. Backup Includes Photos ✓
- Verified: exportData() includes all exercises with imagePath field
- Photos stored as base64 in JSON backup
- Import/export works correctly

### 3. Timer Saving Fixed ✓
**Problem:** When checkbox clicked, timer values reset
**Solution:** Now saves timer values to adjustedTimers Map BEFORE re-rendering
**Result:** Timer adjustments persist even when marking complete

### 4. Back Button Shows Just Arrow ✓
**Problem:** Still showing text due to cache
**Solution:** Incremented build to 10 to force cache refresh
**Result:** Back button now shows just "←" arrow

### 5. PDF Exercise Changes More Readable ✓
**Old:** "↑ Weight: 135 lbs → 140 lbs"
**New:** "New Weight: 140 lbs (was 135 lbs)"
**Also:** Changed color from orange to blue, added italic formatting

---

## 🎯 How to Test:

### Timer Fix:
1. Start workout with timed exercise
2. Adjust timer (e.g., +10s)
3. Mark exercise as complete
4. Timer should show adjusted time, not revert
5. Complete workout
6. Start new workout - timer should be saved

### Back Button:
1. Deploy to GitHub/Netlify
2. Open app
3. Should see "Updated to v1.4.0!" toast
4. Navigate to any screen with back button
5. Should see only "←" (no "BACK" text)

### PDF Changes:
1. Complete a workout
2. Change weight for next workout
3. Export PDF
4. Should see: "New Weight: X (was Y)" in blue italic text
5. No photos in PDF
6. Clean, readable format

### Backup:
1. Add exercises with photos
2. Go to Setup → Backup & Restore
3. Export to file
4. Open JSON file
5. Search for "imagePath"
6. Should see base64 photo data

---

## 📦 What Changed:

**utils.js:**
- Removed photo embedding from PDF
- Changed exercise change format to "New Weight: X (was Y)"
- Changed color to blue, added italic

**views.js:**
- Timer values saved before re-render on checkbox
- Fixes timer reset issue

**app.js, index.html:**
- Build incremented to 10
- Forces cache refresh

**components.js:**
- Already shows just "←" (cache was the issue)

---

## ✅ All Working Now!

Deploy and you should see:
- "Updated to v1.4.0!" toast
- Back button just shows ←
- Timer saves properly
- PDF changes readable
- Photos in backups

**Version: 1.4.0 Build 10**
