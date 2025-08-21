// CheatCard Categories and Configurations
export const CHEATCARD_CATEGORIES = {
  'INTERVIEW TIP': {
    name: 'Interview Tip',
    icon: '💡',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Strategic advice for handling specific interview questions'
  },
  'KEY FACTS': {
    name: 'Key Facts',
    icon: '📊',
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Important data points to mention during interviews'
  },
  'QUICK WIN': {
    name: 'Quick Win',
    icon: '⚡',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    description: 'Simple tactics that impress interviewers'
  },
  'WHAT TO SAY': {
    name: 'What to Say',
    icon: '✅',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Recommended phrases and talking points'
  },
  'AVOID THIS': {
    name: 'Avoid This',
    icon: '⚠️',
    color: 'bg-red-100 text-red-700 border-red-200',
    description: 'Common mistakes and what not to say'
  },
  'CONCEPT': {
    name: 'Concept',
    icon: '🧠',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Key concepts and definitions'
  },
  'MEETING TIP': {
    name: 'Meeting Tip',
    icon: '🎯',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    description: 'Strategic meeting and presentation advice'
  }
} as const;

export const SUPPORTED_LANGUAGES = {
  'de-DE': { name: 'German', flag: '🇩🇪' },
  'en-US': { name: 'English', flag: '🇺🇸' },
  'fr-FR': { name: 'French', flag: '🇫🇷' },
  'es-ES': { name: 'Spanish', flag: '🇪🇸' },
  'it-IT': { name: 'Italian', flag: '🇮🇹' },
  'pt-PT': { name: 'Portuguese', flag: '🇵🇹' },
  'nl-NL': { name: 'Dutch', flag: '🇳🇱' },
  'ru-RU': { name: 'Russian', flag: '🇷🇺' },
  'zh-CN': { name: 'Chinese', flag: '🇨🇳' },
  'ja-JP': { name: 'Japanese', flag: '🇯🇵' },
  'ko-KR': { name: 'Korean', flag: '🇰🇷' },
  'ar-SA': { name: 'Arabic', flag: '🇸🇦' },
  'el-GR': { name: 'Greek', flag: '🇬🇷' }
} as const;

export const INTERVIEW_TYPES = {
  'technical': {
    name: 'Technical Interview',
    icon: '💻',
    description: 'Coding, system design, and technical problem-solving'
  },
  'behavioral': {
    name: 'Behavioral Interview',
    icon: '🤝',
    description: 'Communication, teamwork, and situational questions'
  },
  'industry': {
    name: 'Industry Interview',
    icon: '🏢',
    description: 'Domain knowledge and industry-specific expertise'
  }
} as const;

export const PRICING_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    currency: '€',
    interval: 'month',
    minutes: 90,
    features: [
      'Basic flashcards',
      'Export to JSON',
      '13 languages supported',
      'Basic CheatCard mode'
    ],
    limitations: [
      'Limited CheatCard categories',
      'Basic export formats only'
    ]
  },
  ESSENTIAL: {
    name: 'Essential',
    price: 9.99,
    currency: '€',
    interval: 'month',
    minutes: 200,
    overage: 0.066,
    stripeProductId: 'senscript_essential',
    features: [
      'Full CheatCard mode',
      'All interview categories',
      'Multiple export formats',
      'Priority processing',
      'Advanced AI models'
    ]
  },
  PREMIUM: {
    name: 'Premium',
    price: 17.99,
    currency: '€',
    interval: 'month',
    minutes: 500,
    overage: 0.066,
    stripeProductId: 'senscript_premium',
    features: [
      'Advanced CheatCards',
      'Custom templates',
      'Industry-specific modes',
      'Priority AI processing',
      'Team features (coming soon)',
      'Advanced analytics'
    ]
  },
  RELOAD: {
    name: 'Reload 15',
    price: 1.00,
    currency: '€',
    minutes: 15,
    stripeProductId: 'senscript_reload15',
    type: 'one-time'
  }
} as const;

