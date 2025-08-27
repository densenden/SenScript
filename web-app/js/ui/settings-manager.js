/**
 * Settings Manager Module
 * Handles application settings and preferences
 */

class SettingsManager {
    constructor(app) {
        this.app = app;
        this.db = new DatabaseManager();
        this.settings = this.getDefaultSettings();
        this.loadSettings();
        
        // Initialize language UI after a short delay to ensure elements exist
        setTimeout(() => this.initializeLanguageUI(), 500);
    }
    
    getDefaultSettings() {
        return {
            // Language settings
            language: 'en-US', // Default to English
            autoInputLanguage: true, // Auto-detect input language
            cardOutputLanguage: 'auto',
            autoLanguage: true,
            
            // Education settings
            educationLevel: 3,
            detailLevel: 3,
            exampleComplexity: 3,
            
            // Card settings
            interviewMode: false,
            
            // AI settings
            selectedModel: 'auto',
            useFallback: true,
            apiKeys: {
                openai: '',
                anthropic: '',
                deepseek: ''
            },
            
            // Transcription settings
            transcriptionMethod: 'whisper', // 'whisper' or 'webspeech'
            whisperSettings: {
                temperature: 0.0,
                language: null, // Auto-detect
                educationalFiltering: true
            },
            
            // Theme and UI
            theme: 'auto',
            
            // Export and other
            autoExport: false
        };
    }
    
    async loadSettings() {
        try {
            // Load from database (with localStorage fallback)
            const dbSettings = await this.db.loadSettings();
            if (dbSettings) {
                this.settings = { ...this.settings, ...dbSettings };
            }
            
            // Also load from legacy localStorage keys for backward compatibility
            this.loadLegacySettings();
            
            this.applySettings();
            console.log('[Settings] Settings loaded from database:', this.settings);
        } catch (error) {
            console.error('[Settings] Failed to load settings:', error);
        }
    }
    
    async saveSettings() {
        try {
            // Collect current values from UI elements
            this.collectUISettings();
            
            // Save to database (with localStorage fallback)
            const result = await this.db.saveSettings(this.settings);
            
            // Apply new settings
            this.applySettings();
            
            console.log('[Settings] Settings saved to database:', this.settings);
            if (this.app.ui && this.app.ui.showNotification) {
                const message = result.offline ? 'Settings saved offline (will sync online)' : 'Settings saved successfully!';
                this.app.ui.showNotification(message, 'success');
            }
            
        } catch (error) {
            console.error('[Settings] Failed to save settings:', error);
            if (this.app.ui && this.app.ui.showNotification) {
                this.app.ui.showNotification('Failed to save settings', 'error');
            }
        }
    }
    
    applySettings() {
        // Apply language setting to current system
        if (this.settings.language) {
            this.app.currentLang = this.settings.language;
            
            // Apply to Whisper client if available
            if (this.app.whisperClient && this.settings.transcriptionMethod === 'whisper') {
                this.app.whisperClient.setLanguage(
                    this.settings.whisperSettings.language || 
                    this.settings.language
                );
            }
            
            // Web Speech API disabled in Whisper-only mode
            // if (this.app.speechRecognition && this.app.speechRecognition.recognition) {
            //     this.app.speechRecognition.recognition.lang = this.settings.language;
            // }
        }
        
        // Update UI elements
        this.updateSettingsUI();
    }
    
    updateSettingsUI() {
        // Update sliders and inputs to match current settings
        if (this.app.els.educationLevel) {
            this.app.els.educationLevel.value = this.settings.educationLevel;
        }
        if (this.app.els.detailLevel) {
            this.app.els.detailLevel.value = this.settings.detailLevel;
        }
        if (this.app.els.exampleComplexity) {
            this.app.els.exampleComplexity.value = this.settings.exampleComplexity;
        }
        
        // Update any display elements that show current values
        this.updateEducationDisplay();
    }
    
