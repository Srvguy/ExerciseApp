// Main App Router and Initialization

const router = {
    currentView: null,
    history: [],
    
    navigate(view, params = {}) {
        this.history.push({ view: this.currentView, params: this.currentParams });
        this.currentView = view;
        this.currentParams = params;
        this.render();
    },
    
    back() {
        // Stop any running timers before navigating
        if (this.currentView === 'workout' && window.activeTimers) {
            window.activeTimers.forEach(timer => timer.stop());
            window.activeTimers = null;
        }
        
        if (this.history.length > 0) {
            const previous = this.history.pop();
            this.currentView = previous.view || 'home';
            this.currentParams = previous.params || {};
            this.render();
        } else {
            this.navigate('home');
        }
    },
    
    async render() {
        const view = this.currentView;
        const params = this.currentParams || {};
        
        console.log(`Rendering view: ${view}`, params);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        try {
            // Render appropriate view
            switch(view) {
                case 'home':
                    await Views.renderHome();
                    break;
                case 'custom-workout':
                    await Views.renderCustomWorkout();
                    break;
                case 'workout':
                    await Views.renderWorkout(params);
                    break;
                case 'manage-exercises':
                    await Views.renderManageExercises();
                    break;
                case 'add-edit-exercise':
                    await Views.renderAddEditExercise(params);
                    break;
                case 'setup':
                    await Views.renderSetup();
                    break;
                case 'add-edit-category':
                    await Views.renderAddEditCategory(params);
                    break;
                case 'history':
                    await Views.renderHistory();
                    break;
                case 'exercise-progress':
                    await Views.renderExerciseProgress(params);
                    break;
                case 'import-export':
                    await Views.renderImportExport();
                    break;
                default:
                    console.log('Unknown view, rendering home');
                    await Views.renderHome();
            }
            console.log(`Successfully rendered: ${view}`);
        } catch (error) {
            console.error(`Error rendering view ${view}:`, error);
            document.getElementById('app').innerHTML = `
                <div style="padding: 32px; text-align: center; color: #ff3366;">
                    <h2 style="color: #ff3366; font-family: Arial, sans-serif;">Error Loading Screen</h2>
                    <p style="color: #b8b8d1; margin: 20px 0;">Failed to render ${view}</p>
                    <pre style="color: #7878a3; text-align: left; overflow: auto; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 12px; max-width: 600px; margin: 20px auto;">${error.stack}</pre>
                    <button onclick="router.navigate('home')" style="margin-top: 20px; padding: 12px 24px; background: #00ff88; color: #0f0f1e; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">Go Home</button>
                </div>
            `;
        }
    }
};

// App version
const APP_VERSION = '1.4.0';
const APP_BUILD = 18;

// Check for updates from server
// App Initialization
async function initApp() {
    try {
        console.log(`FitTrack v${APP_VERSION} Build ${APP_BUILD}`);
        
        // Clean up URL if we just updated
        const url = new URL(window.location);
        if (url.searchParams.has('cachebust')) {
            url.searchParams.delete('cachebust');
            window.history.replaceState({}, '', url.toString());
        }
        
        // Show loading
        document.getElementById('app').innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; flex-direction: column;">
                <div class="spinner"></div>
                <div style="margin-top: 24px; font-size: 18px; color: var(--color-text-secondary);">Loading FitTrack...</div>
                <div style="margin-top: 8px; font-size: 12px; color: var(--color-text-tertiary);">v${APP_VERSION} Build ${APP_BUILD}</div>
            </div>
        `;
        
        // Initialize database
        await db.init();
        
        // Load theme preference
        const savedTheme = await db.getSetting('theme', 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
        console.log('Theme loaded:', savedTheme);
        
        // Initialize sample data if needed
        await db.initializeSampleData();
        
        // Start at home view
        router.navigate('home');
        
        console.log('FitTrack initialized successfully');
        
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.getElementById('app').innerHTML = `
            <div style="padding: 32px; text-align: center; color: #ff3366;">
                <h2 style="color: #ff3366; font-family: 'Archivo Black', sans-serif;">Failed to load app</h2>
                <p style="color: #b8b8d1; margin: 20px 0;">${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #00ff88; color: #0f0f1e; border: none; border-radius: 8px; cursor: pointer; font-weight: 700;">Reload</button>
            </div>
        `;
    }
}

// Handle browser back button
window.addEventListener('popstate', () => {
    router.back();
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Prevent pull-to-refresh on mobile
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchDelta = touchY - touchStartY;
    if (touchDelta > 0 && window.scrollY === 0) {
        e.preventDefault();
    }
}, { passive: false });

// Handle online/offline status
window.addEventListener('online', () => {
    showToast('Back online', 'success');
});

window.addEventListener('offline', () => {
    showToast('Working offline', 'warning');
});

// Install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Could show an install button here
    console.log('PWA install prompt available');
});

// Log successful PWA install
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
});
