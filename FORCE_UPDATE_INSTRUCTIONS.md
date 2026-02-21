# Force Update Instructions - v1.4.0 Build 11

## 🔄 How to Force App Update on Your Phone

The app now has **triple-layer cache clearing**, but if you still see old version:

### Method 1: Hard Reload (Best)
**On Mobile Browser:**
1. Open the app
2. Pull down to refresh
3. Keep holding and pull harder
4. Release - should reload everything

**On Desktop:**
- Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5`

### Method 2: Clear Browser Data
**Android Chrome:**
1. Menu (⋮) → Settings
2. Privacy and Security
3. Clear Browsing Data
4. Select "Cached images and files"
5. Time range: "Last hour"
6. Clear data
7. Reopen app

**iOS Safari:**
1. Settings → Safari
2. Advanced → Website Data
3. Remove All Website Data (or just FitTrack)
4. Reopen app

### Method 3: Reinstall PWA
**If installed as app on home screen:**
1. Long-press app icon
2. Remove/Delete app
3. Open browser
4. Go to your app URL
5. Add to Home Screen again
6. Fresh install with new version

### Method 4: Developer Tools (Desktop)
1. Open app
2. Press F12
3. Go to Network tab
4. Check "Disable cache"
5. Keep DevTools open
6. Reload page
7. Should see v1.4.0 Build 11

---

## ✅ How to Verify Update Worked

After clearing cache, you should see:

1. **Loading screen** shows: "v1.4.0 Build 11"
2. **Toast notification**: "Updated to v1.4.0 Build 11!"
3. **Home screen footer**: "v1.4.0 • Build 11"
4. **Console** (F12): "FitTrack v1.4.0 Build 11"
5. **Back buttons**: Just show "←" (no text)

---

## 🔍 What the App Does Automatically

The app now has THREE layers of cache clearing:

### Layer 1: Version Check
- Compares localStorage version with APP_VERSION
- Runs on every app load

### Layer 2: Cache API Clear
- Deletes all cache storage
- Removes cached files

### Layer 3: Service Worker Unregister
- Unregisters old service workers
- Forces fresh registration

**All of this happens automatically when Build number changes!**

---

## 🐛 If Still Not Updating

### Check Console:
1. Open app
2. Press F12
3. Look for:
```
Current: v1.4.0 Build 11
Stored: v1.4.0 Build 10
Update detected! Forcing cache refresh...
```

If you see this, it's working but browser cache is stubborn.

### Nuclear Option:
1. Copy your data URL: `[your-app-url]?nocache=[random-number]`
2. Example: `https://myapp.netlify.app/?nocache=12345`
3. Bookmark this new URL
4. Use it to access app
5. Bypasses all caching

### For Netlify Users:
Netlify might be caching. In Netlify dashboard:
1. Go to Deploys
2. Click "Trigger deploy"
3. "Clear cache and deploy"

---

## 📝 Manual Check

Open browser console and type:
```javascript
localStorage.getItem('app_version')
localStorage.getItem('app_build')
```

Should show:
```
"1.4.0"
"11"
```

If it shows old build, clear localStorage:
```javascript
localStorage.clear()
location.reload()
```

---

## 🎯 Expected Behavior After Update

Once successfully updated:

1. ✅ Back button shows just "←"
2. ✅ Timer adjustments save properly
3. ✅ PDF shows "New Weight: X (was Y)"
4. ✅ No photos in PDF
5. ✅ Deload system working
6. ✅ All features from v1.4.0

---

## 💡 Why Cache is Stubborn

PWAs are designed to work offline, so browsers cache aggressively:
- Service Workers cache everything
- Browser HTTP cache
- Netlify CDN cache
- Mobile OS cache

The new code clears all of these, but sometimes manual help needed.

---

## 🚀 For Future Updates

From now on, just increment APP_BUILD in app.js:
```javascript
const APP_BUILD = 12;  // Increment this
```

The app will auto-clear caches and show update toast!

**Current Version: 1.4.0 Build 11**
