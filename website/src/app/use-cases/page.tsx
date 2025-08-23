'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PersonaCard from '@/components/ui/PersonaCard';

const useCases = [
  {
    id: 'sarah',
    name: 'Sarah',
    title: 'Software Engineer',
    image: '/images/sarah.png',
    headline: 'Learn how Sarah advanced her software engineering career',
    challenge: 'Stuck at junior level for 2+ years, struggling with system design interviews',
    solution: 'Used SenScript during mock interviews and architecture discussions to capture expert communication patterns',
    result: 'Promoted to senior level with significant salary increase in 6 months',
    quote: 'SenScript taught me to speak like a senior engineer. The patterns I captured from architecture reviews became my interview superpower.',
    cards: [
      {
        type: 'flashcard',
        front: 'What is the CAP theorem?',
        back: 'Consistency, Availability, Partition tolerance - you can only guarantee 2 of 3 in distributed systems'
      },
      {
        type: 'cheatcard',
        category: 'INTERVIEW TIP',
        front: 'How to explain system design trade-offs?',
        back: 'Always mention: scalability vs consistency, cost vs performance, complexity vs maintainability. Give specific examples.'
      },
      {
        type: 'cheatcard',
        category: 'WHAT TO SAY',
        front: 'How to handle unknown tech in interviews?',
        back: 'Acknowledge honestly: "While I haven\'t worked with Kubernetes, I have Docker/AWS ECS experience with similar concepts. I\'d ramp up quickly on the underlying principles."'
      },
      {
        type: 'flashcard',
        front: 'REST vs GraphQL key difference',
        back: 'REST: Multiple endpoints, over/under-fetching. GraphQL: Single endpoint, precise data fetching, better for complex UIs'
      },
      {
        type: 'cheatcard',
        category: 'QUICK WIN',
        front: 'API performance diagnosis steps?',
        back: '1) Check response times 2) Monitor database queries 3) Review caching 4) Analyze traffic patterns 5) Scale horizontally if needed'
      }
    ]
  },
  {
    id: 'marcus',
    name: 'Marcus',
    title: 'PhD Graduate',
    image: '/images/marcus.png', 
    headline: 'How Marcus turned 4 years of research into a coherent PhD defense',
    challenge: 'Scattered research notes from 4 years of PhD work, struggling to create coherent defense narrative',
    solution: 'Used SenScript during advisor meetings to capture structured insights and research connections',
    result: 'Successfully defended PhD and landed research position at DeepMind',
    quote: 'My advisor meetings became structured knowledge. Four years of scattered research turned into a coherent academic story.',
    cards: [
      {
        type: 'flashcard',
        front: 'Quantum entanglement definition',
        back: 'Phenomenon where quantum particles remain connected, instantly affecting each other regardless of distance'
      },
      {
        type: 'cheatcard',
        category: 'KEY FACTS',
        front: 'Einstein\'s objection to quantum mechanics?',
        back: '"Spooky action at a distance" - Einstein believed hidden variables explained entanglement, later disproven by Bell\'s theorem'
      },
      {
        type: 'cheatcard',
        category: 'CONCEPT',
        front: 'Bell\'s theorem significance',
        back: 'Proved no physical theory based on local hidden variables can reproduce all quantum mechanical predictions - validated quantum non-locality'
      },
      {
        type: 'flashcard',
        front: 'Heisenberg uncertainty principle',
        back: 'Cannot simultaneously know exact position and momentum of particle - fundamental limit of measurement precision'
      }
    ]
  },
  {
    id: 'lisa',
    name: 'Lisa', 
    title: 'Polyglot & Language Coach',
    image: '/images/lisa.png',
    headline: 'From language learner to fluent in 5 languages with SenScript',
    challenge: 'Trying to learn multiple languages simultaneously, struggling with pronunciation and vocabulary retention',
    solution: 'Used SenScript to capture native conversations, podcasts, and language exchanges in real-time',
    result: 'Achieved fluency in German, Spanish, French, Swedish, and Italian',
    quote: 'SenScript works in all my target languages. I capture native conversations - automatic flashcards in each language.',
    cards: [
      {
        type: 'flashcard',
        front: 'German: Wie geht es dir?',
        back: 'How are you? (informal) - Response: Mir geht es gut, danke!'
      },
      {
        type: 'cheatcard',
        category: 'QUICK WIN',
        front: 'Swedish ö pronunciation tip?',
        back: 'Like "e" in "her" but with rounded lips. Practice "förr" (before) vs "får" (sheep)'
      },
      {
        type: 'flashcard',
        front: 'French participe passé rule',
        back: 'With auxiliary être, ALWAYS agree: elle est venue, ils sont partis, nous sommes arrivées (feminine plural)'
      },
      {
        type: 'cheatcard',
        category: 'AVOID THIS',
        front: 'Spanish subjunctive mistake?',
        back: 'NEVER "sugiero que consideras" - sounds terrible. Always "sugiero que consideres" or "consideremos"'
      },
      {
        type: 'cheatcard',
        category: 'WHAT TO SAY',
        front: 'Korean business politeness?',
        back: 'Business: "죄송합니다" (not 미안해요), "감사합니다" (not 고마워요), "검토해 주시겠습니까?" for requests'
      }
    ]
  },
  {
    id: 'alex',
    name: 'Alex',
    title: 'High School Student',
    image: '/images/alex.png',
    headline: 'How Alex masters test situations with instant cheat cards',
    challenge: 'Facing rapid-fire questions in AP History, struggling to recall key facts and dates under pressure',
    solution: 'Used SenScript during teacher Q&A sessions and study groups to capture test-taking strategies and quick facts',
    result: 'Improved test performance from B- to A, gained confidence handling surprise questions',
    quote: 'When teachers throw random questions at me, I have my cheat cards ready. SenScript turned stressful moments into easy wins.',
    cards: [
      {
        type: 'cheatcard',
        category: 'QUICK WIN',
        front: 'Teacher asks: "When was WWI?"',
        back: '1914-1918. Remember: "Four years of fighting, fourteen to eighteen." Also mention: Started by assassination of Archduke Franz Ferdinand'
      },
      {
        type: 'cheatcard',
        category: 'EXAM TIP',
        front: 'Don\'t know a history date?',
        back: 'Give decade + context: "Mid-1960s during Civil Rights era" or "Early 1900s during Industrial Revolution." Shows you understand timeline'
      },
      {
        type: 'cheatcard',
        category: 'WHAT TO SAY',
        front: 'Teacher: "Compare two presidents"',
        back: 'Use structure: "Both faced [similar challenge], but X took [approach] while Y chose [different approach]. The key difference was [specific policy]."'
      },
      {
        type: 'cheatcard',
        category: 'AVOID THIS',
        front: 'Never say this in history class',
        back: 'Don\'t say "I think" or "maybe" - sounds unsure. Instead: "Evidence suggests..." or "Historians argue..." Sounds more authoritative'
      },
      {
        type: 'cheatcard',
        category: 'TEST HACK',
        front: 'Multiple choice history strategy',
        back: 'Eliminate answers with absolute words (always/never). Look for dates that don\'t match time periods. Choose specific over general answers'
      }
    ]
  }
];

