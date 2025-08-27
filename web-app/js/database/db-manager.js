/**
 * Database Manager for SenScript
 * Handles all database operations including settings, usage tracking, and sessions
 */

class DatabaseManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.userId = this.getCurrentUserId();
        this.pendingOperations = [];
        this.currentSession = null;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingOperations();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        console.log('[DB] DatabaseManager initialized', { userId: this.userId, isOnline: this.isOnline });
    }
    
    /**
     * Get current user ID (from localStorage or generate new one)
     */
    getCurrentUserId() {
        let userId = localStorage.getItem('senscript_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('senscript_user_id', userId);
        }
        return userId;
    }
    
    /**
     * Save user settings to database
     */
    async saveSettings(settings) {
        try {
            const payload = {
                userId: this.userId,
                data: JSON.stringify(settings)
            };
            
            if (this.isOnline) {
                const response = await fetch('/api/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('[DB] Settings saved to database:', result);
                
                // Also save to localStorage as backup
                localStorage.setItem('senscript_settings', JSON.stringify(settings));
                
                return result;
            } else {
                // Offline: queue operation and save to localStorage
                this.pendingOperations.push({
                    type: 'saveSettings',
                    payload,
                    timestamp: Date.now()
                });
                
                localStorage.setItem('senscript_settings', JSON.stringify(settings));
                localStorage.setItem('senscript_pending_ops', JSON.stringify(this.pendingOperations));
                
                console.log('[DB] Settings saved offline (will sync when online)');
                return { success: true, offline: true };
            }
        } catch (error) {
            console.error('[DB] Failed to save settings:', error);
            
            // Fallback to localStorage
            localStorage.setItem('senscript_settings', JSON.stringify(settings));
            return { success: false, error: error.message, fallback: 'localStorage' };
        }
    }
    
    /**
     * Load user settings from database
     */
    async loadSettings() {
        try {
            if (this.isOnline) {
                const response = await fetch(`/api/settings/${this.userId}`);
                
                if (response.ok) {
                    const result = await response.json();
                    const settings = JSON.parse(result.data || '{}');
                    console.log('[DB] Settings loaded from database:', settings);
                    return settings;
                }
            }
        } catch (error) {
            console.error('[DB] Failed to load settings from database:', error);
        }
        
        // Fallback to localStorage
        const localSettings = localStorage.getItem('senscript_settings');
        const settings = localSettings ? JSON.parse(localSettings) : this.getDefaultSettings();
        console.log('[DB] Settings loaded from localStorage:', settings);
        return settings;
    }
    
    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            // Appearance
            theme: 'system',
            
            // Audio
            audioSource: 'microphone',
            noiseReduction: true,
            autoGain: true,
            
            // Languages
            autoInputLanguage: true,
            inputLanguage: 'en-US',
            autoOutputLanguage: true,
            outputLanguage: 'en-US',
            
            // AI
            aiModel: 'auto',
            apiKeys: {},
            useFallback: true,
            
            // Cards
            interviewMode: false,
            autoCardGeneration: true,
            cardConfidenceThreshold: 75,
            
            // Account/Usage
            trackUsage: true,
            dataRetention: 90
        };
    }
    
    /**
     * Start a listening session
     */
    async startListeningSession() {
        const session = {
            id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: this.userId,
            source: 'web',
            startedAt: new Date().toISOString(),
            minutes: 0
        };
        
        this.currentSession = session;
        console.log('[DB] Listening session started:', session);
        
        // Start minute counter
        this.sessionInterval = setInterval(() => {
            if (this.currentSession) {
                this.currentSession.minutes++;
                console.log(`[DB] Session minutes: ${this.currentSession.minutes}`);
            }
        }, 60000); // Every minute
        
        return session;
    }
    
    /**
     * End current listening session
     */
    async endListeningSession() {
        if (!this.currentSession) {
            return null;
        }
        
        // Clear interval
        if (this.sessionInterval) {
            clearInterval(this.sessionInterval);
            this.sessionInterval = null;
        }
        
        const session = {
            ...this.currentSession,
            endedAt: new Date().toISOString()
        };
        
        try {
            if (this.isOnline) {
                const response = await fetch('/api/sessions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(session)
                });
                
                if (response.ok) {
                    console.log('[DB] Session saved to database:', session);
                }
            } else {
                // Queue for later sync
                this.pendingOperations.push({
                    type: 'saveSession',
                    payload: session,
                    timestamp: Date.now()
                });
            }
            
            // Update daily usage
            await this.updateDailyUsage(session.minutes);
            
        } catch (error) {
            console.error('[DB] Failed to save session:', error);
        }
        
        this.currentSession = null;
        return session;
    }
    
    /**
     * Update daily usage stats
     */
    async updateDailyUsage(additionalMinutes = 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // UTC midnight
        
        const payload = {
            userId: this.userId,
            date: today.toISOString(),
            minutes: additionalMinutes
        };
        
        try {
            if (this.isOnline) {
                const response = await fetch('/api/usage/daily', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('[DB] Daily usage updated:', result);
                    return result;
                }
            } else {
                // Update localStorage tracking
                const usageKey = 'senscript_usage_' + today.toDateString();
                const currentUsage = JSON.parse(localStorage.getItem(usageKey) || '{"minutes": 0}');
                currentUsage.minutes += additionalMinutes;
                localStorage.setItem(usageKey, JSON.stringify(currentUsage));
                
                // Queue for sync
                this.pendingOperations.push({
                    type: 'updateDailyUsage',
                    payload,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('[DB] Failed to update daily usage:', error);
        }
    }
    
    /**
     * Get usage statistics
     */
    async getUsageStats() {
        try {
            if (this.isOnline) {
                const response = await fetch(`/api/usage/${this.userId}`);
                
                if (response.ok) {
                    const stats = await response.json();
                    console.log('[DB] Usage stats from database:', stats);
                    return stats;
                }
            }
        } catch (error) {
            console.error('[DB] Failed to get usage stats:', error);
        }
        
        // Fallback to localStorage
        const stats = this.getLocalUsageStats();
        console.log('[DB] Usage stats from localStorage:', stats);
        return stats;
    }
    
    /**
     * Get local usage statistics
     */
    getLocalUsageStats() {
        const usageData = JSON.parse(localStorage.getItem('senscript_usage') || '{}');
        const today = new Date().toDateString();
        const currentSession = usageData[today] || { minutes: 0, cards: 0, sessions: 0 };
        
        // Add current session minutes if active
        if (this.currentSession) {
            currentSession.minutes += this.currentSession.minutes;
        }
        
        const totalMinutes = Object.values(usageData).reduce((sum, day) => sum + (day.minutes || 0), 0);
        const totalCards = Object.values(usageData).reduce((sum, day) => sum + (day.cards || 0), 0);
        
        return {
            todayMinutes: currentSession.minutes,
            todayCards: currentSession.cards,
            totalMinutes,
            totalCards,
            sessionsCount: Object.keys(usageData).length,
            currentSessionMinutes: this.currentSession ? this.currentSession.minutes : 0
        };
    }
    
    /**
     * Sync pending operations when back online
     */
    async syncPendingOperations() {
        const pending = JSON.parse(localStorage.getItem('senscript_pending_ops') || '[]');
        
        if (pending.length === 0) {
            return;
        }
        
        console.log(`[DB] Syncing ${pending.length} pending operations...`);
        
        for (const operation of pending) {
            try {
                switch (operation.type) {
                    case 'saveSettings':
                        await fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(operation.payload)
                        });
                        break;
                        
                    case 'saveSession':
                        await fetch('/api/sessions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(operation.payload)
                        });
                        break;
                        
                    case 'updateDailyUsage':
                        await fetch('/api/usage/daily', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(operation.payload)
                        });
                        break;
                }
                
                console.log(`[DB] Synced operation: ${operation.type}`);
            } catch (error) {
                console.error(`[DB] Failed to sync operation ${operation.type}:`, error);
            }
        }
        
        // Clear pending operations
        localStorage.removeItem('senscript_pending_ops');
        this.pendingOperations = [];
        
        console.log('[DB] All pending operations synced');
    }
    
    /**
     * Get current session info
     */
    getCurrentSession() {
        return this.currentSession;
    }
    
    /**
     * Check if minutes tracking is active
     */
    isTrackingMinutes() {
        return this.currentSession !== null;
    }
}

// Export for use in other modules
window.DatabaseManager = DatabaseManager;