    updateEducationDisplay() {
        // Update education level displays (if they exist in the UI)
        const educationDisplay = document.getElementById('educationLevelDisplay');
        if (educationDisplay) {
            const level = this.settings.educationLevel;
            const levels = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
            educationDisplay.textContent = levels[level - 1] || 'Intermediate';
        }
        
        const detailDisplay = document.getElementById('detailLevelDisplay');
        if (detailDisplay) {
            const level = this.settings.detailLevel;
            const levels = ['Brief', 'Concise', 'Moderate', 'Detailed', 'Comprehensive'];
            detailDisplay.textContent = levels[level - 1] || 'Moderate';
        }
        
        const complexityDisplay = document.getElementById('exampleComplexityDisplay');
        if (complexityDisplay) {
            const level = this.settings.exampleComplexity;
            const levels = ['Simple', 'Basic', 'Standard', 'Complex', 'Academic'];
            complexityDisplay.textContent = levels[level - 1] || 'Standard';
        }
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        console.log('[Settings] Settings reset to defaults');
        this.app.ui.showNotification('Settings reset to defaults', 'info');
    }
    
    initializeLanguageUI() {
        // Load saved language settings or use defaults
        const savedLang = localStorage.getItem('cardOutputLanguage') || 'auto';
        const savedAuto = localStorage.getItem('autoLanguage') !== 'false';
        
        this.settings.cardOutputLanguage = savedLang;
        this.settings.autoLanguage = savedAuto;
        
        this.updateLanguageUI();
        console.log('[Settings] Language UI initialized:', savedLang, savedAuto);
    }
    
    updateLanguageUI() {
        const languageFlag = document.getElementById('languageFlag');
        const languageText = document.getElementById('languageText');
        
        if (this.settings.autoLanguage || this.settings.cardOutputLanguage === 'auto') {
            if (languageFlag) languageFlag.textContent = '🌐';
            if (languageText) languageText.textContent = 'AUTO';
        } else {
            // Set specific language
            const langMap = {
                'de-DE': { flag: '🇩🇪', text: 'DE' },
                'en-US': { flag: '🇺🇸', text: 'EN' },
                'fr-FR': { flag: '🇫🇷', text: 'FR' },
                'es-ES': { flag: '🇪🇸', text: 'ES' }
            };
            
            const lang = langMap[this.settings.cardOutputLanguage] || langMap['en-US'];
            if (languageFlag) languageFlag.textContent = lang.flag;
            if (languageText) languageText.textContent = lang.text;
        }
    }
    
    /**
     * Load legacy settings for backward compatibility
     */
    loadLegacySettings() {
        const legacyKeys = {
            'cardOutputLanguage': 'cardOutputLanguage',
            'autoLanguage': 'autoLanguage',
            'selectedModel': 'selectedModel',
            'interviewMode': 'interviewMode'
        };
        
        for (const [legacyKey, settingKey] of Object.entries(legacyKeys)) {
            const value = localStorage.getItem(legacyKey);
            if (value !== null) {
                try {
                    this.settings[settingKey] = JSON.parse(value);
                } catch {
                    this.settings[settingKey] = value;
                }
            }
        }
    }
    
