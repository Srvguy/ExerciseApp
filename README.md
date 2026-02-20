# FitTrack - Progressive Web App Exercise Tracker

A comprehensive exercise tracking PWA built with vanilla JavaScript, IndexedDB, and modern web standards. Works offline on both Android and iOS devices.

## Features

### Core Functionality
- **Smart Exercise Rotation**: Intelligent algorithm ensures exercises rotate fairly based on usage
- **Custom Workouts**: Select specific exercises for targeted training
- **Category-Based Organization**: Organize exercises by muscle groups or workout types
- **Progress Tracking**: Monitor personal records and exercise history
- **Timer Support**: Built-in timers for exercises like planks and holds
- **Weight Progression**: Automatic suggestions when ready to increase weight
- **Workout History**: Complete log of all past workouts
- **Backup & Restore**: Export/import your data in JSON format

### Technical Features
- **Progressive Web App**: Install on home screen, works offline
- **IndexedDB Storage**: All data stored locally in the browser
- **Responsive Design**: Adapts to all screen sizes
- **Dark Theme**: Athletic, high-contrast interface
- **No Dependencies**: Pure vanilla JavaScript, no frameworks
- **Cross-Platform**: Works on Android, iOS, and desktop browsers

## Installation

### Option 1: Host on a Web Server
1. Upload all files to your web server
2. Access via HTTPS (required for PWA features)
3. Browser will prompt to "Add to Home Screen"

### Option 2: Local Development
1. Install a local web server (e.g., `python -m http.server`)
2. Navigate to the project directory
3. Run the server
4. Access via `localhost` in your browser

## File Structure

```
fittrack/
├── index.html              # Main HTML file
├── styles.css              # Athletic dark theme styles
├── db.js                   # IndexedDB database management
├── utils.js                # Utility functions
├── components.js           # Reusable UI components
├── views.js                # Screen implementations (part 1)
├── views-part2.js          # Screen implementations (part 2)
├── app.js                  # Router and app initialization
├── sw.js                   # Service worker for offline support
├── manifest.json           # PWA manifest
├── icon-192.png            # App icon (192x192)
├── icon-512.png            # App icon (512x512)
└── README.md               # This file
```

## Usage Guide

### First Time Setup
1. Open the app
2. Navigate to "SETUP" → "Categories"
3. Create categories (e.g., "Upper Body", "Lower Body", "Core")
4. Set rotation frequency and exercises per workout for each category

### Adding Exercises
1. Go to "MANAGE EXERCISES"
2. Click the "+" button
3. Fill in exercise details:
   - Name (required)
   - Sets, reps, weight (optional)
   - Timer for timed exercises
   - Notes
   - Assign to categories
   - Add an image (optional)

### Starting a Workout

#### Category Workout:
1. From home screen, click a category button
2. App loads exercises using smart rotation
3. Complete exercises by checking them off
4. Adjust weights with +/- buttons
5. Use timers for timed exercises
6. Add notes for specific exercises
7. Click "COMPLETE WORKOUT"

#### Custom Workout:
1. Click "CUSTOM WORKOUT"
2. Search and select exercises
3. Use "SELECT ALL" or "CLEAR ALL" as needed
4. Click "START WORKOUT"
5. Complete workout as normal

### Viewing Progress
1. Go to "MANAGE EXERCISES"
2. Click 📊 button next to any exercise
3. View total sessions, personal records, and history

### Backup & Restore
1. Go to "SETUP" → "BACKUP & RESTORE"
2. Export: Creates JSON file with all data
3. Import: Restores data from backup file
4. **Warning**: Import replaces all current data

## Smart Rotation Algorithm

The app uses an intelligent rotation system to ensure fair distribution of exercises:

1. **Priority Queue**: Exercises are sorted by:
   - `workoutsSinceLastUse` (descending) - exercises not used recently get priority
   - `lastUsedDate` (ascending) - within same usage count, older exercises come first

2. **Overdue Selection**: First, exercises that meet or exceed the rotation frequency are selected

3. **Fill Remaining**: If more exercises are needed, the oldest exercises are added

4. **Shuffle**: Final selection is shuffled for variety within the workout

5. **Counter Updates**:
   - Used exercises: `workoutsSinceLastUse = 0`, `lastUsedDate = current time`
   - Unused exercises in category: `workoutsSinceLastUse++`

## Progression System

The app automatically detects when you're ready to progress:

- Tracks consecutive successful completions at the same weight
- After 3+ consecutive completions, suggests adding 5 lbs
- Automatically adjusts displayed weight to suggestion
- Manual adjustments override suggestions
- Adjusted weights are saved when workout completes

## Browser Compatibility

### Recommended Browsers:
- **Chrome/Edge**: Full support, best performance
- **Safari (iOS)**: Full support with PWA capabilities
- **Firefox**: Full support
- **Samsung Internet**: Full support

### Requirements:
- IndexedDB support
- Service Worker support (for offline mode)
- Modern ES6+ JavaScript support

## Data Storage

All data is stored locally in your browser using IndexedDB:

- **Exercises**: Name, sets, reps, weight, notes, timer, image, usage stats
- **Categories**: Name, color, rotation settings
- **Workout Sessions**: Date, duration, completion stats
- **Exercise History**: Date, weight, sets, reps, notes, PRs
- **Relationships**: Exercise-category mappings

**Privacy Note**: No data is sent to any server. Everything stays on your device.

## Customization

### Color Scheme
Edit `styles.css` CSS variables in `:root`:
```css
--color-accent-primary: #00ff88;   /* Main accent color */
--color-bg-primary: #0f0f1e;       /* Background color */
/* etc. */
```

### Fonts
Default fonts are Google Fonts (Archivo Black + Work Sans). To change:
1. Update the `<link>` tag in `index.html`
2. Update CSS variables in `styles.css`

### Sample Data
Sample data is initialized on first use. To disable:
- Edit `db.js` → `initializeSampleData()` method
- Comment out or modify sample exercises and categories

## Troubleshooting

### App won't install
- Ensure you're accessing via HTTPS (or localhost)
- Check browser console for errors
- Try clearing browser cache

### Data not saving
- Check if IndexedDB is enabled in browser
- Ensure sufficient storage space
- Check browser privacy settings

### Offline mode not working
- Service worker requires HTTPS
- Check if service worker registered (browser dev tools)
- Try clearing cache and reloading

### Workout exercises not rotating
- Verify rotation frequency in category settings
- Check that exercises are assigned to category
- Complete more workouts to see rotation effect

## Development

To modify or extend the app:

1. **Add new views**: Edit `views.js` or `views-part2.js`
2. **Add database tables**: Edit `db.js` → `init()` method
3. **Add UI components**: Edit `components.js`
4. **Modify styling**: Edit `styles.css`
5. **Add utilities**: Edit `utils.js`

## License

This project is open source and available for personal and commercial use.

## Credits

Built with:
- Vanilla JavaScript (ES6+)
- IndexedDB for storage
- Service Workers for offline support
- Google Fonts (Archivo Black, Work Sans)

## Support

For issues, questions, or feature requests, please refer to the documentation or create an issue in the project repository.

## Version

Version 1.0.0 - February 2026

---

**Stay Fit, Track Smart! 💪**
