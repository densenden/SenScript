'use client';

import { useState } from 'react';
import CheatCard from '../ui/CheatCard';

const interviewScenarios = [
  {
    type: 'technical' as const,
    title: 'Technical Interview',
    icon: 'code',
    description: 'System design and coding challenges',
    transcript: 'Explain the difference between REST and GraphQL APIs. When would you use each approach? What are the trade-offs in terms of performance, caching, and client complexity?',
    cheatcard: {
      category: 'INTERVIEW TIP' as const,
      front: 'How to explain REST vs GraphQL trade-offs in system design interviews?',
      back: 'REST: Simple, cacheable, over-fetching issues. GraphQL: Flexible queries, complex caching, single endpoint. Use REST for simple CRUD APIs, GraphQL for complex data relationships. Mention performance (N+1 problem), caching strategies, and team complexity considerations.',
      tags: ['system-design', 'apis', 'architecture']
    }
  },
  {
    type: 'behavioral' as const,
    title: 'Behavioral Interview',
    icon: 'psychology',
    description: 'Leadership and teamwork scenarios',
    transcript: 'Tell me about a time you handled conflict within your team. What was the situation, how did you approach it, and what was the outcome?',
    cheatcard: {
      category: 'WHAT TO SAY' as const,
      front: 'How to structure conflict resolution stories in behavioral interviews?',
      back: 'Use SOAR: Situation (brief context), Obstacle (specific conflict), Action (your approach - listen first, find common ground, focus on goals), Result (positive outcome + learning). Emphasize collaboration over winning. Show emotional intelligence and leadership growth.',
      tags: ['behavioral', 'leadership', 'conflict-resolution']
    }
  },
  {
    type: 'industry' as const,
    title: 'Industry-Specific',
    icon: 'business_center',
    description: 'Domain expertise and trends',
    transcript: 'What trends do you see in quantum computing and how might they impact software development in the next 5-10 years?',
    cheatcard: {
      category: 'KEY FACTS' as const,
      front: 'Key quantum computing trends for software engineers to mention?',
      back: 'Current: IBM quantum cloud, Google quantum supremacy claims, Microsoft quantum dev kit. Impact: Cryptography changes (post-quantum crypto), optimization problems, machine learning acceleration. Timeline: Commercial applications 10+ years, development tools emerging now. Mention quantum programming languages (Q#, Qiskit).',
      tags: ['quantum-computing', 'trends', 'future-tech']
    }
  }
];

export default function InterviewDemo() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [showCheatCard, setShowCheatCard] = useState(false);

  const currentScenario = interviewScenarios[activeScenario];

  return (
    <section className="content-max-width-large">
      <div className="glass p-8 rounded-3xl">
        <div className="content-center space-large">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="material-symbols-outlined icon-xl text-orange-500">
              play_circle
            </span>
            <h2 className="text-3xl font-bold">Interactive CheatCard Demo</h2>
          </div>
          <p className="text-xl opacity-80 max-w-3xl mx-auto">
            See how SenScript transforms interview scenarios into strategic CheatCards. 
            Select an interview type and watch the magic happen.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interviewScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveScenario(index);
                  setShowCheatCard(false);
                }}
                className={`
                  p-4 rounded-xl text-left transition-all duration-300
                  ${activeScenario === index 
                    ? 'bg-orange-500/20 border-orange-500/50 border-2' 
                    : 'glass border hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`
                    material-symbols-outlined icon-md
                    ${activeScenario === index ? 'text-orange-500' : 'text-gray-400'}
                  `}>
                    {scenario.icon}
                  </span>
                  <h3 className="font-semibold">{scenario.title}</h3>
                </div>
                <p className="text-sm opacity-80">{scenario.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Interview Scenario */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined icon-md text-blue-500">
                record_voice_over
              </span>
              <h3 className="text-xl font-semibold">Interview Question</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-sm opacity-70 mb-2">Interviewer asking:</div>
              <p className="text-lg leading-relaxed bg-white/5 p-4 rounded-xl">
                "{currentScenario.transcript}"
              </p>
            </div>

            <button
              onClick={() => setShowCheatCard(true)}
              disabled={showCheatCard}
              className={`
                btn w-full py-4 text-lg flex items-center justify-center gap-2
                ${showCheatCard 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'btn-primary hover:scale-105 active:scale-95'
                }
              `}
            >
              <span className="material-symbols-outlined icon-sm">
                auto_awesome
              </span>
              {showCheatCard ? 'CheatCard Generated!' : 'Generate CheatCard'}
            </button>
          </div>

          {/* Right: Generated CheatCard */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined icon-md text-green-500">
                psychology
              </span>
              <h3 className="text-xl font-semibold">Strategic CheatCard</h3>
            </div>

            {showCheatCard ? (
              <div className="space-y-4">
                <CheatCard 
                  {...currentScenario.cheatcard}
                  interviewType={currentScenario.type}
                  difficulty="intermediate"
                />
                <div className="text-center">
                  <p className="text-sm opacity-70 mb-3">
                    Click the CheatCard to see the strategic answer
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs opacity-60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>
                        schedule
                      </span>
                      Generated in 2.1s
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>
                        stars
                      </span>
                      Interview-optimized
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center opacity-50">
                <div className="text-center">
                  <span className="material-symbols-outlined icon-xl mb-3 block">
                    hourglass_empty
                  </span>
                  <p>Click "Generate CheatCard" to see the magic</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mode Comparison */}
        <div className="mt-12 glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-center mb-6">
            CheatCard vs Regular Flashcard
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined icon-sm">
                  quiz
                </span>
                Regular Flashcard
              </h4>
              <p className="text-sm opacity-80 mb-2">
                Q: What is REST API?
              </p>
              <p className="text-sm opacity-80">
                A: Representational State Transfer - an architectural style for web services.
              </p>
              <p className="text-xs opacity-60 mt-3">
                Basic definition, no strategic value
              </p>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined icon-sm">
                  psychology
                </span>
                CheatCard Mode
              </h4>
              <p className="text-sm opacity-80 mb-2">
                Strategic Answer: {currentScenario.cheatcard.front}
              </p>
              <p className="text-sm opacity-80">
                Context-aware response with trade-offs, use cases, and interview-specific insights.
              </p>
              <p className="text-xs opacity-60 mt-3">
                Interview-optimized strategic knowledge
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="content-center mt-8">
          <div className="bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl p-6 border border-orange-500/20">
            <h3 className="text-xl font-bold mb-3">Ready to Try CheatCard Mode?</h3>
            <p className="opacity-80 mb-4">
              Transform any conversation into interview-winning strategic knowledge
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="https://script.sen.studio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined icon-sm">
                  launch
                </span>
                Launch Full Demo
              </a>
              <a href="/pricing" className="btn inline-flex items-center gap-2">
                <span className="material-symbols-outlined icon-sm">
                  payments
                </span>
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}