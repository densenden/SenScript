// Production Clerk Authentication for SenScript Web App
// Real implementation with proper error handling and user management

class ProductionClerkAuth {
    constructor() {
        this.clerk = null;
        this.user = null;
        this.isAuthenticated = false;
        this.token = null;
        this.publishableKey = null;
        this.initialized = false;
        this.authStateListeners = [];
    }

    async init() {
        try {
            console.log('[Auth] Initializing production Clerk authentication...');
            
            // Get Clerk configuration from server or environment
            let config;
            try {
                const configResponse = await fetch('/api/auth/config');
                if (!configResponse.ok) {
                    throw new Error(`Config fetch failed: ${configResponse.status}`);
                }
                config = await configResponse.json();
            } catch (error) {
                console.log('[Auth] API not available, using environment variables:', error.message);
                // Fallback to environment variables for production
                config = {
                    publishableKey: 'pk_test_aHVtb3JvdXMtcGlyYW5oYS0zNy5jbGVyay5hY2NvdW50cy5kZXYk'
                };
            }
            console.log('[Auth] Raw config response:', config);
            console.log('[Auth] Config publishableKey:', config.publishableKey);
            console.log('[Auth] Config publishableKey length:', config.publishableKey ? config.publishableKey.length : 'NONE');
            console.log('[Auth] Config publishableKey type:', typeof config.publishableKey);
            
            this.publishableKey = config.publishableKey;
            
            console.log('[Auth] After assignment - this.publishableKey:', this.publishableKey);
            console.log('[Auth] After assignment - this.publishableKey length:', this.publishableKey ? this.publishableKey.length : 'NONE');
            console.log('[Auth] After assignment - this.publishableKey type:', typeof this.publishableKey);
            
            console.log('[Auth] Retrieved Clerk configuration', {
                publishableKey: this.publishableKey ? `${this.publishableKey.substring(0, 10)}...` : 'EMPTY',
                configKeys: Object.keys(config)
            });

            // Load Clerk SDK
            await this.loadClerkSDK();
            
            // Initialize Clerk
            await this.initializeClerk();
            
            // Set up auth state listener
            this.setupAuthStateListener();
            
            this.initialized = true;
            console.log('[Auth] Production Clerk auth initialized successfully');
            
            return true;
        } catch (error) {
            console.error('[Auth] Failed to initialize:', error);
            this.showError('Authentication system failed to initialize. Please refresh the page.');
            return false;
        }
    }

    async loadClerkSDK() {
        return new Promise((resolve, reject) => {
            if (window.Clerk) {
                console.log('[Auth] Clerk SDK already loaded');
                resolve();
                return;
            }

            console.log('[Auth] Loading Clerk SDK...');
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@clerk/clerk-js@latest/dist/clerk.browser.js';
            script.async = true;
            
            script.onload = () => {
                console.log('[Auth] Clerk SDK loaded');
                // Wait for Clerk to be available
                const checkClerk = () => {
                    if (window.Clerk) {
                        resolve();
                    } else {
                        setTimeout(checkClerk, 100);
                    }
                };
                checkClerk();
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load Clerk SDK'));
            };
            
            document.head.appendChild(script);
        });
    }

