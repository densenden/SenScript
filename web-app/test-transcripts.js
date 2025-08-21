/**
 * SenScript Hardcoded Test Transcripts
 * Based on the 8 example cards from CheatCard settings
 * 
 * These simulate realistic transcript inputs that should generate
 * the corresponding card types and content
 */

const testTranscripts = [
    // Test 1: MEETING TIP - "How to handle 'Can you take the lead on this?'"
    {
        id: 'meeting_leadership',
        category: 'MEETING TIP',
        text: "So in today's meeting someone asked me can you take the lead on this project and I wasn't sure how to respond professionally. I think the best approach would be to show enthusiasm while also clarifying what exactly they expect from me in terms of scope and timeline.",
        expectedCardFront: "How to handle \"Can you take the lead on this?\"",
        expectedCategory: "MEETING TIP",
        language: 'en-US',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 2: PRESENTATION TIP - "Handling difficult Q&A questions"  
    {
        id: 'presentation_qa',
        category: 'PRESENTATION TIP',
        text: "During presentations the Q&A session can be really challenging especially when someone asks a question that you don't immediately know the answer to. The key is to buy yourself time to think rather than just saying I don't know or making something up on the spot.",
        expectedCardFront: "Handling difficult Q&A questions",
        expectedCategory: "PRESENTATION TIP",
        language: 'en-US',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 3: INTERVIEW TIP - "How to answer 'Tell me about yourself'"
    {
        id: 'interview_intro',
        category: 'INTERVIEW TIP', 
        text: "The tell me about yourself question is probably the most common interview question and people often struggle with it because they don't know whether to talk about personal life or professional background. The best strategy is to keep it structured professional and relevant to the specific job you're applying for.",
        expectedCardFront: "How to answer \"Tell me about yourself\"?",
        expectedCategory: "INTERVIEW TIP",
        language: 'en-US',
        difficulty: 'easy',
        shouldGenerate: true
    },
    
    // Test 4: QUICK WIN - Biology photosynthesis equation
    {
        id: 'biology_photosynthesis',
        category: 'QUICK WIN',
        text: "For the biology test tomorrow I need to remember the photosynthesis equation. It's six carbon dioxide plus six water plus light energy creates glucose plus six oxygen. The memory trick I use is six and six make sugar and six.",
        expectedCardFront: "Biology test: Photosynthesis equation",
        expectedCategory: "QUICK WIN", 
        language: 'en-US',
        difficulty: 'easy',
        shouldGenerate: true
    },
    
    // Test 5: KEY FACTS - Chemistry periodic table trends
    {
        id: 'chemistry_trends',
        category: 'KEY FACTS',
        text: "In chemistry class we learned about periodic table trends today. Atomic radius decreases as you go from left to right across a period and increases as you go from top to bottom down a group. Ionization energy shows the opposite pattern it increases left to right and decreases top to bottom.",
        expectedCardFront: "Chemistry test: Periodic table trends",
        expectedCategory: "KEY FACTS",
        language: 'en-US', 
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 6: WHAT TO SAY - History World War II causes
    {
        id: 'history_wwii',
        category: 'WHAT TO SAY',
        text: "For the history exam on World War II causes I need to remember that it wasn't just one single factor but multiple interconnected causes. The harshness of the Treaty of Versailles after WWI the global economic depression and the rise of totalitarian regimes in Germany Italy and Japan all contributed to the outbreak of the war.",
        expectedCardFront: "History test: World War II causes",
        expectedCategory: "WHAT TO SAY",
        language: 'en-US',
        difficulty: 'hard', 
        shouldGenerate: true
    },
    
    // Test 7: AVOID THIS - Physics common formula mistakes
    {
        id: 'physics_mistakes',
        category: 'AVOID THIS',
        text: "In physics class the teacher warned us about common mistakes on the exam. Students often confuse F equals ma which is the general force equation with F equals mg which is specifically for weight. Also people forget to check their units and whether their final answer actually makes sense in the real world.",
        expectedCardFront: "Physics test: Common formula mistakes", 
        expectedCategory: "AVOID THIS",
        language: 'en-US',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 8: QUICK WIN - Math trigonometry SOHCAHTOA
    {
        id: 'math_trigonometry',
        category: 'QUICK WIN',
        text: "For trigonometry I always use the memory trick SOHCAHTOA which stands for sine equals opposite over hypotenuse cosine equals adjacent over hypotenuse and tangent equals opposite over adjacent. My teacher taught us the phrase Some Old Hippie Caught Another Hippie Tripping On Acid to remember it.",
        expectedCardFront: "Math test: Trigonometry memory trick",
        expectedCategory: "QUICK WIN",
        language: 'en-US',
        difficulty: 'easy',
        shouldGenerate: true
    },
    
    // Test 9: German test input
    {
        id: 'german_business',
        category: 'MEETING TIP',
        text: "In deutschen Geschäftsmeetings ist es wichtig professionell und strukturiert zu antworten wenn jemand fragt ob du die Projektleitung übernehmen kannst. Am besten zeigst du Enthusiasmus aber klärst gleichzeitig den Umfang und die Zeitlinie ab.",
        expectedCardFront: "Projektleitung übernehmen",
        expectedCategory: "MEETING TIP",
        language: 'de-DE',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 10: Invalid/low-quality input that should be skipped
    {
        id: 'invalid_input',
        category: 'SKIP',
        text: "um ja okay hmm",
        expectedCardFront: null,
        expectedCategory: null,
        language: 'en-US',
        difficulty: 'skip',
        shouldGenerate: false
    }
];

/**
 * Get all test transcripts or filter by criteria
 */
function getTestTranscripts(filters = {}) {
    let filtered = testTranscripts;
    
    if (filters.language) {
        filtered = filtered.filter(t => t.language === filters.language);
    }
    
    if (filters.difficulty) {
        filtered = filtered.filter(t => t.difficulty === filters.difficulty);
    }
    
    if (filters.shouldGenerate !== undefined) {
        filtered = filtered.filter(t => t.shouldGenerate === filters.shouldGenerate);
    }
    
    if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
    }
    
    return filtered;
}

/**
 * Get a specific test transcript by ID
 */
function getTestTranscript(id) {
    return testTranscripts.find(t => t.id === id);
}

/**
 * Get test transcripts that should generate cards
 */
function getValidTestTranscripts() {
    return getTestTranscripts({ shouldGenerate: true });
}

/**
 * Get test transcripts that should be skipped
 */
function getInvalidTestTranscripts() {
    return getTestTranscripts({ shouldGenerate: false });
}

/**
 * Get test statistics
 */
function getTestStats() {
    const total = testTranscripts.length;
    const valid = testTranscripts.filter(t => t.shouldGenerate).length;
    const invalid = testTranscripts.filter(t => !t.shouldGenerate).length;
    const languages = [...new Set(testTranscripts.map(t => t.language))];
    const categories = [...new Set(testTranscripts.map(t => t.category))];
    
    return {
        total,
        valid,
        invalid,
        languages,
        categories,
        byLanguage: languages.reduce((acc, lang) => {
            acc[lang] = testTranscripts.filter(t => t.language === lang).length;
            return acc;
        }, {}),
        byCategory: categories.reduce((acc, cat) => {
            acc[cat] = testTranscripts.filter(t => t.category === cat).length;
            return acc;
        }, {})
    };
}

// Export functions for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testTranscripts,
        getTestTranscripts,
        getTestTranscript,
        getValidTestTranscripts,
        getInvalidTestTranscripts,
        getTestStats
    };
} else {
    window.TestTranscripts = {
        testTranscripts,
        getTestTranscripts,
        getTestTranscript,
        getValidTestTranscripts,
        getInvalidTestTranscripts,
        getTestStats
    };
}