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
            Your smart meeting companion that transforms conversations into career-advancing 
            CheatCards. Works with all web platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn btn-primary text-lg px-8 py-4">
              Try Live Demo
            </Link>
            <Link href="/about" className="btn text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section id="features">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Why SenScript Transforms Careers</h2>
          <p className="text-lg opacity-90">Speed-first architecture meets strategic intelligence</p>
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

      {/* Success Stories Teasers */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-4xl font-bold mb-4">Career Transformation Stories</h2>
          <p className="text-xl opacity-90 mb-12">Real professionals. Real results. Real career breakthroughs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="glass p-6 text-center">
            <div className="mb-4">
              <img
                src="/images/sarah.png"
                alt="Sarah Chen"
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
              />
              <h3 className="text-lg font-semibold">Sarah Chen</h3>
              <p className="text-sm opacity-80">Software Engineer → Staff Engineer</p>
            </div>
            <p className="text-sm opacity-90 mb-4">
              "CheatCards taught me to speak like a senior engineer. I practiced system design explanations until they became natural."
            </p>
            <Link href="/about#sarah" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Learn Sarah's story →
            </Link>
          </div>
          
          <div className="glass p-6 text-center">
            <div className="relative mb-4">
              <img
                src="/images/marcus.png"
                alt="Marcus Rodriguez"
                className="w-full aspect-[4/3] object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                <h3 className="text-lg font-semibold">Marcus Rodriguez</h3>
                <p className="text-sm opacity-90">PhD Student in Computer Science</p>
                <p className="text-sm italic mt-2 leading-relaxed">
                  "My advisor meetings became structured knowledge. Four years of scattered research turned into a coherent academic story."
                </p>
              </div>
            </div>
            <Link href="/about#marcus" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Learn Marcus's story →
            </Link>
          </div>
          
          <div className="glass p-6 text-center">
            <div className="mb-4">
              <img
                src="/images/lisa.png"
                alt="Lisa Weber"
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
              />
              <h3 className="text-lg font-semibold">Lisa Weber</h3>
              <p className="text-sm opacity-80">Language Learner → Multilingual Expert</p>
            </div>
            <p className="text-sm opacity-90 mb-4">
              "SenScript works in all my target languages. I capture native conversations in German, Spanish, French - automatic flashcards in each language."
            </p>
            <Link href="/about#lisa" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Learn Lisa's story →
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
