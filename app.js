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
const APP_BUILD = 16;

// Check for updates from server
async function checkForUpdates() {
    try {
        // Don't check if we just attempted an update
        const justUpdated = sessionStorage.getItem('just_updated');
        if (justUpdated) {
            console.log('Skipping update check - just updated');
            sessionStorage.removeItem('just_updated');
            return;
        }
        
        // Only check if online
        if (!navigator.onLine) return;
        
        // Fetch the current app.js to see what version is on server
        const response = await fetch('app.js?' + Date.now(), { cache: 'no-cache' });
        const text = await response.text();
        
        // Extract version from fetched file
        const versionMatch = text.match(/const APP_VERSION = '(.+?)'/);
        const buildMatch = text.match(/const APP_BUILD = (\d+)/);
        
        if (versionMatch && buildMatch) {
            const serverVersion = versionMatch[1];
            const serverBuild = parseInt(buildMatch[1]);
            
            // Compare with current version
            if (serverBuild > APP_BUILD) {
                console.log(`Update available! Current: Build ${APP_BUILD}, Server: Build ${serverBuild}`);
                showUpdateNotification(serverVersion, serverBuild);
            } else {
                console.log('App is up to date');
            }
        }
    } catch (error) {
        console.log('Could not check for updates:', error.message);
    }
}

// Show update notification
function showUpdateNotification(newVersion, newBuild) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'linear-gradient(135deg, var(--color-accent-warning), var(--color-accent-danger))';
    notification.style.color = '#fff';
    notification.style.padding = '16px 24px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.boxShadow = 'var(--shadow-lg)';
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '90%';
    notification.style.textAlign = 'center';
    notification.style.fontWeight = '600';
    notification.style.animation = 'slideDown 0.3s ease';
    
    const updateNowBtn = document.createElement('button');
    updateNowBtn.textContent = 'Update Now';
    updateNowBtn.style.background = '#fff';
    updateNowBtn.style.color = '#000';
    updateNowBtn.style.border = 'none';
    updateNowBtn.style.padding = '8px 20px';
    updateNowBtn.style.borderRadius = '8px';
    updateNowBtn.style.fontWeight = '700';
    updateNowBtn.style.cursor = 'pointer';
    updateNowBtn.style.marginRight = '8px';
    updateNowBtn.onclick = async () => {
        // Set flag to prevent notification showing again immediately after reload
        sessionStorage.setItem('just_updated', 'true');
        
        // Unregister service worker and force reload
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }
        // Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (const cacheName of cacheNames) {
                await caches.delete(cacheName);
            }
        }
        
        // Force complete cache bypass with URL parameter
        const url = new URL(window.location);
        url.searchParams.set('cachebust', Date.now());
        window.location.href = url.toString();
    };
    
    const laterBtn = document.createElement('button');
    laterBtn.textContent = 'Later';
    laterBtn.style.background = 'rgba(255,255,255,0.2)';
    laterBtn.style.color = '#fff';
    laterBtn.style.border = 'none';
    laterBtn.style.padding = '8px 20px';
    laterBtn.style.borderRadius = '8px';
    laterBtn.style.fontWeight = '700';
    laterBtn.style.cursor = 'pointer';
    laterBtn.onclick = () => notification.remove();
    
    notification.innerHTML = `
        <div style="font-size: 16px; margin-bottom: 8px;">🎉 Update Available!</div>
        <div style="font-size: 13px; margin-bottom: 12px;">Version ${newVersion} Build ${newBuild} is ready</div>
    `;
    notification.appendChild(updateNowBtn);
    notification.appendChild(laterBtn);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 30 seconds if not clicked
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 30000);
}

// App Initialization
async function initApp() {
    try {
        console.log(`FitTrack v${APP_VERSION} Buiild ${APP_BUILD}`);
        
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
        const savedTheme = await db.getSetting('theme', 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
        console.log('Theme loaded:', savedTheme);
        
        // Initialize sample data if needed
        await db.initializeSampleData();
        
        // Start at home view
        router.navigate('home');
        
        console.log('FitTrack initialized successfully');
        
        // Check for updates after app loads (don't block startup)
        setTimeout(() => checkForUpdates(), 2000);
        
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
