/**
 * SenScript Hardcoded Test Transcripts
 * Based on the 8 example cards from CheatCard settings
 * 
 * These simulate realistic transcript inputs that should generate
 * the corresponding card types and content
 */

const testTranscripts = [
    // Test 1: MEETING TIP - English negotiation scenario
    {
        id: 'meeting_negotiation',
        category: 'MEETING TIP',
        text: "During budget negotiations, when someone says we can't afford this feature, I've learned to ask 'What would it take to make this possible?' instead of accepting a no. This shifts the conversation from limitations to creative problem-solving and often reveals alternative approaches.",
        expectedCardFront: "How to handle budget rejections in meetings",
        expectedCategory: "MEETING TIP",
        language: 'en-US',
        difficulty: 'advanced',
        shouldGenerate: true
    },
    
    // Test 2: PRESENTATION TIP - Spanish business context
    {
        id: 'presentation_spanish',
        category: 'PRESENTATION TIP',
        text: "En las presentaciones de negocio en español, es crucial usar el subjuntivo correctamente cuando presentas hipótesis o recomendaciones. Por ejemplo, 'Sugiero que consideremos esta opción' suena mucho más profesional que el indicativo.",
        expectedCardFront: "Presentaciones profesionales en español",
        expectedCategory: "PRESENTATION TIP",
        language: 'es-ES',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 3: INTERVIEW TIP - Technical interview scenario
    {
        id: 'technical_interview',
        category: 'INTERVIEW TIP', 
        text: "When they ask about a technology you haven't used, don't just say you don't know it. Instead say 'I haven't worked with that specific technology, but I have experience with similar tools like X and Y, and I'm confident I could quickly learn it because...' then explain your learning approach.",
        expectedCardFront: "Handling unknown tech in interviews",
        expectedCategory: "INTERVIEW TIP",
        language: 'en-US',
        difficulty: 'hard',
        shouldGenerate: true
    },
    
    // Test 4: QUICK WIN - French grammar rule
    {
        id: 'french_grammar',
        category: 'QUICK WIN',
        text: "Pour retenir l'accord du participe passé avec être, j'utilise la phrase mnémotechnique 'Avec être, toujours s'accorder comme un couple amoureux.' Exemple: elle est venue, ils sont partis, nous sommes arrivés.",
        expectedCardFront: "Accord du participe passé avec être",
        expectedCategory: "QUICK WIN", 
        language: 'fr-FR',
        difficulty: 'easy',
        shouldGenerate: true
    },
    
    // Test 5: KEY FACTS - Medical terminology
    {
        id: 'medical_terminology',
        category: 'KEY FACTS',
        text: "In medical terminology, understanding root words is essential. 'Cardio' refers to heart, 'pulmonary' to lungs, 'hepatic' to liver, and 'renal' to kidneys. These roots appear in hundreds of medical terms, so memorizing them early saves enormous time later in medical studies.",
        expectedCardFront: "Essential medical root words",
        expectedCategory: "KEY FACTS",
        language: 'en-US', 
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 6: WHAT TO SAY - Customer service scenario
    {
        id: 'customer_service',
        category: 'WHAT TO SAY',
        text: "When a customer is angry about a delayed order, never start with 'I understand your frustration' because it sounds scripted. Instead try 'That's absolutely not the experience we want for you. Let me see exactly what happened and how we can fix this right now.'",
        expectedCardFront: "Responding to angry customers about delays",
        expectedCategory: "WHAT TO SAY",
        language: 'en-US',
        difficulty: 'medium', 
        shouldGenerate: true
    },
    
    // Test 7: AVOID THIS - German cultural business mistake
    {
        id: 'german_business_culture',
        category: 'AVOID THIS',
        text: "Bei deutschen Geschäftsterminen solltest du niemals zu spät kommen, auch nicht 'nur' fünf Minuten. Pünktlichkeit wird hier als Zeichen von Respekt und Professionalität gesehen. Plane lieber 10 Minuten früher an und warte im Auto oder Café.",
        expectedCardFront: "Pünktlichkeit in deutschen Meetings",
        expectedCategory: "AVOID THIS",
        language: 'de-DE',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 8: CONCEPT - Japanese language learning strategy
    {
        id: 'japanese_learning',
        category: 'CONCEPT',
        text: "日本語を学ぶ時、漢字の部首（radical）を理解することが重要です。例えば「氵」(さんずい)は水に関する漢字に使われます：海、川、湖。部首を覚えると、新しい漢字の意味を推測できるようになります。",
        expectedCardFront: "漢字の部首学習法",
        expectedCategory: "CONCEPT",
        language: 'ja-JP',
        difficulty: 'advanced',
        shouldGenerate: true
    },
    
    // Test 9: QUICK WIN - Programming debugging tip
    {
        id: 'debugging_technique',
        category: 'QUICK WIN',
        text: "The rubber duck debugging method works because explaining your code line by line to an inanimate object forces you to slow down and think through the logic. I keep a small rubber duck on my desk and it's helped me catch bugs faster than code reviews sometimes.",
        expectedCardFront: "Rubber duck debugging method",
        expectedCategory: "QUICK WIN",
        language: 'en-US',
        difficulty: 'practical',
        shouldGenerate: true
    },
    
    // Test 10: FACT - Italian cooking technique
    {
        id: 'italian_cooking',
        category: 'FACT',
        text: "Nel risotto autentico, non si deve mai lavare il riso prima della cottura perché l'amido superficiale è essenziale per creare la cremosità. Il segreto è tostare il riso per due minuti prima di aggiungere il brodo caldo, poco alla volta, mescolando costantemente.",
        expectedCardFront: "Tecnica del risotto autentico",
        expectedCategory: "FACT",
        language: 'it-IT',
        difficulty: 'cultural',
        shouldGenerate: true
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