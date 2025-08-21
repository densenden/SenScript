/**
 * SenScript Hardcoded Test Transcripts
 * Based on the 8 example cards from CheatCard settings
 * 
 * These simulate realistic transcript inputs that should generate
 * the corresponding card types and content
 */

const testTranscripts = [
    // Test 1: Business Meeting Recording - Budget Discussion
    {
        id: 'meeting_negotiation',
        scenario: 'Business Meeting',
        text: "So, um, looking at our Q3 budget here... yeah, we've got about 50K allocated for new features. Now, when stakeholders push back and say, oh we can't afford that new dashboard feature, right? Here's what I've learned over the years - instead of just accepting the no, try reframing it. Ask them, okay, what would it take to make this possible? You know, maybe we can phase it, or find budget from somewhere else. It completely changes the dynamic of the conversation, trust me on this one.",
        expectedCategory: "MEETING TIP",
        language: 'en-US',
        difficulty: 'advanced',
        shouldGenerate: true
    },
    
    // Test 2: Spanish Business Presentation Coach
    {
        id: 'presentation_spanish',
        scenario: 'Presentation Training',
        text: "Bueno, entonces cuando estás presentando en un contexto profesional, ¿vale? Es muy importante, muy muy importante que uses el subjuntivo correctamente. Mira, por ejemplo, nunca digas 'sugiero que consideras esta opción' - eso suena fatal. Tienes que decir 'sugiero que consideres' o mejor aún, 'sugiero que consideremos'. ¿Ves la diferencia? Es sutil pero marca totalmente tu nivel de profesionalismo en español.",
        expectedCategory: "PRESENTATION TIP",
        language: 'es-ES',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 3: Tech Interview Prep Session
    {
        id: 'technical_interview',
        scenario: 'Interview Coaching',
        text: "Alright, so here's a common scenario in tech interviews - they'll throw a technology at you that you've never used, like, let's say they ask about Kubernetes and you've never touched it. The worst thing you can do is just say 'I don't know Kubernetes.' Instead, here's the strategy: acknowledge it honestly but pivot to related experience. Say something like, 'While I haven't worked directly with Kubernetes, I have extensive experience with Docker and AWS ECS, which share similar containerization concepts. I'm confident I could ramp up quickly on Kubernetes because I understand the underlying principles of container orchestration.'",
        expectedCategory: "INTERVIEW TIP",
        language: 'en-US',
        difficulty: 'hard',
        shouldGenerate: true
    },
    
    // Test 4: French Language Class
    {
        id: 'french_grammar',
        scenario: 'Language Classroom',
        text: "Alors, aujourd'hui on va parler du participe passé, d'accord? C'est un point qui pose toujours problème. Écoutez bien - avec l'auxiliaire être, le participe passé s'accorde TOUJOURS. Toujours, toujours, toujours! J'ai un petit truc pour vous... pensez à un couple amoureux, ils doivent toujours s'accorder, n'est-ce pas? Donc: elle est venue, ils sont partis, nous sommes arrivées si ce sont des filles. C'est logique, non?",
        expectedCategory: "QUICK WIN", 
        language: 'fr-FR',
        difficulty: 'easy',
        shouldGenerate: true
    },
    
    // Test 5: Medical School Lecture
    {
        id: 'medical_terminology',
        scenario: 'University Lecture',
        text: "So, as we dive into medical terminology this semester, I cannot stress enough how important it is to master the root words early on. Let me give you the big four that you'll see constantly: 'cardio' - that's everything related to the heart, okay? Then we have 'pulmonary' - that's your lungs. 'Hepatic' refers to the liver, and 'renal' is kidneys. These four roots alone will appear in, oh, probably hundreds of terms you'll encounter. If you learn these now, you'll thank me during your board exams, I promise you that.",
        expectedCategory: "KEY FACTS",
        language: 'en-US', 
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 6: Customer Service Training Video
    {
        id: 'customer_service',
        scenario: 'Training Video',
        text: "Welcome back to module three of customer service excellence. Now, let's talk about handling angry customers, specifically when orders are delayed. Here's what NOT to do - don't start with that canned phrase 'I understand your frustration.' Customers can smell that script from a mile away. Instead, try this approach: acknowledge the problem immediately and take ownership. Say something like, 'That's absolutely not the experience we want for you. Let me pull up your order right now and see exactly what happened.' See the difference? You're showing action, not just empathy.",
        expectedCategory: "WHAT TO SAY",
        language: 'en-US',
        difficulty: 'medium', 
        shouldGenerate: true
    },
    
    // Test 7: German Business Culture Podcast
    {
        id: 'german_business_culture',
        scenario: 'Business Podcast',
        text: "Ja, also wenn wir über deutsche Geschäftskultur sprechen, muss ich wirklich betonen - Pünktlichkeit ist kein Scherz hier. Ich hatte mal einen amerikanischen Kollegen, der dachte, fünf Minuten Verspätung wären okay, 'nur fünf Minuten', sagte er. Großer Fehler! In Deutschland ist das respektlos. Mein Tipp? Plant immer zehn Minuten Puffer ein. Kommt lieber zu früh und wartet im Auto oder in einem Café in der Nähe. Das zeigt Professionalität und Respekt für die Zeit der anderen.",
        expectedCategory: "AVOID THIS",
        language: 'de-DE',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 8: Japanese Language TV Show
    {
        id: 'japanese_learning',
        scenario: 'Educational TV Show',
        text: "はい、みなさん、こんにちは！今日は漢字の勉強のコツについて話しましょう。えーっと、漢字を効率的に学ぶには、部首を理解することがとても大切なんですよ。例えば、この「氵」、さんずいって言いますが、これは水に関係する漢字に使われるんです。ほら、海、川、湖、全部水に関係してるでしょう？部首が分かれば、知らない漢字でも意味が推測できるようになるんです。便利でしょう？",
        expectedCategory: "CONCEPT",
        language: 'ja-JP',
        difficulty: 'advanced',
        shouldGenerate: true
    },
    
    // Test 9: Tech Conference Talk
    {
        id: 'debugging_technique',
        scenario: 'Conference Talk',
        text: "So, quick show of hands - who's heard of rubber duck debugging? Okay, a few of you. For those who haven't, this is gonna sound weird but stick with me. You literally keep a rubber duck on your desk, and when you're stuck on a bug, you explain your code to the duck. Line by line. Out loud. I know, I know, it sounds crazy! But here's why it works - when you verbalize your logic, you're forced to slow down and really think through each step. Your brain processes it differently. I've been doing this for five years now, and honestly? Sometimes the duck finds bugs faster than my code reviews. Try it!",
        expectedCategory: "QUICK WIN",
        language: 'en-US',
        difficulty: 'practical',
        shouldGenerate: true
    },
    
    // Test 10: Italian Cooking Show
    {
        id: 'italian_cooking',
        scenario: 'TV Cooking Show',
        text: "Allora, oggi prepariamo un risotto perfetto, va bene? Prima cosa importantissima - mai, mai, MAI lavare il riso! Lo so, lo so, molti di voi pensano che bisogna lavarlo, ma no! L'amido sulla superficie del riso è quello che crea la cremosità. È fondamentale! Guardate, prima tostiamo il riso per due minuti... sentite questo profumo? Poi aggiungiamo il brodo, ma attenzione - sempre caldo, e poco alla volta. Un mestolo, mescoliamo, aspettiamo che assorba, poi un altro mestolo. Pazienza, eh? Il risotto non si fa di fretta!",
        expectedCategory: "FACT",
        language: 'it-IT',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 11: Chinese Business Culture Webinar
    {
        id: 'chinese_business_cards',
        scenario: 'Business Webinar',
        text: "大家好，欢迎来到今天的商务礼仪讲座。那么，我们先讲一个很重要的细节 - 名片交换。在中国做生意啊，交换名片不是随便的事。首先，一定要双手递上，双手接受，这是基本礼貌。拿到名片后呢，不要马上塞进口袋！要仔细看一看，表示你对对方的重视。然后把名片放在桌子上，放在你面前，这样在整个会议过程中都能看到。这些小细节很重要的！",
        expectedCategory: "MEETING TIP",
        language: 'zh-CN',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 12: Portuguese Public Speaking Workshop
    {
        id: 'portuguese_presentation',
        scenario: 'Speaking Workshop', 
        text: "Bom, vamos falar sobre apresentações profissionais em português. Uma coisa que vejo muito é que as pessoas ficam repetindo 'então', 'daí', 'tipo assim'... Isso soa muito informal, não é? Para uma apresentação profissional, vocês precisam usar conectivos mais elaborados. Por exemplo: 'além disso' quando querem adicionar informação, 'por outro lado' para contrastar ideias, 'em contrapartida' para mostrar o outro lado da questão. Vejam como isso dá muito mais fluidez e credibilidade à vossa apresentação. Vamos praticar?",
        expectedCategory: "PRESENTATION TIP",
        language: 'pt-PT',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 13: Dutch Career Counseling Session
    {
        id: 'dutch_interview_directness',
        scenario: 'Career Counseling',
        text: "Oké, dus je hebt volgende week een sollicitatiegesprek? Mooi! Laat me je voorbereiden op de Nederlandse stijl. Hier zijn we heel direct, hè? Verwacht geen small talk van een half uur. Ze komen meteen ter zake. Ze gaan je vragen: 'Wat zijn je zwakke punten?' En dan moet je echt eerlijk zijn! Niet dat Amerikaanse gedoe van 'Oh, ik ben een perfectionist.' Nee, geef een echt zwak punt, maar leg dan uit hoe je eraan werkt. Nederlanders waarderen eerlijkheid enorm. Maar let op - wees niet té bescheiden. Je moet wel je sterke punten verkopen, maar zonder te overdrijven. Het is een balans, snap je?",
        expectedCategory: "INTERVIEW TIP", 
        language: 'nl-NL',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 14: Russian Mathematics Lecture
    {
        id: 'russian_mathematics',
        scenario: 'University Lecture',
        text: "Добрый день, студенты. Сегодня мы рассмотрим очень важную концепцию - закон больших чисел. Это, можно сказать, один из краеугольных камней теории вероятности. О чём он говорит? Представьте - вы бросаете монетку. Один раз, два, три... чем больше вы бросаете, тем ближе средний результат к 50%. Это и есть закон больших чисел! Почему это важно? Ну, вот почему казино всегда выигрывает в долгосрочной перспективе...",
        expectedCategory: "CONCEPT",
        language: 'ru-RU',
        difficulty: 'advanced',
        shouldGenerate: true
    },
    
    // Test 15: Korean Business Language Class
    {
        id: 'korean_politeness',
        scenario: 'Language Class',
        text: "안녕하세요, 여러분. 오늘은 비즈니스 한국어를 배워볼게요. 어, 많은 외국인들이 어려워하는 게 바로 존댓말이죠. 예를 들어볼게요. 사과할 때 '미안해요'라고 하면 친구한테는 괜찮아요. 하지만 비즈니스에서는? '죄송합니다'라고 해야 해요. 또, 감사할 때도 '고마워요'가 아니라 '감사합니다'입니다. 이게 기본이에요. 그리고 비즈니스 상황에서는 '말씀해 주셔서 감사합니다', '검토해 주시겠습니까?' 이렇게 더 정중하게 표현해야 해요. 알겠죠?",
        expectedCategory: "WHAT TO SAY",
        language: 'ko-KR',
        difficulty: 'medium',
        shouldGenerate: true
    },
    
    // Test 16: Arabic Business Etiquette Training
    {
        id: 'arabic_business_culture',
        scenario: 'Cultural Training',
        text: "مرحباً بكم في ورشة الآداب التجارية. اليوم سنتحدث عن أخطاء شائعة يرتكبها رجال الأعمال الغربيون. أولاً - اليد اليسرى. هل تعلمون أن اليد اليسرى تعتبر غير نظيفة في ثقافتنا؟ لا تستخدموها أبداً للمصافحة أو إعطاء المستندات. استخدموا اليد اليمنى دائماً. ونقطة أخرى مهمة - عندما تجلسون، لا تظهروا نعل الحذاء. هذا يعتبر إهانة! اجلسوا بطريقة لا يواجه فيها نعل حذائكم أي شخص.",
        expectedCategory: "AVOID THIS",
        language: 'ar-SA',
        difficulty: 'cultural',
        shouldGenerate: true
    },
    
    // Test 17: Greek History Documentary
    {
        id: 'greek_democracy',
        scenario: 'History Documentary',
        text: "Καλωσορίσατε στο ντοκιμαντέρ μας για την αρχαία Αθήνα. Ξέρετε, όταν μιλάμε για δημοκρατία σήμερα, μιλάμε για κάτι πολύ διαφορετικό από την αρχαία αθηναϊκή δημοκρατία. Στην αρχαία Αθήνα, μόνο οι ελεύθεροι άνδρες πολίτες είχαν δικαίωμα ψήφου. Οι γυναίκες; Όχι. Οι σκλάβοι; Όχι. Οι ξένοι, οι μέτοικοι; Επίσης όχι. Αλλά - και αυτό είναι το σημαντικό - παρά τους περιορισμούς της, η ιδέα της άμεσης συμμετοχής των πολιτών ήταν επαναστατική για την εποχή της.",
        expectedCategory: "KEY FACTS",
        language: 'el-GR',
        difficulty: 'advanced',
        shouldGenerate: true
    },
    
    // Test 18: Swedish Language YouTube Tutorial
    {
        id: 'swedish_pronunciation',
        scenario: 'YouTube Tutorial',
        text: "Hej allihopa! Välkommen till dagens svenska lektion! Okej, många av er har problem med 'ö'-ljudet, eller hur? Så här - det är inte som 'o' på engelska. Det är mer som 'e' i 'her' eller 'bird', men med rundade läppar. Titta här... 'ööö'. Prova nu! Ett bra knep är att jämföra ord. Säg 'förr' - det betyder 'before'. Nu säg 'får' - det betyder 'sheep'. Hör ni skillnaden? 'Förr' har 'ö', 'får' har 'å'. Öva dessa två ord hemma, det hjälper jättemycket!",
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
    },
    
    // German Test 1: Client Technical Questions
    {
        id: 'german_tech_grilling',
        scenario: 'Client Technical Meeting',
        text: "So, Sie sind also unser neuer Entwickler? Gut, dann erklären Sie mir doch mal: Wie funktioniert eigentlich State Management in React? Und warum sollten wir Redux verwenden statt einfach nur useState? Ich habe gehört, dass es auch andere Lösungen gibt wie Zustand oder Context API. Was ist denn da der Unterschied? Und noch eine Frage: Wie gehen Sie mit Performance-Problemen um, wenn die App langsam wird?",
        expectedCategory: "WHAT TO SAY",
        language: 'de-DE',
        difficulty: 'challenging',
        shouldGenerate: true
    },
    
    // German Test 2: Boss Project Review
    {
        id: 'german_boss_questions',
        scenario: 'Project Review Meeting',
        text: "Also, ich schaue mir hier die Zahlen für Ihr Projekt an... Können Sie mir erklären, warum wir schon 3 Wochen im Verzug sind? Was ist da schiefgelaufen? Und wie wollen Sie das wieder aufholen? Ich brauche konkrete Lösungen, nicht nur Entschuldigungen. Die Geschäftsleitung will morgen Antworten. Also, was schlagen Sie vor? Wie stellen Sie sicher, dass so etwas nicht wieder passiert?",
        expectedCategory: "MEETING TIP",
        language: 'de-DE',
        difficulty: 'stressful',
        shouldGenerate: true
    },
    
    // German Test 3: Professor Oral Exam
    {
        id: 'german_exam_pressure',
        scenario: 'University Oral Exam',
        text: "Gut, kommen wir zur mündlichen Prüfung. Erklären Sie mir doch bitte das Konzept der Quantenverschränkung. Wie funktioniert das genau? Und was hat Einstein damit gemeint, als er von 'spukhafter Fernwirkung' sprach? Können Sie mir ein praktisches Beispiel geben? Und welche Bedeutung hat das für die moderne Physik? Zeit haben Sie zwei Minuten für die Antwort.",
        expectedCategory: "CONCEPT",
        language: 'de-DE',
        difficulty: 'exam',
        shouldGenerate: true
    },
    
    // English Test 1: Investor Pitch Questions
    {
        id: 'english_investor_grilling',
        scenario: 'Investor Pitch Meeting',
        text: "Alright, so you're asking for 2 million dollars. Let's see if you've done your homework. What's your customer acquisition cost? How do you plan to scale this? I see here you have competitors - what makes you different? And frankly, your burn rate concerns me. How long will this funding actually last you? Give me some hard numbers. What's your path to profitability? Because I've seen too many startups with great ideas but no business sense.",
        expectedCategory: "WHAT TO SAY",
        language: 'en-US',
        difficulty: 'high-pressure',
        shouldGenerate: true
    },
    
    // English Test 2: Doctor Medical Questions
    {
        id: 'english_medical_questioning',
        scenario: 'Medical Consultation',
        text: "I need to ask you some questions about your symptoms. When did this pain start exactly? Is it constant or does it come and go? On a scale of 1 to 10, how would you rate it? Does anything make it worse? Better? Have you taken any medications for it? Any family history of similar problems? Are you experiencing any other symptoms - nausea, dizziness, shortness of breath? I need you to be very specific here.",
        expectedCategory: "WHAT TO SAY",
        language: 'en-US',
        difficulty: 'medical',
        shouldGenerate: true
    },
    
    // English Test 3: Technical Job Interview
    {
        id: 'english_tech_interview',
        scenario: 'Senior Developer Interview',
        text: "Let's dive into some technical questions. Can you explain the difference between REST and GraphQL? When would you choose one over the other? Now, tell me about a time you had to optimize a slow database query. What was your approach? And here's a scenario: your API is getting 10x more traffic than expected and response times are slow. Walk me through how you'd diagnose and fix this. You have 5 minutes.",
        expectedCategory: "INTERVIEW TIP",
        language: 'en-US',
        difficulty: 'technical',
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