// Listening Meter - Usage Tracking Module
class ListeningMeter {
    constructor(auth) {
        this.auth = auth;
        this.isActive = false;
        this.startTime = null;
        this.accumulatedSeconds = 0;
        this.lastPingTime = null;
        this.pingInterval = 45000; // 45 seconds
        this.pingTimer = null;
        this.visibilityHandler = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.source = 'web';
    }

    init() {
        // Handle page visibility changes
        this.visibilityHandler = () => {
            if (document.hidden && this.isActive) {
                this.pause();
            } else if (!document.hidden && this.wasActive) {
                this.resume();
            }
        };
        
        document.addEventListener('visibilitychange', this.visibilityHandler);
        
        // Send any accumulated time on page unload
        window.addEventListener('beforeunload', () => {
            if (this.accumulatedSeconds > 0) {
                this.sendPing(true); // Force sync ping on unload
            }
        });
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.startTime = Date.now();
        this.lastPingTime = Date.now();
        
        // Start ping timer
        this.pingTimer = setInterval(() => {
            this.sendPing();
        }, this.pingInterval);
        
        console.log('📊 Listening meter started');
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.wasActive = false;
        
        // Accumulate time since last ping
        if (this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.accumulatedSeconds += elapsed;
        }
        
        // Clear timer
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        
        // Send final ping with accumulated time
        if (this.accumulatedSeconds > 0) {
            this.sendPing();
        }
        
        console.log('📊 Listening meter stopped');
    }

    pause() {
        if (!this.isActive) return;
        
        this.wasActive = true;
        this.isActive = false;
        
        // Accumulate time
        if (this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.accumulatedSeconds += elapsed;
            this.startTime = null;
        }
        
        console.log('📊 Listening meter paused');
    }

    resume() {
        if (this.isActive || !this.wasActive) return;
        
        this.isActive = true;
        this.wasActive = false;
        this.startTime = Date.now();
        
        console.log('📊 Listening meter resumed');
    }

    async sendPing(forceSync = false) {
        // Calculate seconds since last ping
        let seconds = this.accumulatedSeconds;
        
        if (this.isActive && this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            seconds += elapsed;
            this.startTime = Date.now(); // Reset start time
        }
        
        if (seconds <= 0) return;
        
        // Get session metadata
        const meta = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timestamp: new Date().toISOString()
        };
        
        try {
            const headers = await this.auth.getAuthHeaders();
            
            const request = {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    seconds,
                    source: this.source,
                    meta
                })
            };
            
            if (forceSync) {
                // Use sendBeacon for unload events
                const blob = new Blob([request.body], { type: 'application/json' });
                navigator.sendBeacon('/api/usage/ping', blob);
            } else {
                const response = await fetch('/api/usage/ping', request);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`📊 Usage ping sent: ${seconds}s → ${result.minutes}m`);
                    
                    // Reset accumulated seconds on success
                    this.accumulatedSeconds = 0;
                    this.lastPingTime = Date.now();
                    this.retryAttempts = 0;
                } else if (response.status === 429) {
                    console.warn('📊 Rate limited, will retry later');
                    // Don't reset accumulated seconds, will be sent in next ping
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            }
        } catch (error) {
            console.error('📊 Failed to send usage ping:', error);
            
            // Implement exponential backoff for retries
            if (this.retryAttempts < this.maxRetries) {
                this.retryAttempts++;
                const retryDelay = Math.min(1000 * Math.pow(2, this.retryAttempts), 30000);
                
                setTimeout(() => {
                    this.sendPing();
                }, retryDelay);
            }
            
            // Keep accumulated seconds for next attempt
        }
    }

    getStatus() {
        return {
            isActive: this.isActive,
            accumulatedSeconds: this.accumulatedSeconds,
            sessionDuration: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0
        };
    }

    // Get formatted session time
    getFormattedTime() {
        const status = this.getStatus();
        const totalSeconds = status.accumulatedSeconds + status.sessionDuration;
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    destroy() {
        this.stop();
        
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
        }
    }
}

// Export as global
window.ListeningMeter = ListeningMeter;