    async initializeClerk() {
        console.log('[Auth] === ENTERING initializeClerk method ===');
        console.log('[Auth] window.Clerk exists:', !!window.Clerk);
        
        if (!this.publishableKey || this.publishableKey.trim() === '') {
            console.error('[Auth] ERROR: Publishable key is empty or invalid!');
            throw new Error('Publishable key is empty or invalid');
        }
        
        const keyToUse = this.publishableKey.trim();
        console.log('[Auth] Creating new Clerk instance with key:', keyToUse.substring(0, 20) + '...');
        
        try {
            console.log('[Auth] About to initialize Clerk with key length:', keyToUse.length);
            console.log('[Auth] Key starts with:', keyToUse.substring(0, 10));
            
            // Load Clerk with the publishable key
            await window.Clerk.load({
                publishableKey: keyToUse,
                appearance: {
                    baseTheme: 'dark',
                    elements: {
                        formButtonPrimary: {
                            backgroundColor: '#3b82f6',
                            '&:hover': {
                                backgroundColor: '#2563eb'
                            }
                        },
                    card: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    },
                    headerTitle: {
                        color: '#ffffff'
                    },
                    headerSubtitle: {
                        color: '#d1d5db'
                    },
                    socialButtonsBlockButton: {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)'
                        }
                    },
                    formFieldLabel: {
                        color: '#e5e7eb'
                    },
                    formFieldInput: {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        '&:focus': {
                            borderColor: '#3b82f6'
                        }
                    },
                    footerActionLink: {
                        color: '#3b82f6',
                        '&:hover': {
                            color: '#2563eb'
                        }
                    }
                },
                variables: {
                    borderRadius: '12px',
                    colorBackground: 'rgba(0, 0, 0, 0.8)',
                    colorInputBackground: 'rgba(255, 255, 255, 0.1)'
                }
            }
            });
            
            // Set the clerk instance after successful load
            this.clerk = window.Clerk;
            console.log('[Auth] clerk.load completed successfully');
            console.log('[Auth] Clerk initialized with configuration');
        } catch (clerkError) {
            console.error('[Auth] ERROR in clerk.load:', clerkError);
            console.error('[Auth] Key that failed:', keyToUse.substring(0, 20) + '...');
            throw clerkError;
        }
    }

    setupAuthStateListener() {
        if (!this.clerk) return;

        // Listen for auth state changes
        this.clerk.addListener(({ user, session }) => {
            console.log('[Auth] Auth state changed:', { hasUser: !!user, hasSession: !!session });
            
            if (user && session) {
                this.user = user;
                this.isAuthenticated = true;
                this.refreshToken();
                this.showAuthenticatedUI();
                this.notifyAuthStateListeners(true);
                
                // Sync user with database
                this.syncUserWithDatabase();
            } else {
                this.user = null;
                this.isAuthenticated = false;
                this.token = null;
                this.showUnauthenticatedUI();
                this.notifyAuthStateListeners(false);
            }
        });
    }

    async syncUserWithDatabase() {
        try {
            if (!this.user) return;

            const userData = {
                clerkUserId: this.user.id,
                email: this.user.primaryEmailAddress?.emailAddress || '',
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                profileImageUrl: this.user.profileImageUrl
            };

            const response = await fetch('/api/users/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...await this.getAuthHeaders()
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                console.warn('[Auth] Failed to sync user with database:', response.status);
            } else {
                console.log('[Auth] User synced with database');
            }
        } catch (error) {
            console.error('[Auth] Error syncing user:', error);
        }
    }

    async refreshToken() {
        try {
            if (!this.clerk?.session) return null;
            
            const token = await this.clerk.session.getToken();
            this.token = token;
            return token;
        } catch (error) {
            console.error('[Auth] Failed to refresh token:', error);
            return null;
        }
    }

    async signIn() {
        try {
            if (!this.initialized) {
                await this.init();
            }
            
            console.log('[Auth] Opening sign-in modal...');
            await this.clerk.openSignIn({
                afterSignInUrl: window.location.href,
                appearance: {
                    elements: {
                        rootBox: {
                            margin: '0 auto',
                            maxWidth: '400px'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('[Auth] Sign-in error:', error);
            this.showError('Failed to open sign-in. Please try again.');
        }
    }

    async signUp() {
        try {
            if (!this.initialized) {
                await this.init();
            }
            
            console.log('[Auth] Opening sign-up modal...');
            await this.clerk.openSignUp({
                afterSignUpUrl: window.location.href,
                appearance: {
                    elements: {
                        rootBox: {
                            margin: '0 auto',
                            maxWidth: '400px'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('[Auth] Sign-up error:', error);
            this.showError('Failed to open sign-up. Please try again.');
        }
    }

    async signOut() {
        try {
            if (!this.clerk) return;
            
            console.log('[Auth] Signing out...');
            await this.clerk.signOut();
            
            // Clear local state
            this.user = null;
            this.isAuthenticated = false;
            this.token = null;
            
            // UI will be updated by the auth state listener
        } catch (error) {
            console.error('[Auth] Sign-out error:', error);
            this.showError('Failed to sign out. Please try again.');
        }
    }

    showUnauthenticatedUI() {
        const authContainer = document.getElementById('auth-container');
        const userMenu = document.getElementById('user-menu');
        const mainApp = document.getElementById('main-app');

        if (authContainer) authContainer.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (mainApp) mainApp.style.display = 'none';
    }

    showAuthenticatedUI() {
        const authContainer = document.getElementById('auth-container');
        const userMenu = document.getElementById('user-menu');
        const mainApp = document.getElementById('main-app');

        if (authContainer) authContainer.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (mainApp) mainApp.style.display = 'block';

        // Update user info in UI
        this.updateUserInfo();
    }

    updateUserInfo() {
        if (!this.user) return;

        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            userEmailElement.textContent = this.user.primaryEmailAddress?.emailAddress || 'No email';
        }

        const userNameElements = document.querySelectorAll('.user-name');
        const displayName = this.user.firstName 
            ? `${this.user.firstName} ${this.user.lastName || ''}`.trim()
            : this.user.primaryEmailAddress?.emailAddress || 'User';
            
        userNameElements.forEach(element => {
            element.textContent = displayName;
        });

        const userAvatarElements = document.querySelectorAll('.user-avatar');
        if (this.user.profileImageUrl) {
            userAvatarElements.forEach(element => {
                element.src = this.user.profileImageUrl;
            });
        }
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(239, 68, 68, 0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>⚠️</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    async getAuthHeaders() {
        const token = await this.refreshToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Auth state listeners for other components
    addAuthStateListener(callback) {
        this.authStateListeners.push(callback);
    }

    removeAuthStateListener(callback) {
        this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
    }

    notifyAuthStateListeners(isAuthenticated) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(isAuthenticated, this.user);
            } catch (error) {
                console.error('[Auth] Error in auth state listener:', error);
            }
        });
    }

    // Helper methods for external components
    getCurrentUser() {
        return this.user;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    async getUserSettings() {
        if (!this.isAuthenticated) return null;

        try {
            const response = await fetch('/api/user/settings', {
                headers: await this.getAuthHeaders()
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('[Auth] Failed to get user settings:', error);
        }
        
        return null;
    }

    async updateUserSettings(settings) {
        if (!this.isAuthenticated) return false;

        try {
            const response = await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...await this.getAuthHeaders()
                },
                body: JSON.stringify(settings)
            });

            return response.ok;
        } catch (error) {
            console.error('[Auth] Failed to update user settings:', error);
            return false;
        }
    }
}

// Create global auth instance
window.auth = new ProductionClerkAuth();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);