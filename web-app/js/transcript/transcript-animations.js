/**
 * Transcript Animations
 * Handles sophisticated animations for transcript display
 */

class TranscriptAnimations {
    constructor() {
        this.initialized = false;
    }
    
    initialize() {
        console.log('✨ [TranscriptAnimations] Initializing animations');
        
        // Inject animation CSS if not already present
        this.injectAnimationStyles();
        
        this.initialized = true;
        console.log('[TranscriptAnimations] Animations ready');
    }
    
    /**
     * Inject CSS animations into the page
     */
    injectAnimationStyles() {
        const styleId = 'transcript-animations-css';
        
        // Check if styles already exist
        if (document.getElementById(styleId)) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* === TRANSCRIPT VISUAL HIERARCHY === */
            .transcript-container {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .transcript-sentences {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 12px;
                min-height: 100px;
            }
            
            /* Sentence hierarchy - 3 levels */
            .transcript-sentence.sentence-current .sentence-text {
                font-size: 16px;
                opacity: 1.0;
                font-weight: 500;
                color: rgba(255, 255, 255, 1.0);
            }
            
            .transcript-sentence.sentence-recent .sentence-text {
                font-size: 14px;
                opacity: 0.7;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .transcript-sentence.sentence-old .sentence-text {
                font-size: 12px;
                opacity: 0.5;
                font-weight: 300;
                color: rgba(255, 255, 255, 0.5);
            }
            
            .sentence-content {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                line-height: 1.4;
            }
            
            .sentence-flag {
                flex-shrink: 0;
                font-size: 12px;
                opacity: 0.6;
            }
            
            .sentence-text {
                transition: all 0.3s ease;
            }
            
            /* === INTERIM TEXT DISPLAY === */
            .transcript-interim {
                padding: 8px 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                min-height: 24px;
                display: flex;
                align-items: center;
            }
            
            .interim-content {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .interim-text {
                font-size: 16px;
                opacity: 0.6;
                color: rgba(255, 255, 255, 0.6);
                font-style: italic;
                transition: all 0.2s ease;
            }
            
            .interim-cursor {
                color: rgba(255, 255, 255, 0.4);
                animation: cursorBlink 1s infinite;
            }
            
            @keyframes cursorBlink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            /* === FADE IN ANIMATION (Session Start) === */
            .transcript-container.fade-in-animation {
                animation: fadeInTranscript 0.8s ease-in;
            }
            
            @keyframes fadeInTranscript {
                0% { 
                    opacity: 0; 
                    transform: translateY(10px); 
                }
                100% { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
            
            /* === HORIZONTAL FLIP ANIMATION (Interim Changes) === */
            .interim-text.flip-animation {
                animation: horizontalFlip 0.2s ease-in-out;
            }
            
            @keyframes horizontalFlip {
                0% { 
                    transform: scaleX(1); 
                    opacity: 0.6; 
                }
                50% { 
                    transform: scaleX(0.8); 
                    opacity: 0.3; 
                }
                100% { 
                    transform: scaleX(1); 
                    opacity: 0.6; 
                }
            }
            
            /* === WOBBLE ANIMATION (Final Sentences) === */
            .transcript-sentence.wobble-animation {
                animation: subtleWobble 0.3s ease-out;
            }
            
            @keyframes subtleWobble {
                0%, 100% { 
                    transform: translateX(0); 
                }
                25% { 
                    transform: translateX(-1px); 
                }
                75% { 
                    transform: translateX(1px); 
                }
            }
            
            /* === PLACEHOLDER AND LISTENING STATES === */
            .transcript-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 80px;
                color: rgba(255, 255, 255, 0.4);
                font-style: italic;
                font-size: 14px;
            }
            
            .listening-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .listening-dot {
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: listeningPulse 1.5s infinite;
            }
            
            @keyframes listeningPulse {
                0%, 100% { 
                    opacity: 1; 
                    transform: scale(1); 
                }
                50% { 
                    opacity: 0.5; 
                    transform: scale(1.2); 
                }
            }
            
            .listening-text {
                color: rgba(255, 255, 255, 0.6);
                font-style: italic;
            }
            
            /* === SMOOTH TRANSITIONS === */
            .transcript-sentence {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .transcript-interim.active {
                opacity: 1;
                transform: translateY(0);
            }
            
            .transcript-interim {
                opacity: 0;
                transform: translateY(-5px);
                transition: all 0.2s ease;
            }
            
            /* === RESPONSIVE ADJUSTMENTS === */
            @media (max-width: 768px) {
                .transcript-sentence.sentence-current .sentence-text {
                    font-size: 15px;
                }
                
                .transcript-sentence.sentence-recent .sentence-text {
                    font-size: 13px;
                }
                
                .transcript-sentence.sentence-old .sentence-text {
                    font-size: 11px;
                }
                
                .interim-text {
                    font-size: 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
        console.log('📄 [TranscriptAnimations] Animation styles injected');
    }
    
    /**
     * Trigger horizontal flip animation for interim text changes
     */
    triggerFlip() {
        const interimText = document.querySelector('.interim-text');
        if (interimText) {
            // Remove class if present
            interimText.classList.remove('flip-animation');
            
            // Force reflow to ensure class removal takes effect
            interimText.offsetHeight;
            
            // Add animation class
            interimText.classList.add('flip-animation');
            
            // Remove class after animation completes
            setTimeout(() => {
                interimText.classList.remove('flip-animation');
            }, 200);
        }
    }
    
    /**
     * Trigger subtle wobble animation for finalized sentences
     */
    triggerWobble() {
        // Target the most recent sentence (last one added)
        const sentences = document.querySelectorAll('.transcript-sentence');
        const lastSentence = sentences[sentences.length - 1];
        
        if (lastSentence) {
            // Add wobble animation
            lastSentence.classList.add('wobble-animation');
            
            // Remove class after animation completes
            setTimeout(() => {
                lastSentence.classList.remove('wobble-animation');
            }, 300);
        }
    }
    
    /**
     * Trigger fade-in animation for transcript container
     */
    fadeInTranscript() {
        const transcriptContainer = document.querySelector('.transcript-container');
        if (transcriptContainer) {
            transcriptContainer.classList.add('fade-in-animation');
            
            // Remove class after animation completes
            setTimeout(() => {
                transcriptContainer.classList.remove('fade-in-animation');
            }, 800);
        }
    }
    
    /**
     * Create a smooth scroll animation to bottom
     */
    smoothScrollToBottom(element) {
        if (!element) return;
        
        const targetScrollTop = element.scrollHeight - element.clientHeight;
        const currentScrollTop = element.scrollTop;
        const difference = targetScrollTop - currentScrollTop;
        
        if (Math.abs(difference) < 5) return; // Already close enough
        
        // Smooth animation
        const duration = 200; // ms
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.scrollTop = currentScrollTop + (difference * easeOut);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
    
    /**
     * Add entrance animation to a new sentence
     */
    animateNewSentence(sentenceElement) {
        if (!sentenceElement) return;
        
        // Start with invisible and slightly offset
        sentenceElement.style.opacity = '0';
        sentenceElement.style.transform = 'translateY(10px)';
        
        // Animate to visible
        setTimeout(() => {
            sentenceElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            sentenceElement.style.opacity = '1';
            sentenceElement.style.transform = 'translateY(0)';
        }, 50);
        
        // Clean up inline styles after animation
        setTimeout(() => {
            sentenceElement.style.transition = '';
            sentenceElement.style.opacity = '';
            sentenceElement.style.transform = '';
        }, 350);
    }
}

// Export to window
window.TranscriptAnimations = TranscriptAnimations;