export default function UseCases() {
  const [activeSection, setActiveSection] = useState('sarah');

  useEffect(() => {
    const handleScroll = () => {
      const sections = useCases.map(useCase => ({
        id: useCase.id,
        element: document.getElementById(useCase.id)
      }));

      // Find which section is currently in view
      const current = sections.find(section => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        // Consider section active if it's within the viewport (accounting for sticky nav)
        return rect.top <= 200 && rect.bottom >= 200;
      });

      if (current) {
        setActiveSection(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Real Stories, Real Results
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Discover how professionals and students use SenScript to transform 
            conversations into learning opportunities every day.
          </p>
        </div>
      </section>

      {/* Navigation - Sticky 30px below 80px navbar */}
      <nav className="sticky top-[110px] z-40 mb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="glass p-2 rounded-xl border border-white/10">
            <div className="flex flex-wrap justify-center gap-3">
              {useCases.map((useCase, index) => (
                <a
                  key={useCase.id}
                  href={`#${useCase.id}`}
                  className={`px-2.5 py-1 rounded-lg border transition-all duration-300 transform hover:scale-105 text-sm font-medium ${
                    activeSection === useCase.id
                      ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/15 hover:text-orange-400'
                  }`}
                >
                  <span className="font-medium">{useCase.name}</span>
                  <span className="text-xs opacity-70 ml-1">{
                    useCase.title === 'Software Engineer' ? 'Software Engineer' :
                    useCase.title === 'PhD Graduate' ? 'Researcher' :
                    useCase.title === 'Polyglot & Language Coach' ? 'Language Learner' :
                    useCase.title === 'High School Student' ? 'Highschool Student' :
                    useCase.title
                  }</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Use Cases */}
      {useCases.map((useCase, index) => (
        <section key={useCase.id} className="mb-32">
          {/* Anchor target positioned below sticky nav (110px + nav height ~45px + 20px spacing) */}
          <div id={useCase.id} className="relative -top-[175px] invisible h-0"></div>
          {/* Full Width Headline */}
          <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-8xl md:text-9xl lg:text-[12rem] font-bold text-white leading-tight mb-6">
              {useCase.headline}
            </h2>
            <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto">
              From challenge to breakthrough: How {useCase.name} transformed their learning journey with SenScript
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Content */}
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              
              {/* Challenge, Solution, Result - Glass Containers */}
              <div className="space-y-6 mb-8 animate-in slide-in-from-left-4 duration-700 delay-300">
                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="material-symbols-outlined text-red-400 text-xl">problem</span>
                    <span className="font-semibold text-red-400">Challenge</span>
                  </div>
                  <p className="opacity-90">{useCase.challenge}</p>
                </div>
                
                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="material-symbols-outlined text-blue-400 text-xl">lightbulb</span>
                    <span className="font-semibold text-blue-400">Solution</span>
                  </div>
                  <p className="opacity-90">{useCase.solution}</p>
                </div>
                
                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="material-symbols-outlined text-green-400 text-xl">trending_up</span>
                    <span className="font-semibold text-green-400">Result</span>
                  </div>
                  <p className="opacity-90">{useCase.result}</p>
                </div>
              </div>
              
            </div>

            {/* Image */}
            <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div className="animate-in slide-in-from-right-4 duration-700 delay-100">
                <div className="relative">
                  <img
                    src={useCase.image}
                    alt={useCase.name}
                    className="w-full aspect-[4/3] rounded-2xl object-cover shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent rounded-b-2xl p-4">
                    <h3 className="text-2xl font-bold text-white leading-tight">{useCase.name}</h3>
                    <p className="text-lg text-orange-400 font-medium leading-tight">{useCase.title}</p>
                  </div>
                </div>
                
                {/* Quote under image */}
                <div className="mt-6 w-4/5 mx-auto">
                  <p className="text-xl font-medium leading-relaxed tracking-widest">
                    {useCase.quote}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Flashcards Slider - Bottom of Use Case */}
          <div className="mt-16 space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-400">
            <h3 className="text-2xl font-semibold text-center">Real Cards Generated</h3>
            <div className="overflow-hidden rounded-2xl">
              <div className="flex space-x-4 animate-scroll-cards hover:animation-paused">
                {/* First set of cards */}
                {useCase.cards.map((card, cardIndex) => (
                  <div key={`first-${cardIndex}`} className="bg-white/5 border border-white/10 rounded-2xl p-6 min-w-[280px] w-[280px] flex-shrink-0 animate-in slide-in-from-left-4" style={{animationDelay: `${cardIndex * 200}ms`}}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        card.type === 'flashcard' ? 'bg-blue-500' : 'bg-orange-500'
                      } text-white`}>
                        {card.type === 'flashcard' ? 'FLASHCARD' : card.category}
                      </span>
                      <span className="text-xs opacity-60">Real Example</span>
                    </div>
                    <div className="text-sm font-medium mb-2">{card.front}</div>
                    <div className="text-sm opacity-80 bg-white/5 p-3 rounded-lg leading-5">
                      {card.back}
                    </div>
                  </div>
                ))}
                {/* Duplicate set for seamless scroll */}
                {useCase.cards.map((card, cardIndex) => (
                  <div key={`second-${cardIndex}`} className="bg-white/5 border border-white/10 rounded-2xl p-6 min-w-[280px] w-[280px] flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        card.type === 'flashcard' ? 'bg-blue-500' : 'bg-orange-500'
                      } text-white`}>
                        {card.type === 'flashcard' ? 'FLASHCARD' : card.category}
                      </span>
                      <span className="text-xs opacity-60">Real Example</span>
                    </div>
                    <div className="text-sm font-medium mb-2">{card.front}</div>
                    <div className="text-sm opacity-80 bg-white/5 p-3 rounded-lg leading-5">
                      {card.back}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join Sarah, Marcus, Lisa, and Alex in transforming everyday conversations into learning opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn btn-primary text-lg px-8 py-4">
              Try SenScript Free
            </Link>
            <Link href="/pricing" className="btn text-lg px-8 py-4">
              View Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}