    /**
     * Collect settings from UI elements
     */
    collectUISettings() {
        // Education levels
        if (this.app.els.educationLevel) {
            this.settings.educationLevel = parseInt(this.app.els.educationLevel.value);
        }
        if (this.app.els.detailLevel) {
            this.settings.detailLevel = parseInt(this.app.els.detailLevel.value);
        }
        if (this.app.els.exampleComplexity) {
            this.settings.exampleComplexity = parseInt(this.app.els.exampleComplexity.value);
        }
        
        // AI model selection
        const selectedModelEl = document.querySelector('input[name="ai-model"]:checked');
        if (selectedModelEl) {
            this.settings.selectedModel = selectedModelEl.value;
        }
        
        // API Keys
        const openaiKeyEl = document.getElementById('openaiKey');
        if (openaiKeyEl) {
            this.settings.apiKeys.openai = openaiKeyEl.value;
        }
        
        const anthropicKeyEl = document.getElementById('anthropicKey');
        if (anthropicKeyEl) {
            this.settings.apiKeys.anthropic = anthropicKeyEl.value;
        }
        
        const deepseekKeyEl = document.getElementById('deepseekKey');
        if (deepseekKeyEl) {
            this.settings.apiKeys.deepseek = deepseekKeyEl.value;
        }
        
        // Language settings
        const autoInputLanguageEl = document.getElementById('autoInputLanguage');
        if (autoInputLanguageEl) {
            this.settings.autoInputLanguage = autoInputLanguageEl.checked;
        }
        
        const inputLanguageEl = document.getElementById('inputLanguage');
        if (inputLanguageEl) {
            this.settings.language = inputLanguageEl.value;
        }
        
        const autoLanguageEl = document.getElementById('autoLanguage');
        if (autoLanguageEl) {
            this.settings.autoLanguage = autoLanguageEl.checked;
        }
        
        const outputLanguageEl = document.getElementById('outputLanguage');
        if (outputLanguageEl) {
            this.settings.cardOutputLanguage = outputLanguageEl.value;
        }
        
        // Interview mode
        const interviewModeEl = document.getElementById('interviewMode');
        if (interviewModeEl) {
            this.settings.interviewMode = interviewModeEl.checked;
        }
        
        // Theme
        const themeEl = document.getElementById('themeSelect');
        if (themeEl) {
            this.settings.theme = themeEl.value;
        }
        
        // Fallback option
        const useFallbackEl = document.getElementById('useFallback');
        if (useFallbackEl) {
            this.settings.useFallback = useFallbackEl.checked;
        }
    }
    