export const DEMO_SCENARIOS = {
  quantum_physics: {
    title: 'Quantum Physics Lecture',
    content: 'Today we explore quantum superposition and entanglement, examining how particles can exist in multiple states simultaneously. Professor Leif asks: What is the significance of the Heisenberg uncertainty principle? How does entanglement challenge locality? Let\'s write wavefunctions and analyze interference patterns.',
    language: 'en-US',
    expectedCards: [
      {
        category: 'CONCEPT',
        front: 'What is quantum superposition and its significance in quantum mechanics?',
        back: 'Quantum superposition allows particles to exist in multiple states simultaneously until measured. This principle, along with the Heisenberg uncertainty principle, forms the foundation of quantum mechanics by showing that certain pairs of properties cannot be simultaneously known with perfect precision.'
      }
    ]
  },
  technical_interview: {
    title: 'Technical Interview - REST vs GraphQL',
    content: 'Let\'s dive into some technical questions. Can you explain the difference between REST and GraphQL? When would you choose one over the other? Now, tell me about a time you had to optimize a slow database query. What was your approach?',
    language: 'en-US',
    mode: 'interview',
    expectedCards: [
      {
        category: 'INTERVIEW TIP',
        front: 'How to differentiate between REST and GraphQL in a technical interview?',
        back: 'Explain that REST uses fixed endpoints for resources while GraphQL allows flexible queries. Choose REST for simple CRUD operations and caching benefits. Choose GraphQL for complex data requirements and when you need to minimize over-fetching. Mention practical experience with both approaches.'
      }
    ]
  },
  startup_pitch: {
    title: 'Startup Funding Interview',
    content: 'Alright, so you\'re asking for 2 million dollars. Let\'s see if you\'ve done your homework. What\'s your customer acquisition cost? How do you plan to scale this? I see here you have competitors - what makes you different? And frankly, your burn rate concerns me. How long will this funding actually last you?',
    language: 'en-US',
    mode: 'interview',
    expectedCards: [
      {
        category: 'INTERVIEW TIP',
        front: 'How to respond to questions about customer acquisition cost, scaling plans, and burn rate when seeking funding?',
        back: 'Provide concrete data on acquisition costs, growth plans, competitive advantages, financial sustainability, and profitability projections. Demonstrating clear metrics and viable path to profitability instills investor confidence.'
      }
    ]
  },
  german_culture: {
    title: 'German Business Culture',
    content: 'In deutschen Unternehmen ist Pünktlichkeit sehr wichtig. Meetings beginnen immer pünktlich und Verspätungen werden nicht toleriert. Außerdem ist die Hierarchie klar definiert - man spricht Vorgesetzte mit Sie an und wartet, bis man zum Du eingeladen wird. Diese kulturellen Normen sind entscheidend für den Geschäftserfolg.',
    language: 'de-DE',
    expectedCards: [
      {
        category: 'KEY FACTS',
        front: 'What are key aspects of German business culture regarding punctuality and hierarchy?',
        back: 'In German companies, punctuality is crucial - meetings start on time and delays are not tolerated. Hierarchy is clearly defined with formal address (Sie) for supervisors until invited to use informal address (Du). These cultural norms are decisive for business success.'
      }
    ]
  }
} as const;

export const FEATURES = [
  {
    icon: '🎤',
    title: 'Universal Audio Capture',
    description: 'Works with Teams, Zoom, lectures, phone calls, and any audio source'
  },
  {
    icon: '🌍',
    title: '13 Languages Supported',
    description: 'Auto-detection with real-time processing in multiple languages'
  },
  {
    icon: '🎯',
    title: 'CheatCard Interview Mode',
    description: 'Strategic interview preparation with tactical response cards'
  },
  {
    icon: '⚡',
    title: 'Real-Time Processing',
    description: 'Sub-3-second card generation while you listen'
  },
  {
    icon: '🔒',
    title: 'Privacy-First',
    description: 'Local processing option with optional cloud AI'
  },
  {
    icon: '📤',
    title: 'Export Anywhere',
    description: 'Anki, CSV, JSON formats for all your study tools'
  }
] as const;

export const FOOTER_LINKS = {
  company: {
    name: 'Studio Sen',
    linktree: 'https://sen.studio',
    development: 'https://dev.sen.studio'
  },
  legal: {
    imprint: 'https://sen.studio/legal/imprint',
    privacy: 'https://sen.studio/legal/privacy',
    terms: 'https://sen.studio/legal/terms'
  },
  social: {
    github: 'https://github.com/studio-sen',
    twitter: '@studio_sen'
  }
} as const;

export type CheatCardCategory = keyof typeof CHEATCARD_CATEGORIES;
export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;
export type InterviewType = keyof typeof INTERVIEW_TYPES;
export type PricingTier = keyof typeof PRICING_TIERS;