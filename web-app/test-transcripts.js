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
    },
    
    // Test 11: MEETING TIP - Chinese business etiquette
    {
        id: 'chinese_business_cards',
        category: 'MEETING TIP',
        text: "在中国商务会议中，交换名片时必须用双手接递，并且要仔细阅读对方的名片。不要立即收起名片，应该放在桌子上显眼的位置。这表示对对方的尊重和重视。",
        expectedCardFront: "中国商务名片礼仪",
        expectedCategory: "MEETING TIP",
        language: 'zh-CN',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 12: PRESENTATION TIP - Portuguese public speaking
    {
        id: 'portuguese_presentation',
        category: 'PRESENTATION TIP', 
        text: "Nas apresentações em português, é importante usar conectivos adequados como 'além disso', 'por outro lado', 'em contrapartida'. Isso torna a apresentação mais fluida e profissional. Evite repetir 'então' ou 'daí' que soam informais demais.",
        expectedCardFront: "Conectivos para apresentações em português",
        expectedCategory: "PRESENTATION TIP",
        language: 'pt-PT',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 13: INTERVIEW TIP - Dutch job interview culture
    {
        id: 'dutch_interview_directness',
        category: 'INTERVIEW TIP',
        text: "In Nederland zijn sollicitatiegesprekken zeer direct. Verwacht vragen zoals 'Wat zijn je zwakke punten?' en geef eerlijke antwoorden. Bescheidenheid wordt gewaardeerd, maar verkoop jezelf niet te kort. Directe communicatie wordt gezien als oprechtheid.",
        expectedCardFront: "Nederlandse sollicitatiecultuur",
        expectedCategory: "INTERVIEW TIP", 
        language: 'nl-NL',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 14: CONCEPT - Russian mathematical concept
    {
        id: 'russian_mathematics',
        category: 'CONCEPT',
        text: "В теории вероятности, закон больших чисел утверждает, что при увеличении количества испытаний средние результаты стремятся к ожидаемому значению. Это фундаментальный принцип, который объясняет, почему казино всегда остается в выигрыше при достаточном количестве игр.",
        expectedCardFront: "Закон больших чисел",
        expectedCategory: "CONCEPT",
        language: 'ru-RU',
        difficulty: 'advanced',
        shouldGenerate: true
    },
    
    // Test 15: WHAT TO SAY - Korean polite expressions
    {
        id: 'korean_politeness',
        category: 'WHAT TO SAY',
        text: "한국어에서 존댓말을 사용할 때 '죄송합니다'는 사과할 때, '감사합니다'는 감사할 때 사용합니다. 비즈니스에서는 '말씀해 주셔서 감사합니다' 또는 '검토해 주시겠습니까?'처럼 높임 표현을 사용하는 것이 중요합니다.",
        expectedCardFront: "한국어 비즈니스 존댓말",
        expectedCategory: "WHAT TO SAY",
        language: 'ko-KR',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 16: AVOID THIS - Arabic cultural mistake
    {
        id: 'arabic_business_culture',
        category: 'AVOID THIS',
        text: "في الاجتماعات التجارية العربية، تجنب استخدام اليد اليسرى لتناول المستندات أو المصافحة. استخدم اليد اليمنى دائماً أو كلتا اليدين. أيضاً، لا تظهر نعل حذائك عند الجلوس، فهذا يعتبر غير مهذب.",
        expectedCardFront: "آداب الاجتماعات التجارية العربية",
        expectedCategory: "AVOID THIS",
        language: 'ar-SA',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 17: KEY FACTS - Greek historical context
    {
        id: 'greek_democracy',
        category: 'KEY FACTS',
        text: "Η αρχαία αθηναϊκή δημοκρατία διέφερε από τη σύγχρονη δημοκρατία. Μόνο οι ελεύθεροι άνδρες πολίτες μπορούσαν να συμμετέχουν, εξαιρώντας γυναίκες, σκλάβους και μετοίκους. Παρόλα αυτά, η ιδέα της άμεσης συμμετοχής των πολιτών στη λήψη αποφάσεων ήταν επαναστατική.",
        expectedCardFront: "Αρχαία αθηναϊκή δημοκρατία",
        expectedCategory: "KEY FACTS",
        language: 'el-GR',
        difficulty: 'advanced',
        shouldGenerate: true
    },
    
    // Test 18: QUICK WIN - Swedish language tip
    {
        id: 'swedish_pronunciation',
        category: 'QUICK WIN',
        text: "I svenskan är skillnaden mellan kött (kött) och kött (köpa) viktig. Det svenska 'ö' uttalas som 'e' i 'her' på engelska. Träna genom att säga 'förr' (before) och 'får' (sheep) - första har 'ö', andra har 'å'.",
        expectedCardFront: "Svenska ö-ljudet",
        expectedCategory: "QUICK WIN",
        language: 'sv-SE',
        difficulty: 'easy',
        shouldGenerate: true
    },
    
    // Test 19: CONCEPT - Norwegian cultural concept
    {
        id: 'norwegian_janteloven',
        category: 'CONCEPT',
        text: "Janteloven er et sett med sosiale normer i nordiske land som understreker ydmykhet og kollektivisme over individuell prestasjoner. 'Du skal ikke tro at du er noe' er et kjerneelement. Dette påvirker hvordan nordmenn kommuniserer i forretningssammenheng - de unngår å skryte og foretrekker understatement.",
        expectedCardFront: "Janteloven og forretningskultur",
        expectedCategory: "CONCEPT",
        language: 'no-NO',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 20: FACT - Finnish education system
    {
        id: 'finnish_education',
        category: 'FACT',
        text: "Suomalainen koulutusjärjestelmä on tunnettu siitä, että oppilaat aloittavat lukemaan vasta 7-vuotiaina, mutta saavuttavat silti korkeita tuloksia PISA-testeissä. Järjestelmä korostaa leikkiä, luovuutta ja kriittistä ajattelua standardoitujen testien sijaan varhaiskasvatuksessa.",
        expectedCardFront: "Suomalainen koulutusmalli",
        expectedCategory: "FACT",
        language: 'fi-FI',
        difficulty: 'medium',
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