// PWA Update Management
class PWAUpdateManager {
    constructor() {
        this.updateAvailable = false;
        this.serviceWorkerRegistration = null;
        this.updateCheckInterval = null;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                // Register service worker
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', this.serviceWorkerRegistration);

                // Listen for updates
                this.setupUpdateListeners();
                
                // Check for updates every 30 minutes
                this.updateCheckInterval = setInterval(() => this.checkForUpdates(), 30 * 60 * 1000);
                
                // Check for updates on page load
                this.checkForUpdates();
                
                // Check for updates when the page becomes visible
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden) {
                        this.checkForUpdates();
                    }
                });
                
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupUpdateListeners() {
        // Listen for service worker updates
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                this.handleUpdateAvailable();
            }
        });

        // Listen for new service worker installation
        if (this.serviceWorkerRegistration) {
            this.serviceWorkerRegistration.addEventListener('updatefound', () => {
                console.log('New service worker update found');
                this.handleUpdateAvailable();
            });
        }
    }

    async checkForUpdates() {
        if (this.serviceWorkerRegistration) {
            try {
                await this.serviceWorkerRegistration.update();
                return true;
            } catch (error) {
                console.error('Failed to check for updates:', error);
                return false;
            }
        }
        return false;
    }

    handleUpdateAvailable() {
        this.updateAvailable = true;
        this.showUpdateNotification();
    }

    showUpdateNotification() {
        // Remove existing notification if present
        const existingNotification = document.getElementById('pwa-update-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create update notification
        const notification = document.createElement('div');
        notification.id = 'pwa-update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00cc66);
            color: #000;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
            z-index: 10000;
            font-weight: bold;
            cursor: pointer;
            animation: slideInRight 0.5s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>🔄</span>
                <span>Game Update Available!</span>
                <button onclick="pwaUpdateManager.applyUpdate()" style="
                    background: #000;
                    color: #fff;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                    margin-left: 10px;
                ">Update Now</button>
            </div>
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-hide after 15 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 15000);
    }

    async applyUpdate() {
        if (this.updateAvailable && this.serviceWorkerRegistration && this.serviceWorkerRegistration.waiting) {
            // Send message to service worker to skip waiting
            this.serviceWorkerRegistration.waiting.postMessage({
                type: 'SKIP_WAITING'
            });

            // Show loading message
            const notification = document.getElementById('pwa-update-notification');
            if (notification) {
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span>⏳</span>
                        <span>Updating game...</span>
                    </div>
                `;
            }

            // Reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    // Force check for updates (can be called manually)
    async forceCheckForUpdates() {
        console.log('Checking for updates...');
        if (this.serviceWorkerRegistration) {
            try {
                await this.serviceWorkerRegistration.update();
                return true;
            } catch (error) {
                console.error('Failed to check for updates:', error);
                return false;
            }
        }
        return false;
    }

    // Dispose of the update manager
    dispose() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
        }
    }
}

// Initialize PWA Update Manager
let pwaUpdateManager;

document.addEventListener('DOMContentLoaded', () => {
    pwaUpdateManager = new PWAUpdateManager();
});

// Export for global access
window.pwaUpdateManager = pwaUpdateManager;
