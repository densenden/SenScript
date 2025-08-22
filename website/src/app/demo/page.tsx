'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CheatCard {
  id: string;
  category: 'INTERVIEW TIP' | 'KEY FACTS' | 'QUICK WIN' | 'WHAT TO SAY' | 'AVOID THIS';
  front: string;
  back: string;
  timestamp: string;
}

const demoScenarios = [
  {
    id: 'technical',
    title: 'Technical Interview',
    description: 'Software engineering system design discussion',
    transcript: "So let's talk about scalability. When you're designing a system that needs to handle millions of users, what are the key considerations? Well, I'd start with horizontal scaling - adding more servers rather than upgrading existing ones. Database sharding becomes crucial, and you need to think about caching strategies like Redis or Memcached. Load balancers distribute traffic, and microservices architecture helps with maintainability."
  },
  {
    id: 'behavioral', 
    title: 'Behavioral Interview',
    description: 'Leadership and conflict resolution scenario',
    transcript: "Tell me about a time you had to resolve a conflict between team members. I had two senior developers who disagreed on technical approach. One wanted to use a new framework, the other preferred our existing stack. I organized a technical review meeting, had each present their case with pros and cons, and facilitated a decision based on project timeline, team expertise, and long-term maintenance. The key was making both feel heard while focusing on business objectives."
  },
  {
    id: 'industry',
    title: 'Industry Interview', 
    description: 'Fintech trends and market analysis',
    transcript: "What trends do you see in fintech right now? The biggest shift is embedded finance - financial services integrated directly into non-financial platforms. Think Shopify Capital or Uber's payment system. Open banking APIs are enabling this, while regulatory sandboxes let startups experiment. DeFi is maturing, but regulation remains uncertain. The focus is shifting from disruption to collaboration with traditional banks."
  }
];

const demoCheatCards: { [key: string]: CheatCard[] } = {
  technical: [
    {
      id: '1',
      category: 'INTERVIEW TIP',
      front: 'How to discuss scalability in system design interviews?',
      back: 'Start with horizontal scaling, mention database sharding, discuss caching strategies (Redis/Memcached), load balancers, and microservices. Always tie technical decisions to business impact.',
      timestamp: '0:23'
    },
    {
      id: '2', 
      category: 'KEY FACTS',
      front: 'Essential scalability components to mention',
      back: 'Horizontal scaling over vertical, database sharding, caching (Redis/Memcached), load balancers, microservices architecture, and maintainability considerations.',
      timestamp: '0:45'
    },
    {
      id: '3',
      category: 'WHAT TO SAY',
      front: 'Professional way to start scalability discussion',
      back: '"I\'d start with horizontal scaling - adding more servers rather than upgrading existing ones" - shows you understand cost-effective scaling approaches.',
      timestamp: '0:18'
    }
  ],
  behavioral: [
    {
      id: '4',
      category: 'INTERVIEW TIP', 
      front: 'How to structure conflict resolution stories?',
      back: 'Use STAR method: Situation (conflict details), Task (your role), Action (specific steps like technical review meeting), Result (business-focused outcome).',
      timestamp: '1:12'
    },
    {
      id: '5',
      category: 'QUICK WIN',
      front: 'Key phrase for demonstrating leadership',
      back: '"Made both feel heard while focusing on business objectives" - shows emotional intelligence combined with business acumen.',
      timestamp: '1:45'
    },
    {
      id: '6',
      category: 'AVOID THIS',
      front: 'Don\'t say in conflict resolution stories',
      back: 'Avoid: "I told them what to do" or "I made the decision." Instead emphasize facilitation, data-driven decisions, and team buy-in.',
      timestamp: '1:33'
    }
  ],
  industry: [
    {
      id: '7',
      category: 'KEY FACTS',
      front: 'Current fintech trend to highlight: Embedded Finance',
      back: 'Embedded finance integrates financial services into non-financial platforms. Examples: Shopify Capital, Uber payments. Enabled by open banking APIs.',
      timestamp: '0:28'
    },
    {
      id: '8',
      category: 'INTERVIEW TIP',
      front: 'How to discuss industry trends professionally?',
      back: 'Mention specific examples (Shopify Capital), explain enabling technology (open banking APIs), acknowledge challenges (regulation), show balanced perspective.',
      timestamp: '0:15'
    },
    {
      id: '9',
      category: 'WHAT TO SAY',
      front: 'Sophisticated take on fintech evolution',
      back: '"The focus is shifting from disruption to collaboration with traditional banks" - shows mature understanding beyond typical startup mindset.',
      timestamp: '1:02'
    }
  ]
};

const categoryColors = {
  'INTERVIEW TIP': 'bg-blue-500',
  'KEY FACTS': 'bg-green-500', 
  'QUICK WIN': 'bg-purple-500',
  'WHAT TO SAY': 'bg-orange-500',
  'AVOID THIS': 'bg-red-500'
};

