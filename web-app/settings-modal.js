// Settings Modal Component
class SettingsModal {
    constructor(auth, listeningMeter) {
        this.auth = auth;
        this.listeningMeter = listeningMeter;
        this.settings = {};
        this.usage = {};
        this.activeTab = 'usage';
        this.modalElement = null;
    }

    async init() {
        await this.loadSettings();
        await this.loadUsage();
        this.createModal();
    }

    async loadSettings() {
        try {
            const headers = await this.auth.getAuthHeaders();
            const response = await fetch('/api/settings', { headers });
            this.settings = await response.json();
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = {
                autoStartListening: false,
                defaultCardType: 'flash',
                language: 'auto',
                selectedModel: 'auto',
                useFallback: true,
                outputLanguage: { auto: true },
                education: {
                    userLevel: 1,
                    detailLevel: 5,
                    exampleComplexity: 3
                }
            };
        }
    }

    async loadUsage() {
        try {
            const headers = await this.auth.getAuthHeaders();
            const [day, week, month] = await Promise.all([
                fetch('/api/usage/summary?range=day', { headers }).then(r => r.json()),
                fetch('/api/usage/summary?range=week', { headers }).then(r => r.json()),
                fetch('/api/usage/summary?range=month', { headers }).then(r => r.json())
            ]);
            
            this.usage = { day, week, month };
        } catch (error) {
            console.error('Failed to load usage:', error);
            this.usage = {
                day: { totalMinutes: 0, totalSessions: 0 },
                week: { totalMinutes: 0, totalSessions: 0 },
                month: { totalMinutes: 0, totalSessions: 0 }
            };
        }
    }

