'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const sections = [
  { id: 'senscript-name', label: 'Why SenScript?' },
  { id: 'who-built-this', label: 'Who Built This?' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'cheatcards-vs-flashcards', label: 'Card System' },
  { id: 'success-stories', label: 'Success Stories' },
  { id: 'ai-providers', label: 'AI Providers' },
  { id: 'technical', label: 'Technical' }
];

const useCases = [
  {
    icon: "work",
    title: "Job Interview Preparation",
    items: [
      "Technical interview question breakdown",
      "Behavioral question strategic responses", 
      "Industry-specific talking points",
      "Salary negotiation key facts"
    ]
  },
  {
    icon: "school",
    title: "Academic Exam Preparation",
    items: [
      "Lecture content → strategic study points",
      "Key facts for oral exams",
      "Quick-reference materials for test day",
      "Research synthesis for PhD defense"
    ]
  },
  {
    icon: "trending_up",
    title: "Professional Development",
    items: [
      "Conference insights → career advancement points",
      "Client meeting preparation",
      "Presentation key messages",
      "Executive communication patterns"
    ]
  }
];

export default function MoreInformation() {
  const [activeSection, setActiveSection] = useState('senscript-name');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }));

      // Find which section is currently in view
      const current = sectionElements.find(section => {
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
            CheatCard Technology<br />
            <span className="text-orange-500">Revolutionizes</span> Learning
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            SenScript pioneered CheatCard technology - transforming any conversation into 
            strategic interview ammunition and study materials at maximum speed.
          </p>
        </div>
      </section>

      {/* Navigation - Sticky 30px below 80px navbar */}
      <nav className="sticky top-[110px] z-40 mb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="glass p-2 rounded-xl border border-white/10">
            <div className="flex flex-wrap justify-center gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`px-3 py-1.5 rounded-lg border transition-all duration-300 transform hover:scale-105 text-xs font-medium ${
                    activeSection === section.id
                      ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/15 hover:text-orange-400'
                  }`}
                >
                  {section.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* SenScript Name & Awareness */}
      <section className="glass p-8">
        {/* Anchor target positioned below sticky nav */}
        <div id="senscript-name" className="relative -top-[175px] invisible h-0"></div>
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-6 content-center">Why "SenScript"?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-4">The Name Story</h3>
              <p className="opacity-90 leading-relaxed mb-4">
                <strong>Sen</strong> represents sensitivity, awareness, and the ability to sense opportunity in every conversation. 
                <strong> Script</strong> captures the strategic narratives you need for career advancement.
              </p>
              <p className="opacity-90 leading-relaxed">
                SenScript isn't just transcription - it's <em>strategic awareness</em> technology. 
                We don't record anything; we transcribe and analyze what matters, what to remember, and how to use it.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Beyond Transcription</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-orange-500 mt-1">psychology</span>
                  <span className="text-sm"><strong>Deeper Understanding:</strong> Context-aware AI that recognizes strategic patterns</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-blue-400 mt-1">insights</span>
                  <span className="text-sm"><strong>Strategic Intelligence:</strong> Transforms conversations into tactical advantages</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">trending_up</span>
                  <span className="text-sm"><strong>Career Advancement:</strong> Patterns that separate seniors from juniors</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-purple-400 mt-1">memory</span>
                  <span className="text-sm"><strong>Perfect Recall:</strong> Never forget a strategic insight or key learning moment</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-orange-500 mb-3">The SenScript Advantage</h3>
            <p className="opacity-90 leading-relaxed">
              While others provide transcripts, SenScript provides <strong>transformation</strong>. 
              We've pioneered CheatCard technology because we understand that success isn't about remembering everything - 
              it's about remembering the <em>right things</em> at the <em>right time</em>.
            </p>
          </div>
        </div>
      </section>

      {/* Who Built This - Studio Sen Teaser */}
      <section className="glass p-8">
        {/* Anchor target positioned below sticky nav */}
        <div id="who-built-this" className="relative -top-[175px] invisible h-0"></div>
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-6 content-center">Who Built This?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-4">Studio Sen</h3>
              <p className="opacity-90 leading-relaxed mb-4">
                SenScript was crafted by <strong>Studio Sen</strong> - a design-first software studio that believes 
                in building products that feel "alive" and invite engagement.
              </p>
              <p className="opacity-90 leading-relaxed mb-6">
                Our <em>Agentic Coding</em> methodology ensures every line of code serves the user's emotional journey, 
                combining functional beauty with lightning speed.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-500">person</span>
                </div>
                <div>
                  <p className="font-medium">Denis Kreuzer</p>
                  <p className="text-sm opacity-70">Founder & Lead Developer</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Our Philosophy</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-orange-500 mt-1">flash_on</span>
                  <span className="text-sm"><strong>Speed First:</strong> 4-8 week MVP cycles without compromising quality</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-blue-400 mt-1">psychology</span>
                  <span className="text-sm"><strong>Single-Brain Execution:</strong> No translation layers between design and code</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">eco</span>
                  <span className="text-sm"><strong>Systems Thinking:</strong> Building ecosystems that evolve intelligently</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-purple-400 mt-1">favorite</span>
                  <span className="text-sm"><strong>Human-First:</strong> "I don't build for screens. I build for people."</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-semibold text-orange-500 mb-3">Learn More About Our Story</h3>
            <p className="opacity-90 leading-relaxed mb-6">
              Discover our innovation journey, development philosophy, and the methodology behind SenScript's breakthrough CheatCard technology.
            </p>
            <Link href="/about" className="btn btn-primary inline-flex items-center gap-2">
              <span className="material-symbols-outlined icon-sm">info</span>
              About SenScript & Studio Sen
            </Link>
          </div>
        </div>
      </section>

      {/* Detailed Use Cases */}
      <section className="space-section">
        {/* Anchor target positioned below sticky nav */}
        <div id="use-cases" className="relative -top-[175px] invisible h-0"></div>
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">CheatCard Use Cases</h2>
          <p className="text-lg opacity-90">Strategic advantages across every profession</p>
        </div>
        <div className="section-grid">
          {useCases.map((useCase, index) => (
            <div key={index} className="glass p-6">
              <span className={`material-symbols-outlined icon-xl mb-4 block ${
                index === 0 ? 'text-orange-500' : 
                index === 1 ? 'text-blue-400' : 'text-green-400'
              }`}>
                {useCase.icon}
              </span>
              <h3 className="text-xl font-semibold mb-4">{useCase.title}</h3>
              <ul className="space-y-2">
                {useCase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-2">
                    <span className="material-symbols-outlined icon-sm text-orange-500 mt-1">
                      check_circle
                    </span>
                    <span className="opacity-90 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Card System Concept */}
      <section className="glass p-8">
        {/* Anchor target positioned below sticky nav */}
        <div id="cheatcards-vs-flashcards" className="relative -top-[175px] invisible h-0"></div>
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-6 content-center">Card System</h2>
          <p className="text-lg opacity-90 mb-8 content-center">
            Understanding the difference and when to use each approach
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src="/images/cheatcard-example.png" 
                  alt="CheatCard example showing quick tactical answers"
                  className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  CheatCard Mode
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-orange-500 mb-3">CheatCards: Quick Strategic Answers</h3>
                <ul className="space-y-2 text-sm opacity-90">
                  <li className="flex items-start space-x-2">
                    <span className="material-symbols-outlined icon-sm text-orange-500 mt-1">bolt</span>
                    <span><strong>For Tests & Interviews:</strong> Instant tactical responses when you need them most</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="material-symbols-outlined icon-sm text-orange-500 mt-1">psychology</span>
                    <span><strong>Strategic Intelligence:</strong> "What to say" vs "what NOT to say" guidance</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="material-symbols-outlined icon-sm text-orange-500 mt-1">speed</span>
                    <span><strong>Real-time Access:</strong> Available during live conversations and presentations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src="/images/flashcard-example.png" 
                  alt="Flashcard example showing traditional learning format"
                  className="w-full aspect-[4/3] object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute top-4 left-4 bg-blue-400 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Flashcard Mode
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Flashcards: Deep Learning Practice</h3>
                <ul className="space-y-2 text-sm opacity-90">
                  <li className="flex items-start space-x-2">
                    <span className="material-symbols-outlined icon-sm text-blue-400 mt-1">school</span>
                    <span><strong>For Study Sessions:</strong> Traditional question/answer format for memorization</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="material-symbols-outlined icon-sm text-blue-400 mt-1">repeat</span>
                    <span><strong>Spaced Repetition:</strong> Long-term retention through repeated practice</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="material-symbols-outlined icon-sm text-blue-400 mt-1">library_books</span>
                    <span><strong>Knowledge Building:</strong> Comprehensive understanding over time</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 content-center">The SenScript Advantage: Switch Anytime</h3>
            <p className="opacity-90 leading-relaxed content-center">
              SenScript doesn't automatically generate both modes. Instead, <strong>you can switch between CheatCard and Flashcard modes anytime while listening to the audio stream</strong>. 
              Use CheatCards when you need quick answers in real-time situations, and Flashcards when you want to build deep, lasting knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories Navigation */}
      <section className="glass p-8">
        {/* Anchor target positioned below sticky nav */}
        <div id="success-stories" className="relative -top-[175px] invisible h-0"></div>
        <div className="content-center">
          <h2 className="text-3xl font-bold mb-4">Versatile Across Every Profession</h2>
          <p className="text-lg opacity-90 mb-8">
            From interviews to research, languages to exams - SenScript adapts to your needs
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <a href="/use-cases#sarah" className="glass overflow-hidden hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-4 p-6">
                <img src="/images/sarah.png" alt="Sarah" className="w-24 h-20 rounded-[12px] object-cover flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg mb-1">Technical Interviews</h3>
                  <p className="text-sm opacity-80 mb-2">Sarah - Software Engineer</p>
                  <p className="text-sm text-orange-500 font-medium group-hover:translate-x-1 transition-transform">Senior role in 6 months →</p>
                </div>
              </div>
            </a>
            
            <a href="/use-cases#marcus" className="glass overflow-hidden hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-4 p-6">
                <img src="/images/marcus.png" alt="Marcus" className="w-24 h-20 rounded-[12px] object-cover flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg mb-1">Academic Research</h3>
                  <p className="text-sm opacity-80 mb-2">Marcus - PhD Graduate</p>
                  <p className="text-sm text-purple-400 font-medium group-hover:translate-x-1 transition-transform">PhD defense success →</p>
                </div>
              </div>
            </a>
            
            <a href="/use-cases#lisa" className="glass overflow-hidden hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-4 p-6">
                <img src="/images/lisa.png" alt="Lisa" className="w-24 h-20 rounded-[12px] object-cover flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg mb-1">Language Learning</h3>
                  <p className="text-sm opacity-80 mb-2">Lisa - Polyglot</p>
                  <p className="text-sm text-indigo-500 font-medium group-hover:translate-x-1 transition-transform">5 languages mastered →</p>
                </div>
              </div>
            </a>
            
            <a href="/use-cases#alex" className="glass overflow-hidden hover:bg-white/10 transition-colors group">
              <div className="flex items-center gap-4 p-6">
                <img src="/images/alex.png" alt="Alex" className="w-24 h-20 rounded-[12px] object-cover flex-shrink-0" />
                <div className="text-left">
                  <h3 className="font-semibold text-lg mb-1">Academic Excellence</h3>
                  <p className="text-sm opacity-80 mb-2">Alex - Student</p>
                  <p className="text-sm text-green-400 font-medium group-hover:translate-x-1 transition-transform">From B- to A grades →</p>
                </div>
              </div>
            </a>
          </div>
          
          <div className="mt-8">
            <a href="/use-cases" className="btn btn-primary inline-flex items-center gap-2">
              <span className="material-symbols-outlined icon-sm">diversity_3</span>
              Explore All Use Cases
            </a>
          </div>
        </div>
      </section>

      {/* LLM Choice Section */}
      <section className="glass p-8">
        {/* Anchor target positioned below sticky nav */}
        <div id="ai-providers" className="relative -top-[175px] invisible h-0"></div>
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-6 content-center">Your Choice of AI Provider</h2>
          <p className="text-lg opacity-90 mb-8 content-center">
            SenScript works with multiple AI providers - choose what works best for you
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass p-6 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">DeepSeek</div>
              <div className="text-lg font-medium mb-3">Most Affordable</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• 10x cheaper than competitors</li>
                <li>• Excellent for technical content</li>
                <li>• Great for developers</li>
                <li>• Fast processing speed</li>
              </ul>
            </div>
            
            <div className="glass p-6 text-center border-2 border-orange-500">
              <div className="text-4xl font-bold text-orange-500 mb-2">OpenAI</div>
              <div className="text-lg font-medium mb-3">Most Popular</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• GPT-4 for best accuracy</li>
                <li>• Excellent language support</li>
                <li>• Reliable and consistent</li>
                <li>• Premium option available</li>
              </ul>
            </div>
            
            <div className="glass p-6 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">Anthropic</div>
              <div className="text-lg font-medium mb-3">Best Reasoning</div>
              <ul className="text-sm space-y-2 opacity-90">
                <li>• Claude for complex analysis</li>
                <li>• Superior context understanding</li>
                <li>• Excellent for research content</li>
                <li>• Safe and reliable</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Your API Keys, Your Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                <span className="text-sm">Use your own API keys for maximum privacy</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                <span className="text-sm">Switch between providers anytime</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                <span className="text-sm">Fallback to SenScript keys when needed</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                <span className="text-sm">Direct billing - no markup charges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="glass p-8">
        {/* Anchor target positioned below sticky nav */}
        <div id="technical" className="relative -top-[175px] invisible h-0"></div>
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-6 content-center">Universal Audio Capture</h2>
          <p className="text-lg opacity-90 mb-8 content-center">
            Revolutionary technology that works with ANY application
          </p>

          <div className="space-y-6">
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="text-xl font-semibold mb-2">Two Audio Sources</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined icon-sm text-orange-500">mic</span>
                  <span><strong>Microphone Input:</strong> Capture your voice directly</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined icon-sm text-blue-400">speaker</span>
                  <span><strong>System Audio:</strong> Capture computer's audio output</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Why This Is Game-Changing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                  <span className="text-sm">Works with ANY app automatically</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                  <span className="text-sm">No integrations needed</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                  <span className="text-sm">Future-proof technology</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="material-symbols-outlined icon-sm text-green-400 mt-1">check</span>
                  <span className="text-sm">Privacy-first design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & CTA */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            The Future of Strategic Learning
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Every conversation is an opportunity. Every insight is career advancement. 
            Every CheatCard is your competitive advantage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn btn-primary text-lg px-8 py-4">
              See CheatCards in Action
            </Link>
            <Link href="/pricing" className="btn text-lg px-8 py-4">
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}