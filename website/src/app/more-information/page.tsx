import Link from 'next/link';

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

      {/* Mission Journey */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Our Innovation Journey</h2>
          <p className="text-lg opacity-90">From discovery to revolution</p>
        </div>
        <div className="section-grid">
          <div className="glass p-6">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
              search
            </span>
            <h3 className="text-xl font-semibold mb-3">Discovery</h3>
            <p className="opacity-90">
              Traditional flashcards weren't enough for modern interviews. We discovered 
              that strategic response patterns matter more than memorized facts.
            </p>
          </div>

          <div className="glass p-6">
            <span className="material-symbols-outlined icon-xl text-purple-400 mb-4 block">
              lightbulb
            </span>
            <h3 className="text-xl font-semibold mb-3">Innovation</h3>
            <p className="opacity-90">
              CheatCard mode provides tactical advantages - "what to say" vs "what NOT to say" 
              guidance that transforms how people prepare for high-stakes conversations.
            </p>
          </div>

          <div className="glass p-6">
            <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block">
              rocket_launch
            </span>
            <h3 className="text-xl font-semibold mb-3">Revolution</h3>
            <p className="opacity-90">
              Real-time speech-to-CheatCard technology that captures strategic insights 
              while conversations happen - no post-processing delays.
            </p>
          </div>
        </div>
      </section>

      {/* CheatCard Philosophy */}
      <section className="glass p-8">
        <div className="content-max-width space-large">
          <h2 className="text-3xl font-bold mb-6 content-center">The CheatCard Philosophy</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-orange-500 mb-3">Speed First Architecture</h3>
              <p className="opacity-90 leading-relaxed">
                Every feature, optimization, and design decision prioritizes faster card generation 
                over perfect accuracy. Sub-3-second generation means you never miss a strategic insight.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Strategic Intelligence</h3>
              <p className="opacity-90 leading-relaxed">
                CheatCards aren't just facts - they're tactical advantages. Context-aware AI 
                understands interview strategy, negotiation tactics, and communication patterns 
                that separate senior professionals from everyone else.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-green-400 mb-3">Universal Access</h3>
              <p className="opacity-90 leading-relaxed">
                Works with any audio source through your Chrome browser. Teams, Zoom, phone calls, 
                lectures - if there's speech, there are CheatCards. No integrations required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Use Cases */}
      <section className="space-section">
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

      {/* Success Stories - Main Focus */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Success Stories</h2>
          <p className="text-xl opacity-90 mb-16">Real people achieving breakthrough results with CheatCard technology</p>
        </div>
        
        <div className="space-y-24 max-w-8xl mx-auto">
          {/* Sarah Chen - Story 1 */}
          <div className="glass p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image with Quote Overlay */}
              <div className="relative group">
                <img
                  src="/images/sarah.png"
                  alt="Sarah Chen"
                  className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Sarah Chen</h3>
                  <p className="text-lg font-medium mb-3">Software Engineer</p>
                  <blockquote className="text-sm italic leading-relaxed">
                    "CheatCards taught me to speak like a senior engineer. I practiced system design explanations until they became natural."
                  </blockquote>
                </div>
              </div>
              
              {/* Big Headlines/Facts */}
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h4 className="text-5xl font-bold text-orange-500 mb-2">Staff Engineer</h4>
                  <p className="text-xl opacity-90 mb-6">at Stripe in 6 months</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">$45k</div>
                    <div className="text-sm opacity-80">Salary Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">127</div>
                    <div className="text-sm opacity-80">Strategic Cards</div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6">
                  <h5 className="text-lg font-semibold mb-3 text-orange-500">The Challenge</h5>
                  <p className="text-sm opacity-90 mb-4">Struggling with technical interviews, couldn't articulate system design concepts clearly</p>
                  <h5 className="text-lg font-semibold mb-3 text-green-400">The Solution</h5>
                  <p className="text-sm opacity-90">Used CheatCards during mock interviews and architecture discussions to practice responses</p>
                </div>
              </div>
            </div>
            
            {/* Example Cards */}
            <div className="mt-12">
              <h4 className="text-2xl font-bold mb-6 text-center">CheatCards That Helped Sarah</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {personas[0].cards.map((card, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="text-xs font-bold text-orange-500 mb-3">{card.category}</div>
                    <div className="text-lg font-medium mb-4">{card.front}</div>
                    <div className="text-sm opacity-80 leading-relaxed">{card.back}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Marcus Rodriguez - Story 2 */}
          <div className="glass p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Big Headlines/Facts */}
              <div className="space-y-6 lg:order-1">
                <div className="text-center lg:text-left">
                  <h4 className="text-5xl font-bold text-purple-500 mb-2">PhD Defense</h4>
                  <p className="text-xl opacity-90 mb-6">Successfully Completed</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">4 Years</div>
                    <div className="text-sm opacity-80">Research Organized</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">156</div>
                    <div className="text-sm opacity-80">Research Cards</div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6">
                  <h5 className="text-lg font-semibold mb-3 text-orange-500">The Challenge</h5>
                  <p className="text-sm opacity-90 mb-4">Overwhelmed by research papers and advisor meetings, couldn't organize knowledge effectively</p>
                  <h5 className="text-lg font-semibold mb-3 text-green-400">The Solution</h5>
                  <p className="text-sm opacity-90">Used SenScript to turn research discussions and paper reviews into structured study cards</p>
                </div>
              </div>
              
              {/* Image with Quote Overlay */}
              <div className="relative group lg:order-2">
                <img
                  src="/images/marcus.png"
                  alt="Marcus Rodriguez"
                  className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Marcus Rodriguez</h3>
                  <p className="text-lg font-medium mb-3">PhD Student in Computer Science</p>
                  <blockquote className="text-sm italic leading-relaxed">
                    "My advisor meetings became structured knowledge. Four years of scattered research turned into a coherent academic story."
                  </blockquote>
                </div>
              </div>
            </div>
            
            {/* Example Cards */}
            <div className="mt-12">
              <h4 className="text-2xl font-bold mb-6 text-center">Research CheatCards That Helped Marcus</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {personas[1].cards.map((card, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="text-xs font-bold text-purple-500 mb-3">{card.category}</div>
                    <div className="text-lg font-medium mb-4">{card.front}</div>
                    <div className="text-sm opacity-80 leading-relaxed">{card.back}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lisa Weber - Story 3 */}
          <div className="glass p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image with Quote Overlay */}
              <div className="relative group">
                <img
                  src="/images/lisa.png"
                  alt="Lisa Weber"
                  className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Lisa Weber</h3>
                  <p className="text-lg font-medium mb-3">Polyglot Language Learner</p>
                  <blockquote className="text-sm italic leading-relaxed">
                    "SenScript works in all my target languages. I capture native conversations in German, Spanish, French - automatic flashcards in each language."
                  </blockquote>
                </div>
              </div>
              
              {/* Big Headlines/Facts */}
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h4 className="text-5xl font-bold text-indigo-500 mb-2">5 Languages</h4>
                  <p className="text-xl opacity-90 mb-6">Fluently Mastered</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">13</div>
                    <div className="text-sm opacity-80">Languages Supported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">200+</div>
                    <div className="text-sm opacity-80">Language Cards</div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6">
                  <h5 className="text-lg font-semibold mb-3 text-orange-500">The Challenge</h5>
                  <p className="text-sm opacity-90 mb-4">Learning 5 languages simultaneously, couldn't keep track of vocabulary and grammar patterns</p>
                  <h5 className="text-lg font-semibold mb-3 text-green-400">The Solution</h5>
                  <p className="text-sm opacity-90">SenScript's 13-language support helped capture native speaker conversations and create multilingual flashcards</p>
                </div>
              </div>
            </div>
            
            {/* Example Cards */}
            <div className="mt-12">
              <h4 className="text-2xl font-bold mb-6 text-center">Multilingual CheatCards That Helped Lisa</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {personas[2].cards.map((card, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="text-xs font-bold text-indigo-500 mb-3">{card.category}</div>
                    <div className="text-lg font-medium mb-4">{card.front}</div>
                    <div className="text-sm opacity-80 leading-relaxed">{card.back}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LLM Choice Section */}
      <section className="glass p-8">
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