    async saveSettings(updates) {
        try {
            const headers = await this.auth.getAuthHeaders();
            const response = await fetch('/api/settings', {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                this.settings = await response.json();
                this.showToast('Settings saved successfully');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    createModal() {
        // Remove existing modal if any
        if (this.modalElement) {
            this.modalElement.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'settings-modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: none;
            z-index: 10000;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div class="settings-modal glass-dark" style="
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <div class="modal-header" style="
                    padding: 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <h2 style="font-size: 24px; font-weight: 600; color: white;">Settings</h2>
                    <button class="close-btn glass-button" style="
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        color: white;
                    ">×</button>
                </div>

                <div class="modal-tabs" style="
                    display: flex;
                    gap: 8px;
                    padding: 0 24px;
                    margin-top: 16px;
                ">
                    <button class="tab-btn active" data-tab="usage" style="
                        padding: 8px 16px;
                        background: rgba(59, 130, 246, 0.2);
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 12px;
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Usage</button>
                    <button class="tab-btn" data-tab="preferences" style="
                        padding: 8px 16px;
                        background: transparent;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        color: rgba(255, 255, 255, 0.7);
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Preferences</button>
                    <button class="tab-btn" data-tab="account" style="
                        padding: 8px 16px;
                        background: transparent;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        color: rgba(255, 255, 255, 0.7);
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Account</button>
                </div>

                <div class="modal-content" style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                ">
                    <!-- Usage Tab -->
                    <div class="tab-content" id="usage-tab" style="display: block;">
                        <div class="usage-stats" style="display: grid; gap: 16px;">
                            <div class="stat-card glass-button" style="padding: 16px;">
                                <h4 style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 8px;">Today</h4>
                                <div style="display: flex; align-items: baseline; gap: 8px;">
                                    <span class="stat-value" style="font-size: 32px; font-weight: 600; color: white;">
                                        ${this.usage.day?.totalMinutes || 0}
                                    </span>
                                    <span style="color: rgba(255, 255, 255, 0.5);">minutes</span>
                                </div>
                                <div style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin-top: 4px;">
                                    ${this.usage.day?.totalSessions || 0} sessions
                                </div>
                            </div>

                            <div class="stat-card glass-button" style="padding: 16px;">
                                <h4 style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 8px;">This Week</h4>
                                <div style="display: flex; align-items: baseline; gap: 8px;">
                                    <span class="stat-value" style="font-size: 32px; font-weight: 600; color: white;">
                                        ${this.usage.week?.totalMinutes || 0}
                                    </span>
                                    <span style="color: rgba(255, 255, 255, 0.5);">minutes</span>
                                </div>
                                <div style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin-top: 4px;">
                                    ${this.usage.week?.totalSessions || 0} sessions
                                </div>
                            </div>

                            <div class="stat-card glass-button" style="padding: 16px;">
                                <h4 style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 8px;">This Month</h4>
                                <div style="display: flex; align-items: baseline; gap: 8px;">
                                    <span class="stat-value" style="font-size: 32px; font-weight: 600; color: white;">
                                        ${this.usage.month?.totalMinutes || 0}
                                    </span>
                                    <span style="color: rgba(255, 255, 255, 0.5);">minutes</span>
                                </div>
                                <div style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin-top: 4px;">
                                    ${this.usage.month?.totalSessions || 0} sessions
                                </div>
                            </div>
                        </div>

                        <div style="margin-top: 24px; padding: 16px; background: rgba(59, 130, 246, 0.1); border-radius: 12px;">
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">
                                Usage is tracked automatically when you use the speech recognition feature. 
                                Minutes are counted only when actively listening to conversations.
                            </p>
                        </div>
                    </div>

                    <!-- Preferences Tab -->
                    <div class="tab-content" id="preferences-tab" style="display: none;">
                        <div style="display: grid; gap: 20px;">
                            <!-- Auto Start Listening -->
                            <div class="pref-item">
                                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                                    <div>
                                        <div style="color: white; font-weight: 500;">Auto-start Listening</div>
                                        <div style="color: rgba(255, 255, 255, 0.5); font-size: 14px; margin-top: 4px;">
                                            Automatically start recording when you open the app
                                        </div>
                                    </div>
                                    <input type="checkbox" id="autoStartListening" 
                                        ${this.settings.autoStartListening ? 'checked' : ''}
                                        style="width: 20px; height: 20px; cursor: pointer;">
                                </label>
                            </div>

                            <!-- Default Card Type -->
                            <div class="pref-item">
                                <label style="color: white; font-weight: 500; display: block; margin-bottom: 8px;">
                                    Default Card Type
                                </label>
                                <select id="defaultCardType" class="glass-button" style="
                                    width: 100%;
                                    padding: 10px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    color: white;
                                    border-radius: 12px;
                                    font-size: 16px;
                                ">
                                    <option value="flash" ${this.settings.defaultCardType === 'flash' ? 'selected' : ''}>
                                        Flashcards (Educational)
                                    </option>
                                    <option value="cheat" ${this.settings.defaultCardType === 'cheat' ? 'selected' : ''}>
                                        Cheat Cards (Quick Reference)
                                    </option>
                                </select>
                            </div>

                            <!-- Language Settings -->
                            <div class="pref-item">
                                <label style="color: white; font-weight: 500; display: block; margin-bottom: 8px;">
                                    Output Language
                                </label>
                                <select id="outputLanguage" class="glass-button" style="
                                    width: 100%;
                                    padding: 10px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border: 1px solid rgba(255, 255, 255, 0.2);
                                    color: white;
                                    border-radius: 12px;
                                    font-size: 16px;
                                ">
                                    <option value="auto" ${this.settings.outputLanguage?.auto ? 'selected' : ''}>
                                        Auto-detect
                                    </option>
                                    <option value="en" ${this.settings.outputLanguage?.fixed === 'en' ? 'selected' : ''}>
                                        English
                                    </option>
                                    <option value="de" ${this.settings.outputLanguage?.fixed === 'de' ? 'selected' : ''}>
                                        German
                                    </option>
                                    <option value="es" ${this.settings.outputLanguage?.fixed === 'es' ? 'selected' : ''}>
                                        Spanish
                                    </option>
                                    <option value="fr" ${this.settings.outputLanguage?.fixed === 'fr' ? 'selected' : ''}>
                                        French
                                    </option>
                                </select>
                            </div>

                            <!-- Education Level -->
                            <div class="pref-item">
                                <label style="color: white; font-weight: 500; display: block; margin-bottom: 8px;">
                                    Education Level
                                </label>
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                                    <div>
                                        <label style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">User Level</label>
                                        <input type="range" id="userLevel" min="1" max="5" 
                                            value="${this.settings.education?.userLevel || 1}"
                                            style="width: 100%; margin-top: 8px;">
                                        <div style="text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                                            <span id="userLevelValue">${this.settings.education?.userLevel || 1}</span>/5
                                        </div>
                                    </div>
                                    <div>
                                        <label style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Detail Level</label>
                                        <input type="range" id="detailLevel" min="1" max="5" 
                                            value="${this.settings.education?.detailLevel || 5}"
                                            style="width: 100%; margin-top: 8px;">
                                        <div style="text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                                            <span id="detailLevelValue">${this.settings.education?.detailLevel || 5}</span>/5
                                        </div>
                                    </div>
                                    <div>
                                        <label style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Complexity</label>
                                        <input type="range" id="exampleComplexity" min="1" max="5" 
                                            value="${this.settings.education?.exampleComplexity || 3}"
                                            style="width: 100%; margin-top: 8px;">
                                        <div style="text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                                            <span id="complexityValue">${this.settings.education?.exampleComplexity || 3}</span>/5
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Account Tab -->
                    <div class="tab-content" id="account-tab" style="display: none;">
                        <div id="clerk-user-profile" style="min-height: 400px;">
                            <!-- Clerk UserProfile will be mounted here -->
                        </div>
                        <div style="text-align: center; margin-top: 16px;">
                            <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px;">
                                Manage your account, security settings, and connected services
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;
        this.attachEventListeners();
    }

    attachEventListeners() {
        const modal = this.modalElement;
        
        // Close button
        modal.querySelector('.close-btn').addEventListener('click', () => this.close());
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        // Tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Preference changes with debouncing
        let saveTimeout;
        const debouncedSave = (updates) => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => this.saveSettings(updates), 500);
        };
        
        // Auto-start listening
        modal.querySelector('#autoStartListening').addEventListener('change', (e) => {
            debouncedSave({ autoStartListening: e.target.checked });
        });
        
        // Default card type
        modal.querySelector('#defaultCardType').addEventListener('change', (e) => {
            debouncedSave({ defaultCardType: e.target.value });
        });
        
        // Output language
        modal.querySelector('#outputLanguage').addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'auto') {
                debouncedSave({ outputLanguage: { auto: true } });
            } else {
                debouncedSave({ outputLanguage: { auto: false, fixed: value } });
            }
        });
        
        // Education sliders
        ['userLevel', 'detailLevel', 'exampleComplexity'].forEach(id => {
            const slider = modal.querySelector(`#${id}`);
            const valueSpan = modal.querySelector(`#${id === 'exampleComplexity' ? 'complexityValue' : id + 'Value'}`);
            
            slider.addEventListener('input', (e) => {
                valueSpan.textContent = e.target.value;
                
                const education = {
                    userLevel: parseInt(modal.querySelector('#userLevel').value),
                    detailLevel: parseInt(modal.querySelector('#detailLevel').value),
                    exampleComplexity: parseInt(modal.querySelector('#exampleComplexity').value)
                };
                
                debouncedSave({ education });
            });
        });
    }

