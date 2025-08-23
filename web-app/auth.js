// Simple Clerk Auth for Vanilla JavaScript
class SimpleClerkAuth {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.token = null;
        this.publishableKey = 'pk_test_aHVtb3JvdXMtcGlyYW5oYS0zNy5jbGVyay5hY2NvdW50cy5kZXYk';
    }

    async init() {
        try {
            console.log('[Auth] Initializing Simple Clerk Auth...');
            
            // Check if user has session in localStorage
            const savedSession = localStorage.getItem('clerk-session');
            if (savedSession) {
                const sessionData = JSON.parse(savedSession);
                if (sessionData.expiresAt > Date.now()) {
                    this.user = sessionData.user;
                    this.token = sessionData.token;
                    this.isAuthenticated = true;
                    console.log('[Auth] Restored session for:', this.user.email);
                    this.showAuthenticatedUI();
                    return true;
                }
            }

            // Not authenticated, show sign-in UI
            this.showUnauthenticatedUI();
            return false;
        } catch (error) {
            console.error('[Auth] Init error:', error);
            this.showUnauthenticatedUI();
            return false;
        }
    }

    async signIn() {
        try {
            console.log('[Auth] Opening sign-in...');
            
            // For now, simulate successful sign-in
            // In production, this would integrate with Clerk's actual auth flow
            const mockUser = {
                id: 'user_' + Date.now(),
                email: 'demo@senscript.com',
                firstName: 'Demo',
                lastName: 'User'
            };
            
            const mockToken = 'mock-jwt-token-' + Date.now();
            
            // Save session
            const sessionData = {
                user: mockUser,
                token: mockToken,
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };
            
            localStorage.setItem('clerk-session', JSON.stringify(sessionData));
            
            this.user = mockUser;
            this.token = mockToken;
            this.isAuthenticated = true;
            
            console.log('[Auth] Sign-in successful');
            this.showAuthenticatedUI();
            
        } catch (error) {
            console.error('[Auth] Sign-in error:', error);
        }
    }

    async signUp() {
        // For demo, just call signIn
        await this.signIn();
    }

    async signOut() {
        try {
            console.log('[Auth] Signing out...');
            
            localStorage.removeItem('clerk-session');
            this.user = null;
            this.token = null;
            this.isAuthenticated = false;
            
            this.showUnauthenticatedUI();
            
        } catch (error) {
            console.error('[Auth] Sign-out error:', error);
        }
    }

    showUnauthenticatedUI() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('user-menu').style.display = 'none';
        document.getElementById('main-app').style.display = 'none';
    }

    showAuthenticatedUI() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('user-menu').style.display = 'block';
        document.getElementById('main-app').style.display = 'block';
        
        // Update user info
        if (this.user) {
            document.getElementById('user-email').textContent = this.user.email;
        }
    }

    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }
}

// Global instance
window.auth = new SimpleClerkAuth();