export default function Demo() {
  const [selectedScenario, setSelectedScenario] = useState('technical');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const startDemo = () => {
    setIsProcessing(true);
    setShowCards(false);
    setFlippedCards(new Set());
    setCurrentCardIndex(0);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowCards(true);
      animateCardReveal();
    }, 2500);
  };

  const animateCardReveal = () => {
    const cards = demoCheatCards[selectedScenario];
    cards.forEach((_, index) => {
      setTimeout(() => {
        setCurrentCardIndex(index + 1);
      }, index * 800);
    });
  };

  const toggleCard = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const currentScenario = demoScenarios.find(s => s.id === selectedScenario);
  const currentCards = demoCheatCards[selectedScenario];

  return (
    <div className="container">
      {/* Hero */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            See <span className="text-orange-500">CheatCards</span><br />
            In Action
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Watch AI transform interview conversations into strategic advantage cards. 
            Choose a scenario and see CheatCard technology work in real-time.
          </p>
        </div>
      </section>

      {/* Scenario Selection */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Choose Your Interview Scenario</h2>
          <p className="text-lg opacity-90">Experience CheatCard generation for different interview types</p>
        </div>
        <div className="section-grid">
          {demoScenarios.map((scenario) => (
            <div 
              key={scenario.id}
              className={`glass p-6 cursor-pointer transition-all hover:transform hover:scale-105 ${
                selectedScenario === scenario.id ? 'ring-2 ring-orange-500' : ''
              }`}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <h3 className="text-xl font-semibold mb-2">{scenario.title}</h3>
              <p className="text-sm opacity-90 mb-4">{scenario.description}</p>
              {selectedScenario === scenario.id && (
                <div className="flex items-center space-x-2 text-orange-500">
                  <span className="material-symbols-outlined icon-sm">
                    check_circle
                  </span>
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Demo Interface */}
      <section className="glass p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transcript Side */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="material-symbols-outlined icon-lg text-blue-400 mr-2">
                transcript
              </span>
              Live Transcript
            </h3>
            <div className="glass p-6 min-h-[200px]">
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-sm">
                  {isProcessing ? 'Processing...' : 'Ready'}
                </span>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                {currentScenario?.transcript}
              </p>
            </div>
            <button
              onClick={startDemo}
              disabled={isProcessing}
              className="btn-primary w-full mt-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <span className="material-symbols-outlined animate-spin mr-2">
                    sync
                  </span>
                  Generating CheatCards...
                </span>
              ) : (
                'Start CheatCard Generation'
              )}
            </button>
          </div>

          {/* CheatCards Side */}
          <div>
            <h3 className="text-2xl font-semibold mb-4 flex items-center">
              <span className="material-symbols-outlined icon-lg text-orange-500 mr-2">
                style
              </span>
              Generated CheatCards
            </h3>
            <div className="space-y-4">
              {showCards ? (
                currentCards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`transition-all duration-500 transform ${
                      index < currentCardIndex 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <div
                      className="glass p-4 cursor-pointer hover:transform hover:scale-105 transition-all"
                      onClick={() => toggleCard(card.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                          categoryColors[card.category]
                        }`}>
                          {card.category}
                        </span>
                        <span className="text-xs opacity-70">{card.timestamp}</span>
                      </div>
                      
                      <div className="min-h-[60px]">
                        {flippedCards.has(card.id) ? (
                          <div>
                            <p className="text-sm font-medium mb-2">Answer:</p>
                            <p className="text-sm opacity-90">{card.back}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium mb-2">Question:</p>
                            <p className="text-sm opacity-90">{card.front}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <span className="text-xs opacity-70">
                          Click to {flippedCards.has(card.id) ? 'see question' : 'see answer'}
                        </span>
                        <span className="material-symbols-outlined icon-sm opacity-70">
                          {flippedCards.has(card.id) ? 'flip_to_front' : 'flip_to_back'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass p-6 text-center opacity-50">
                  <span className="material-symbols-outlined icon-xl mb-4 block">
                    style
                  </span>
                  <p>CheatCards will appear here after processing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="section-grid">
        <div className="glass p-6 text-center">
          <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block">
            bolt
          </span>
          <h3 className="text-lg font-semibold mb-2">Sub-3s Generation</h3>
          <p className="text-sm opacity-90">Real-time processing that keeps pace with conversation</p>
        </div>
        <div className="glass p-6 text-center">
          <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
            psychology
          </span>
          <h3 className="text-lg font-semibold mb-2">Context-Aware AI</h3>
          <p className="text-sm opacity-90">Understands interview strategy, not just facts</p>
        </div>
        <div className="glass p-6 text-center">
          <span className="material-symbols-outlined icon-xl text-green-400 mb-4 block">
            devices
          </span>
          <h3 className="text-lg font-semibold mb-2">Universal Compatibility</h3>
          <p className="text-sm opacity-90">Works with any web-based platform</p>
        </div>
      </section>

      {/* CTA */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Interview Game?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            This was just a preview. Get full CheatCard technology with unlimited scenarios, 
            custom categories, and real-time processing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="btn btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="/about" className="btn text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}