    /**
     * Initialize AI model selection UI
     */
    initializeAIModelSelection() {
        const modelGrid = document.getElementById('modelGrid');
        if (!modelGrid) {
            console.warn('[Settings] Model grid not found');
            return;
        }
        
        // Define available models with specific model names
        const models = [
            { id: 'auto', name: 'Auto', description: 'Fastest available', category: 'Auto' },
            { id: 'openai-gpt-4o-mini', name: 'GPT-4o Mini', description: 'OpenAI\'s latest mini model', category: 'OpenAI' },
            { id: 'openai-gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', category: 'OpenAI' },
            { id: 'anthropic-haiku', name: 'Claude 3.5 Haiku', description: 'Fast and capable', category: 'Anthropic' },
            { id: 'anthropic-sonnet', name: 'Claude 3.5 Sonnet', description: 'Balanced performance', category: 'Anthropic' },
            { id: 'deepseek-v3', name: 'DeepSeek V3', description: 'Latest reasoning model', category: 'DeepSeek' },
            { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'Optimized for conversation', category: 'DeepSeek' }
        ];
        
        // Group models by category for better organization
        const modelsByCategory = models.reduce((acc, model) => {
            if (!acc[model.category]) acc[model.category] = [];
            acc[model.category].push(model);
            return acc;
        }, {});
        
        // Create model selection with categories
        let modelHTML = '';
        Object.entries(modelsByCategory).forEach(([category, categoryModels]) => {
            if (category !== 'Auto') {
                modelHTML += `<div style="font-size: 12px; font-weight: 600; opacity: 0.8; margin: 16px 0 8px 0; text-transform: uppercase;">${category}</div>`;
            }
            
            categoryModels.forEach(model => {
                const isSelected = model.id === this.settings.selectedModel;
                modelHTML += `
                    <label class="model-button ${isSelected ? 'selected' : ''}" 
                           style="${category !== 'Auto' ? 'margin-bottom: 6px;' : 'margin-bottom: 12px; border: 2px solid rgba(59, 130, 246, 0.3);'}">
                        <input type="radio" name="ai-model" value="${model.id}" 
                               ${isSelected ? 'checked' : ''} 
                               style="display: none;">
                        <div class="model-name">${model.name}</div>
                        <div class="model-description" style="font-size: 11px; opacity: 0.7; margin-top: 4px;">
                            ${model.description}
                        </div>
                    </label>
                `;
            });
        });
        
        modelGrid.innerHTML = modelHTML;
        
        // Add event listeners to radio buttons
        const radioButtons = modelGrid.querySelectorAll('input[name="ai-model"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.settings.selectedModel = radio.value;
                    
                    // Update visual selection
                    modelGrid.querySelectorAll('.model-button').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    radio.closest('.model-button').classList.add('selected');
                    
                    console.log('[Settings] AI model changed to:', radio.value);
                }
            });
        });
    }
    
    /**
     * Initialize theme selection
     */
    initializeThemeSelection() {
        // Handle theme options (using data-theme attributes)
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            const themeValue = option.getAttribute('data-theme');
            
            // Set initial selected state
            if (themeValue === this.settings.theme) {
                option.classList.add('selected');
            }
            
            // Add click event listener
            option.addEventListener('click', () => {
                // Remove selected from all options
                themeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected to clicked option
                option.classList.add('selected');
                
                // Update settings and apply theme
                this.settings.theme = themeValue;
                this.applyTheme(themeValue);
                
                console.log('[Settings] Theme changed to:', themeValue);
            });
        });
        
        // Apply current theme on initialization
        this.applyTheme(this.settings.theme);
    }
    
    /**
     * Apply theme to the application
     */
    applyTheme(theme) {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('light', 'dark', 'system');
        
        if (theme === 'light') {
            body.classList.add('light');
        } else if (theme === 'dark') {
            body.classList.add('dark');
        } else if (theme === 'system' || theme === 'auto') {
            // System/auto theme - use system preference
            body.classList.add('system');
            
            // Check system preference and apply appropriate class
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark');
            } else {
                body.classList.add('light');
            }
        }
        
        console.log('[Settings] Theme applied:', theme);
    }
    
    /**
     * Initialize language selection UI
     */
    initializeLanguageSelection() {
        // Auto input language toggle
        const autoInputLanguageEl = document.getElementById('autoInputLanguage');
        if (autoInputLanguageEl) {
            autoInputLanguageEl.checked = this.settings.autoInputLanguage;
            autoInputLanguageEl.addEventListener('change', () => {
                this.settings.autoInputLanguage = autoInputLanguageEl.checked;
                this.updateInputLanguageVisibility();
                console.log('[Settings] Auto input language changed to:', autoInputLanguageEl.checked);
            });
        }
        
        // Input language selection
        const inputLanguageEl = document.getElementById('inputLanguage');
        if (inputLanguageEl) {
            inputLanguageEl.value = this.settings.language;
            inputLanguageEl.addEventListener('change', () => {
                this.settings.language = inputLanguageEl.value;
                this.app.currentLang = inputLanguageEl.value; // Update app current language
                
                // Update speech recognition language if available
                if (this.app.speechRecognition && this.app.speechRecognition.recognition) {
                    this.app.speechRecognition.recognition.lang = inputLanguageEl.value;
                    console.log('[Settings] Speech recognition language updated to:', inputLanguageEl.value);
                }
                console.log('[Settings] Input language changed to:', inputLanguageEl.value);
            });
        }
        
        // Auto output language toggle
        const autoLanguageEl = document.getElementById('autoLanguage');
        if (autoLanguageEl) {
            autoLanguageEl.checked = this.settings.autoLanguage;
            autoLanguageEl.addEventListener('change', () => {
                this.settings.autoLanguage = autoLanguageEl.checked;
                this.updateLanguageSelectionVisibility();
                console.log('[Settings] Auto output language changed to:', autoLanguageEl.checked);
            });
        }
        
        // Output language selection
        const outputLanguageEl = document.getElementById('outputLanguage');
        if (outputLanguageEl) {
            outputLanguageEl.value = this.settings.cardOutputLanguage;
            outputLanguageEl.addEventListener('change', () => {
                this.settings.cardOutputLanguage = outputLanguageEl.value;
                console.log('[Settings] Output language changed to:', outputLanguageEl.value);
            });
        }
        
        // Update visibility based on auto language setting
        this.updateInputLanguageVisibility();
        this.updateLanguageSelectionVisibility();
    }
    
    /**
     * Show/hide output language selection based on auto language setting
     */
    updateLanguageSelectionVisibility() {
        const outputLanguageContainer = document.getElementById('outputLanguageContainer');
        if (outputLanguageContainer) {
            outputLanguageContainer.style.display = this.settings.autoLanguage ? 'none' : 'block';
        }
    }
    
    /**
     * Get usage statistics and update display
     */
    updateStatsDisplay() {
        if (this.app.getUsageStats) {
            const stats = this.app.getUsageStats();
            
            // Update daily stats using the available elements
            const dailyCardsEl = document.getElementById('dailyCards');
            if (dailyCardsEl) {
                dailyCardsEl.textContent = stats.todayCards.toString();
            }
            
            const dailyMinutesEl = document.getElementById('dailyMinutes');
            if (dailyMinutesEl) {
                dailyMinutesEl.textContent = stats.todayMinutes.toString();
            }
            
            // For now, use current session data for calls and tokens
            const dailyCallsEl = document.getElementById('dailyCalls');
            if (dailyCallsEl) {
                // Use card count as approximation for API calls
                dailyCallsEl.textContent = stats.todayCards.toString();
            }
            
            const dailyTokensEl = document.getElementById('dailyTokens');
            if (dailyTokensEl) {
                // Estimate tokens (rough calculation: ~500 tokens per card)
                const estimatedTokens = stats.todayCards * 500;
                dailyTokensEl.textContent = estimatedTokens.toLocaleString();
            }
            
            console.log('[Settings] Stats updated:', stats);
        } else {
            // Fallback to current app data if getUsageStats not available
            const currentCards = this.app.cards ? this.app.cards.length : 0;
            
            const dailyCardsEl = document.getElementById('dailyCards');
            if (dailyCardsEl) {
                dailyCardsEl.textContent = currentCards.toString();
            }
            
            const dailyCallsEl = document.getElementById('dailyCalls');
            if (dailyCallsEl) {
                dailyCallsEl.textContent = currentCards.toString();
            }
            
            const dailyTokensEl = document.getElementById('dailyTokens');
            if (dailyTokensEl) {
                const estimatedTokens = currentCards * 500;
                dailyTokensEl.textContent = estimatedTokens.toLocaleString();
            }
            
            console.log('[Settings] Stats updated with current app data');
        }
    }
    
    /**
     * Setup CheatCard examples in settings
     */
    setupCheatCardExamples() {
        const exampleDisplay = document.getElementById('exampleCardDisplay');
        const cardCounter = document.getElementById('cardCounter');
        const prevButton = document.getElementById('prevExampleCard');
        const nextButton = document.getElementById('nextExampleCard');
        
        if (!exampleDisplay) {
            console.warn('[Settings] CheatCard example display not found');
            return;
        }
        
        const examples = [
            {
                category: "MEETING TIP",
                front: "How to handle \"Can you take the lead on this?\"",
                back: "🎯 Say: \"I'd be happy to coordinate this. Let me confirm the scope and timeline with everyone\"\n⚡ Show enthusiasm while clarifying expectations\n📝 Avoid: \"I guess\" or immediately saying no"
            },
            {
                category: "QUICK WIN",
                front: "Biology: Photosynthesis equation",
                back: "🎯 Remember: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂\n⚡ Memory trick: \"Six and Six make Sugar and Six\"\n📝 Plants use carbon dioxide and water to make glucose"
            },
            {
                category: "WHAT TO SAY",
                front: "How to answer \"Tell me about yourself\"?",
                back: "🎯 Say: \"I'm a [role] with [X years] experience in [field]. Recently accomplished [achievement].\"\n⚡ Keep it professional, structured, and relevant to the job\n📝 Avoid: Personal life details, rambling, or \"I don't know where to start\""
            },
            {
                category: "PRESENTATION TIP",
                front: "Handling difficult Q&A questions",
                back: "🎯 Say: \"That's a great question. Let me think about that for a moment...\"\n⚡ Buy time to think, then give honest, thoughtful responses\n📝 Avoid: \"I don't know\" or making something up"
            },
            {
                category: "INTERVIEW TIP",
                front: "How to negotiate salary?",
                back: "🎯 Say: \"Based on my research and experience, I was expecting something in the range of X to Y\"\n⚡ Always have a range, not a single number\n📝 Research market rates beforehand"
            },
            {
                category: "KEY FACTS",
                front: "Chemistry: Periodic table trends",
                back: "🎯 Atomic radius decreases left to right, increases top to bottom\n⚡ Memory trick: Think of nuclear charge pulling electrons closer\n📝 Ionization energy increases left to right, decreases top to bottom"
            },
            {
                category: "AVOID THIS",
                front: "What NOT to say in meetings",
                back: "🎯 Avoid: \"That's not my job\" or \"I don't have time for this\"\n⚡ Instead: \"Let me see how I can help with this\" or \"What's the priority here?\"\n📝 Show willingness to collaborate, not defensiveness"
            },
            {
                category: "CONCEPT",
                front: "What is machine learning?",
                back: "🎯 Machine learning is training computers to learn patterns from data\n⚡ Three types: supervised, unsupervised, and reinforcement learning\n📝 Used in recommendations, image recognition, and prediction systems"
            }
        ];
        
        let currentIndex = 0;
        
        // Function to display current example
        const displayExample = (index) => {
            const example = examples[index];
            exampleDisplay.innerHTML = `
                <div style="margin-bottom: 12px;">
                    <span style="
                        background: rgba(59, 130, 246, 0.2);
                        color: #60a5fa;
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 600;
                    ">${example.category}</span>
                </div>
                <div style="font-weight: 600; margin-bottom: 12px; color: rgba(255, 255, 255, 0.95);">
                    ${example.front}
                </div>
                <div style="font-size: 13px; line-height: 1.4; color: rgba(255, 255, 255, 0.8);">
                    ${example.back.replace(/\n/g, '<br>')}
                </div>
            `;
            
            if (cardCounter) {
                cardCounter.textContent = `${index + 1} / ${examples.length}`;
            }
        };
        
        // Add navigation event listeners
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = currentIndex > 0 ? currentIndex - 1 : examples.length - 1;
                displayExample(currentIndex);
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex = currentIndex < examples.length - 1 ? currentIndex + 1 : 0;
                displayExample(currentIndex);
            });
        }
        
        // Display first example
        displayExample(0);
        
        console.log('[Settings] CheatCard examples carousel set up with', examples.length, 'examples');
    }
    
    /**
     * Show/hide input language selection based on auto setting
     */
    updateInputLanguageVisibility() {
        const inputLanguageContainer = document.getElementById('inputLanguageContainer');
        if (inputLanguageContainer) {
            inputLanguageContainer.style.display = this.settings.autoInputLanguage ? 'none' : 'block';
        }
    }
    
    /**
     * Initialize all settings UI components
     */
    initializeAllSettingsUI() {
        // Delay to ensure DOM elements are available
        setTimeout(() => {
            this.initializeLanguageUI();
            this.initializeAIModelSelection();
            this.initializeThemeSelection();
            this.initializeLanguageSelection();
            this.updateStatsDisplay();
            this.setupCheatCardExamples();
            
            console.log('[Settings] All settings UI initialized');
        }, 1000);
    }
}

window.SettingsManager = SettingsManager;