    switchTab(tabName) {
        const modal = this.modalElement;
        
        // Update tab buttons
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
                btn.style.background = 'rgba(59, 130, 246, 0.2)';
                btn.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                btn.style.color = 'white';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'transparent';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                btn.style.color = 'rgba(255, 255, 255, 0.7)';
            }
        });
        
        // Update tab content
        modal.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        modal.querySelector(`#${tabName}-tab`).style.display = 'block';
        
        // Mount Clerk UserProfile when account tab is opened
        if (tabName === 'account' && this.auth.isSignedIn()) {
            setTimeout(() => {
                this.auth.mountUserProfile('clerk-user-profile');
            }, 100);
        }
        
        this.activeTab = tabName;
    }

    async open() {
        if (!this.auth.isSignedIn()) {
            await this.auth.signIn();
            return;
        }
        
        await this.loadUsage(); // Refresh usage data
        this.modalElement.style.display = 'flex';
        
        // Mount UserProfile if account tab is active
        if (this.activeTab === 'account') {
            setTimeout(() => {
                this.auth.mountUserProfile('clerk-user-profile');
            }, 100);
        }
    }

    close() {
        this.modalElement.style.display = 'none';
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast glass-button';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
            border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
            color: white;
            border-radius: 12px;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Export as global
window.SettingsModal = SettingsModal;