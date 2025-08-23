'use client';

import CheatCard from '../ui/CheatCard';

const sampleCheatCards = [
  {
    category: 'INTERVIEW TIP' as const,
    front: 'How to respond to questions about customer acquisition cost, scaling plans, and burn rate when seeking startup funding?',
    back: 'Provide concrete data on acquisition costs, growth plans, competitive advantages, financial sustainability, and profitability projections. Demonstrating clear metrics and viable path to profitability instills investor confidence.',
    interviewType: 'industry' as const,
    difficulty: 'advanced' as const,
    tags: ['startup', 'funding', 'metrics']
  },
  {
    category: 'QUICK WIN' as const,
    front: 'How can you improve your pronunciation of the "ö" sound in Swedish during a language interview?',
    back: 'Practice "förr" (before) vs "får" (sheep) - "ö" is like "e" in "her" but with rounded lips. This demonstrates attention to detail and language precision.',
    flag: '🇸🇪',
    interviewType: 'behavioral' as const,
    difficulty: 'intermediate' as const,
    tags: ['language', 'pronunciation', 'swedish']
  },
  {
    category: 'KEY FACTS' as const,
    front: 'What notable fact about Finnish education system should you mention in an education interview?',
    back: 'Finnish students start reading at 7 but excel in PISA tests due to emphasis on play, creativity, and critical thinking over standardized testing in early education.',
    flag: '🇫🇮',
    interviewType: 'industry' as const,
    difficulty: 'intermediate' as const,
    tags: ['education', 'finland', 'pisa']
  },
  {
    category: 'WHAT TO SAY' as const,
    front: 'Best way to explain a complex technical concept in a non-technical interview?',
    back: 'Use the "analogy bridge" method: Start with a familiar concept, draw clear parallels, then explain why this matters to the business. Example: "APIs are like restaurant menus - they show what\'s available without revealing how the kitchen works."',
    interviewType: 'technical' as const,
    difficulty: 'intermediate' as const,
    tags: ['communication', 'analogies', 'technical']
  },
  {
    category: 'AVOID THIS' as const,
    front: 'What should you NEVER say when asked about salary expectations?',
    back: 'Never say "I\'m flexible" or "Whatever you think is fair." This signals you undervalue yourself. Instead: "Based on my research and experience, I\'m looking for X to Y range, but I\'m open to discussing the total compensation package."',
    interviewType: 'behavioral' as const,
    difficulty: 'beginner' as const,
    tags: ['salary', 'negotiation', 'mistakes']
  },
  {
    category: 'INTERVIEW TIP' as const,
    front: 'How to handle behavioral questions about failure or mistakes?',
    back: 'Use the SOAR method: Situation (brief context), Obstacle (what went wrong), Action (specific steps taken), Result (what you learned). Focus 70% on actions and learning, 30% on the problem. Always end with how this made you better.',
    interviewType: 'behavioral' as const,
    difficulty: 'intermediate' as const,
    tags: ['behavioral', 'failure', 'soar']
  }
];

export default function CheatCardShowcase() {
  return (
    <section className="content-max-width-large">
      <div className="glass p-8 rounded-3xl">
        <div className="content-center space-large">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="material-symbols-outlined icon-xl text-orange-500">
              psychology
            </span>
            <h2 className="text-3xl font-bold">CheatCard Intelligence</h2>
          </div>
          <p className="text-xl opacity-80 max-w-3xl mx-auto">
            Unlike basic flashcards, CheatCards provide strategic interview ammunition. 
            Each card is designed to give you the competitive edge in any conversation.
          </p>
        </div>
        
        {/* CheatCard Categories */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6 text-center">Five Strategic Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col items-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="material-symbols-outlined icon-lg text-blue-500 mb-2">
                lightbulb
              </span>
              <span className="text-sm font-medium text-center">Interview Tips</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="material-symbols-outlined icon-lg text-green-500 mb-2">
                fact_check
              </span>
              <span className="text-sm font-medium text-center">Key Facts</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <span className="material-symbols-outlined icon-lg text-yellow-500 mb-2">
                bolt
              </span>
              <span className="text-sm font-medium text-center">Quick Wins</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="material-symbols-outlined icon-lg text-purple-500 mb-2">
                chat
              </span>
              <span className="text-sm font-medium text-center">What to Say</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="material-symbols-outlined icon-lg text-red-500 mb-2">
                warning
              </span>
              <span className="text-sm font-medium text-center">Avoid This</span>
            </div>
          </div>
        </div>

        {/* Sample CheatCards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCheatCards.map((card, index) => (
            <div key={index} className="cheatcard-container">
              <CheatCard {...card} />
            </div>
          ))}
        </div>
        
        <div className="content-center mt-8">
          <p className="text-sm opacity-60 mb-4">Click any CheatCard to see the strategic answer</p>
          <a href="/demo" className="btn btn-primary inline-flex items-center gap-2">
            <span className="material-symbols-outlined icon-sm">
              play_arrow
            </span>
            Try CheatCard Mode Live
          </a>
        </div>
      </div>
    </section>
  );
}