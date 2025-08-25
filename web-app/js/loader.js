/**
 * Modular Script Loader for SenScript
 * Loads all modules in the correct order
 */

class ModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadModules();
    }
    
    async loadModules() {
        console.log('📦 Loading SenScript modules...');
        
        // Load modules in dependency order
        const modules = [
            // Test data first
            'test-transcripts.js',
            
            // Utility modules
            'js/utils/language-detection.js',
            'js/utils/transcript-processing.js',
            
            // Core systems
            'js/audio/audio-system.js',
            'js/audio/speech-recognition.js',
            
            // Card system
            'js/cards/card-engine.js',
            'js/cards/card-generator.js',
            
            // UI components
            'js/ui/ui-manager.js',
            'js/ui/settings-manager.js',
            
            // Main application (last)
            'js/core/main.js'
        ];
        
        try {
            await this.loadScriptsSequentially(modules);
            console.log('✅ All modules loaded successfully');
            
            // SenScript should initialize itself when main.js loads
            console.log('✅ Modular SenScript system ready');
            
            // Verify that SenScript is available
            if (window.SenScript) {
                console.log('✅ SenScript class is available');
            } else {
                console.error('❌ SenScript class not found after loading modules');
            }
        } catch (error) {
            console.error('❌ Failed to load modules:', error);
        }
    }
    
    async loadScriptsSequentially(scripts) {
        for (const script of scripts) {
            await this.loadScript(script);
        }
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Skip if already loaded
            if (this.loadedModules.has(src)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.loadedModules.add(src);
                console.log(`✓ Loaded: ${src}`);
                resolve();
            };
            script.onerror = (error) => {
                console.warn(`⚠️ Failed to load: ${src} (${error})`);
                // Don't reject - continue loading other modules
                resolve();
            };
            
            document.head.appendChild(script);
        });
    }
}

// Start loading modules immediately
window.moduleLoader = new ModuleLoader();