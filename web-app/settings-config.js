/**
 * SenScript Configuration - All Tunable Parameters
 * 
 * GOAL NUMBER 1: CARD CREATION SPEED
 * Every parameter is optimized for maximum card generation speed
 */

export const SENSCRIPT_CONFIG = {
    // ===== CARD CREATION SPEED PRIORITY =====
    PRIORITY: {
        GOAL_1: "MAXIMUM_CARD_CREATION_SPEED",
        PRINCIPLE: "Faster cards > Perfect accuracy"
    },

    // ===== EDUCATION LEVEL ADAPTATION =====
    EDUCATION: {
        USER_LEVEL: 3,              // 1=Beginner, 2=Basic, 3=Balanced, 4=Advanced, 5=Expert
        DETAIL_LEVEL: 3,            // 1=Brief, 2=Concise, 3=Moderate, 4=Detailed, 5=Comprehensive  
        EXAMPLE_COMPLEXITY: 3       // 1=Simple, 2=Basic, 3=Real-world, 4=Technical, 5=Academic
    },

    // ===== SPLITTING PARAMETERS =====
    SPLITTING: {
        // Real-time splitting thresholds (VERY AGGRESSIVE for speed)
        SHOULD_PROCESS_NOW: {
            MIN_LENGTH_FOR_COMMA_SPLIT: 25,        // Was 30, now even faster
            MIN_LENGTH_FOR_CONJUNCTION_SPLIT: 30,  // Was 35, speed optimized  
            MAX_LENGTH_BEFORE_FORCE_SPLIT: 40,     // Was 45, faster processing
            ENABLE_REALTIME_SPLITTING: true
        },

        // Sentence splitting stages
        STAGES: {
            // Stage 2: Secondary breaks (commas, semicolons)
            SECONDARY_SPLIT_THRESHOLD: 30,         // Was 35, faster splitting
            
            // Stage 3: Conjunctions (aber, and, but, however)
            CONJUNCTION_SPLIT_THRESHOLD: 45,       // Was 50, speed focused
            
            // Stage 4: Topic transitions
            TOPIC_SPLIT_THRESHOLD: 35,             // Was 40, aggressive
            
            // Stage 5: Emergency splitting
            EMERGENCY_SPLIT_THRESHOLD: 45          // Was 50, faster emergency
        },

        // Force splitting patterns (for speed)
        FORCE_PATTERNS: {
            PRIMARY_BREAKS: /([.!?])\s+/g,
            SECONDARY_BREAKS: /([,;:])\s+/g,
            CONJUNCTION_BREAKS: /\s+(aber|doch|jedoch|außerdem|zudem|and|but|however|furthermore)\s+/gi,
            TOPIC_BREAKS: /\s+(beginnen mit|schauen wir uns|let's look at|now)\s+/gi
        }
    },

    // ===== WORTHINESS FILTERING =====
    WORTHINESS: {
        // Minimum lengths (RELAXED for more cards)
        MIN_TEXT_LENGTH: 15,                    // Was 20, allow shorter
        
        // Duplicate detection (speed vs accuracy)
        DUPLICATE_DETECTION: {
            ENABLED: true,
            HASH_LENGTH: 40,                    // Was 50, faster hashing
            TIMEOUT_MS: 8000                    // Was 10000, faster cleanup
        },
        
        // Educational value requirements (RELAXED)
        EDUCATIONAL_REQUIREMENTS: {
            STRICT_MODE: false,                 // Allow more content through
            MIN_EXPLANATION_LENGTH: 25,         // Was 40, accept shorter explanations
            MIN_QUESTION_LENGTH: 20             // Was 30, shorter questions OK
        }
    },

    // ===== UI DISPLAY PARAMETERS =====
    UI: {
        // Transcript display (FIXED - prevent long sentences)
        TRANSCRIPT: {
            MAX_DISPLAY_LENGTH: 80,             // Cut off long sentences in UI
            UPDATE_FREQUENCY_MS: 100,           // Faster UI updates
            PREVENT_DUPLICATES: true,           // Fix duplicate line issue
            FADE_DUPLICATE_TIMEOUT_MS: 500      // Quick fade for duplicates
        },
        
        // Card rendering
        CARDS: {
            ANIMATION_SPEED_MS: 200,            // Faster card appearance
            MAX_CARDS_VISIBLE: 10,              // Limit for performance
            AUTO_SCROLL: true                   // Keep newest visible
        }
    },

    // ===== API OPTIMIZATION =====
    API: {
        // Request batching (for speed)
        BATCHING: {
            ENABLED: false,                     // Individual requests faster than batching
            MAX_BATCH_SIZE: 1,                  // No batching
            MAX_WAIT_TIME_MS: 50                // Minimal wait
        },
        
        // Timeout settings
        TIMEOUTS: {
            CARD_GENERATION_MS: 8000,           // Was 10000, faster timeout
            RETRY_ATTEMPTS: 1,                  // Was 3, fail fast
            RETRY_DELAY_MS: 500                 // Quick retry
        }
    },

    // ===== LOGGING & DEBUGGING =====
    DEBUG: {
        ENABLED: true,
        LOG_LEVELS: {
            SPLITTING: true,
            WORTHINESS: true,
            API_CALLS: true,
            UI_UPDATES: true,
            DUPLICATES: true
        },
        VERBOSE_MODE: false                     // Less logging for speed
    }
};

// Utility functions for easy access
export const getSplitThreshold = (type) => {
    switch(type) {
        case 'comma': return SENSCRIPT_CONFIG.SPLITTING.SHOULD_PROCESS_NOW.MIN_LENGTH_FOR_COMMA_SPLIT;
        case 'conjunction': return SENSCRIPT_CONFIG.SPLITTING.SHOULD_PROCESS_NOW.MIN_LENGTH_FOR_CONJUNCTION_SPLIT;
        case 'force': return SENSCRIPT_CONFIG.SPLITTING.SHOULD_PROCESS_NOW.MAX_LENGTH_BEFORE_FORCE_SPLIT;
        default: return 40;
    }
};

export const isWorthinessStrict = () => {
    return SENSCRIPT_CONFIG.WORTHINESS.EDUCATIONAL_REQUIREMENTS.STRICT_MODE;
};

export const getMinTextLength = () => {
    return SENSCRIPT_CONFIG.WORTHINESS.MIN_TEXT_LENGTH;
};