import Link from 'next/link';

export default function About() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-orange-500">SenScript</span>
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Learn about our mission, technology, and the team behind SenScript
          </p>
        </div>
      </section>

      {/* Studio Sen Philosophy */}
      <section className="space-section" id="studio-sen">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Built by Studio Sen</h2>
          <p className="text-lg opacity-90">Where design strategy meets technical excellence</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block">
              flash_on
            </span>
            <h3 className="text-lg font-semibold mb-3">Agentic Coding</h3>
            <p className="text-sm opacity-90">
              Every line of code serves the user's emotional journey. Functional beauty meets lightning speed.
            </p>
          </div>

          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
              speed
            </span>
            <h3 className="text-lg font-semibold mb-3">Velocity Without Compromise</h3>
            <p className="text-sm opacity-90">
              4-8 week MVP cycles. We eliminate friction and automate repetition while maintaining quality.
            </p>
          </div>

          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-purple-400 mb-4 block">
              account_tree
            </span>
            <h3 className="text-lg font-semibold mb-3">Systems Thinking</h3>
            <p className="text-sm opacity-90">
              We don't build features. We build ecosystems that evolve intelligently with user needs.
            </p>
          </div>
        </div>

        <div className="glass p-8 mt-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4">Single-Brain Execution</h3>
            <p className="opacity-90 leading-relaxed mb-6">
              SenScript represents the Studio Sen methodology: <strong>no translation layers</strong> between design vision and technical implementation. 
              When creative design rigor meets contemporary technical capabilities, products feel "alive" and invite engagement.
            </p>
            <blockquote className="text-lg italic text-orange-500 font-medium">
              "I don't build for screens. I build for people."
            </blockquote>
            <cite className="text-sm opacity-70 block mt-2">— Denis Kreuzer, Studio Sen Founder</cite>
            
            <div className="mt-8">
              <a href="https://dev.sen.studio" target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex items-center gap-2">
                <span className="material-symbols-outlined icon-sm">open_in_new</span>
                Visit Studio Sen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Journey */}
      <section className="space-section" id="innovation">
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

      {/* Philosophy */}
      <section className="glass p-8" id="philosophy">
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

      {/* Back to Resources */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Learn More About SenScript
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Explore our technology, use cases, and detailed information
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/more-information" className="btn btn-primary text-lg px-8 py-4">
              Technical Details
            </Link>
            <Link href="/use-cases" className="btn text-lg px-8 py-4">
              See Use Cases
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}