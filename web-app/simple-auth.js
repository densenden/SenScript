// Simple Clerk Authentication - Modeled after working website implementation
// Uses the same patterns as the website but for vanilla JavaScript

class SimpleClerkAuth {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.initialized = false;
        this.clerk = null;
    }

    async init() {
        try {
            console.log('[SimpleAuth] Initializing Clerk...');
            
            // Load Clerk from CDN if not already loaded
            if (!window.Clerk) {
                await this.loadClerkScript();
            }
            
            // Initialize Clerk - same way as the working website
            this.clerk = window.Clerk;
            
            // Load with environment key (same approach as website)
            // This will automatically share sessions across sen.studio subdomains
            await this.clerk.load();
            
            // Setup auth state listener
            this.setupAuthStateListener();
            
            this.initialized = true;
            console.log('[SimpleAuth] Clerk initialized successfully');
            
            return true;
        } catch (error) {
            console.error('[SimpleAuth] Failed to initialize:', error);
            return false;
        }
    }

    loadClerkScript() {
        return new Promise((resolve, reject) => {
            // Create script element with proper Clerk CDN URL
            const script = document.createElement('script');
            
            // Use the official Clerk CDN with environment variable
            script.src = 'https://unpkg.com/@clerk/clerk-js@latest/dist/clerk.browser.js';
            script.async = true;
            
            // Set the publishable key as data attribute (same pattern as website)
            script.setAttribute('data-clerk-publishable-key', 'pk_test_aHVtb3JvdXMtcGlyYW5oYS0zNy5jbGVyay5hY2NvdW50cy5kZXYk');
            
            script.onload = () => {
                console.log('[SimpleAuth] Clerk script loaded');
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load Clerk script'));
            };
            
            document.head.appendChild(script);
        });
    }

    setupAuthStateListener() {
        if (!this.clerk) return;

        // Listen for auth state changes (same pattern as website)
        this.clerk.addListener(({ user, session }) => {
            console.log('[SimpleAuth] Auth state changed:', { hasUser: !!user, hasSession: !!session });
            
            if (user && session) {
                this.user = user;
                this.isAuthenticated = true;
                this.showAuthenticatedUI();
                console.log('[SimpleAuth] User authenticated:', user.primaryEmailAddress?.emailAddress);
            } else {
                this.user = null;
                this.isAuthenticated = false;
                this.showUnauthenticatedUI();
                console.log('[SimpleAuth] User signed out');
            }
        });
    }

    async signIn() {
        try {
            if (!this.initialized) {
                await this.init();
            }
            
            console.log('[SimpleAuth] Opening sign-in...');
            await this.clerk.openSignIn();
        } catch (error) {
            console.error('[SimpleAuth] Sign-in error:', error);
        }
    }

    async signUp() {
        try {
            if (!this.initialized) {
                await this.init();
            }
            
            console.log('[SimpleAuth] Opening sign-up...');
            await this.clerk.openSignUp();
        } catch (error) {
            console.error('[SimpleAuth] Sign-up error:', error);
        }
    }

    async signOut() {
        try {
            if (!this.clerk) return;
            
            console.log('[SimpleAuth] Signing out...');
            await this.clerk.signOut();
        } catch (error) {
            console.error('[SimpleAuth] Sign-out error:', error);
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

        // Update user info
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
        if (this.user.imageUrl) {
            userAvatarElements.forEach(element => {
                element.src = this.user.imageUrl;
            });
        }
    }

    // Helper methods
    getCurrentUser() {
        return this.user;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    // Compatibility methods for existing code
    isSignedIn() {
        return this.isAuthenticated;
    }

    getUser() {
        return this.user;
    }

    // Mount UserProfile (for settings modal)
    mountUserProfile(containerId) {
        if (!this.clerk) {
            console.warn('[SimpleAuth] Cannot mount UserProfile - Clerk not initialized');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('[SimpleAuth] Container not found:', containerId);
            return;
        }

        try {
            this.clerk.mountUserProfile(container);
            console.log('[SimpleAuth] UserProfile mounted successfully');
        } catch (error) {
            console.error('[SimpleAuth] Failed to mount UserProfile:', error);
        }
    }

    async getToken() {
        if (!this.clerk?.session) return null;
        
        try {
            return await this.clerk.session.getToken();
        } catch (error) {
            console.error('[SimpleAuth] Failed to get token:', error);
            return null;
        }
    }

    async getAuthHeaders() {
        const token = await this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Mount Clerk UserButton in specified container
    mountUserButton(containerId) {
        if (!this.clerk) {
            console.warn('[SimpleAuth] Cannot mount UserButton - Clerk not initialized');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('[SimpleAuth] Container not found:', containerId);
            return;
        }

        try {
            // Mount the Clerk UserButton
            this.clerk.mountUserButton(container, {
                appearance: {
                    elements: {
                        avatarBox: "w-10 h-10",
                        userButtonBox: "w-10 h-10 flex items-center justify-center",
                        userButtonTrigger: "w-10 h-10"
                    }
                }
            });
            console.log('[SimpleAuth] UserButton mounted successfully');
        } catch (error) {
            console.error('[SimpleAuth] Failed to mount UserButton:', error);
        }
    }
}

// Create global auth instance
window.simpleAuth = new SimpleClerkAuth();

console.log('[SimpleAuth] Simple auth module loaded - call window.simpleAuth.init() to start');