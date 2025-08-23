import Link from 'next/link';
import PersonaCard from '@/components/ui/PersonaCard';
import FeatureCard from '@/components/ui/FeatureCard';

const personas = [
  {
    name: "Sarah Chen",
    title: "Staff Engineer at Stripe",
    image: "/images/sarah.png",
    result: "Staff promotion in 6 months with $45k salary increase using 127 Strategic Cards",
    quote: "SenScript taught me to speak like a staff engineer. The patterns I captured from architecture reviews became my interview superpower."
  },
  {
    name: "Marcus Rodriguez", 
    title: "Senior PM at Notion",
    image: "/images/marcus.png",
    result: "Landed dream PM role at Notion and launched $2M product with 203 Strategy Cards",
    quote: "From startup PM to big tech in 4 months. SenScript turned executive meeting insights into my competitive advantage."
  },
  {
    name: "Lisa Weber",
    title: "Research Scientist at DeepMind", 
    image: "/images/lisa.png",
    result: "PhD defense success and DeepMind position secured with 156 Research Cards",
    quote: "Four years of scattered research became a coherent story. Now I'm doing quantum ML research at DeepMind."
  }
];

const features = [
  {
    icon: "bolt",
    title: "Sub-3s Generation",
    description: "Real-time flashcard creation from any conversation. Lightning-fast AI processing that keeps pace with natural speech.",
    accent: true
  },
  {
    icon: "language",
    title: "13-Language Support", 
    description: "Works seamlessly in English, German, Spanish, French, and 9 other languages with perfect accent recognition."
  },
  {
    icon: "devices",
    title: "Universal Compatibility",
    description: "Teams, Zoom, Meet, Slack, phone calls - works with any audio source through your Chrome browser."
  },
  {
    icon: "psychology",
    title: "AI-Powered Intelligence",
    description: "Context-aware CheatCard generation that understands interview strategy, not just basic Q&A."
  },
  {
    icon: "security",
    title: "Privacy-First Design",
    description: "Local processing with optional cloud AI. Your conversations stay private with SOC 2 compliance."
  },
  {
    icon: "download",
    title: "Export Anywhere",
    description: "Anki, CSV, JSON, or print-ready PDFs. Your study materials work with any learning system."
  }
];

export default function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Turn Any <span className="text-orange-500">Conversation</span><br />
            Into Study Materials
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Your smart meeting companion that transforms team meetings and calls into organized 
            flashcards. Works with all web platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn btn-primary text-lg px-8 py-4">
              Try Live Demo
            </Link>
            <Link href="/more-information" className="btn text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section id="features">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Why SenScript Boosts Team Productivity</h2>
          <p className="text-lg opacity-90">Speed-first architecture meets intelligent note-taking</p>
        </div>
        <div className="section-grid">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accent={feature.accent}
            />
          ))}
        </div>
      </section>

      {/* Use Cases Hero - Full Width */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-4xl font-bold mb-4">Use Cases</h2>
          <p className="text-xl opacity-90 mb-12">Real professionals using SenScript for everyday productivity.</p>
        </div>
        
        {/* Full-width containers for the two main scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          <div className="glass p-8">
            <img 
              src="/images/interview-scenarios/desktop.png" 
              alt="SenScript running during a Teams meeting"
              className="w-full aspect-[3/2] object-cover rounded-2xl mb-6"
            />
            <h3 className="text-2xl font-bold mb-4 text-orange-500">Desktop Meeting Listening</h3>
            <p className="text-lg opacity-90 mb-4">Transform every meeting into organized study materials</p>
            <p className="opacity-80 leading-relaxed">
              Cards appear in real-time during Teams, Zoom, or any web meeting. SenScript's smart listening 
              system automatically creates instant answers without prompting - just listen and learn. 
              Perfect for team meetings, client calls, and professional development sessions.
            </p>
          </div>
          <div className="glass p-8">
            <img 
              src="/images/interview-scenarios/mobile.png" 
              alt="Mobile phone near TV capturing audio"
              className="w-full aspect-[3/2] object-cover rounded-2xl mb-6"
            />
            <h3 className="text-2xl font-bold mb-4 text-orange-500">Mobile Audio Listening</h3>
            <p className="text-lg opacity-90 mb-4">Learn from any audio source, anywhere</p>
            <p className="opacity-80 leading-relaxed">
              Use your phone's microphone to capture audio from TV shows, podcasts, lectures, or conversations. 
              SenScript works universally - no app integrations needed. Get instant answers on demand without 
              prompting through our smart listening system. Great for language learning, educational content, 
              and casual learning opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* User Stories Preview */}
      <section className="space-section">
        <div className="content-center space-large mb-8">
          <h2 className="text-3xl font-bold">Real People, Real Results</h2>
          <p className="text-lg opacity-90">See how professionals use SenScript to accelerate their learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass p-6">
            <img
              src="/images/sarah.png"
              alt="Sarah"
              className="w-full aspect-[4/3] object-cover rounded-2xl mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Sarah</h3>
            <p className="text-sm opacity-80 mb-3">Software Engineer</p>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">
              "Mock interviews → Strategic CheatCards → Staff Engineer promotion. SenScript transformed my interview prep."
            </p>
            <Link href="/use-cases#sarah" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Read Sarah's story →
            </Link>
          </div>
          
          <div className="glass p-6">
            <img
              src="/images/marcus.png"
              alt="Marcus"
              className="w-full aspect-[4/3] object-cover rounded-2xl mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Marcus</h3>
            <p className="text-sm opacity-80 mb-3">PhD Graduate</p>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">
              "Four years of scattered research notes became a coherent PhD defense story through advisor meeting cards."
            </p>
            <Link href="/use-cases#marcus" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Read Marcus's story →
            </Link>
          </div>
          
          <div className="glass p-6">
            <img
              src="/images/lisa.png"
              alt="Lisa"
              className="w-full aspect-[4/3] object-cover rounded-2xl mb-4"
            />
            <h3 className="text-xl font-bold mb-2">Lisa</h3>
            <p className="text-sm opacity-80 mb-3">Language Coach</p>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">
              "Native conversations → Automatic flashcards → Fluency in 5 languages. Works perfectly in any language."
            </p>
            <Link href="/use-cases#lisa" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Read Lisa's story →
            </Link>
          </div>
        </div>
      </section>

      {/* Universal Compatibility */}
      <section className="glass p-8 content-max-width-large">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Works Everywhere, With Everything</h2>
          <p className="text-lg opacity-90">Universal audio capture technology</p>
        </div>
        <div className="section-grid">
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
              video_call
            </span>
            <h3 className="text-lg font-semibold mb-2">Web Conferencing</h3>
            <p className="text-sm opacity-90">Teams, Zoom, Meet, WebEx, Slack</p>
          </div>
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-green-400 mb-4 block">
              school
            </span>
            <h3 className="text-lg font-semibold mb-2">Education</h3>
            <p className="text-sm opacity-90">Lectures, seminars, study groups</p>
          </div>
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-purple-400 mb-4 block">
              business_center
            </span>
            <h3 className="text-lg font-semibold mb-2">Professional</h3>
            <p className="text-sm opacity-90">Interviews, meetings, training</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Never Miss an Opportunity Again?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands who've transformed conversations into career success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="btn btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="/demo" className="btn text-lg px-8 py-4">
              Watch Demo
            </Link>
          </div>
          <p className="text-sm opacity-70 mt-4">
            No credit card required • Cancel anytime • SOC 2 Compliant
          </p>
        </div>
      </section>
    </div>
  );
}
