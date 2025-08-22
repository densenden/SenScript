import Link from 'next/link';
import PersonaCard from '@/components/ui/PersonaCard';

const personas = [
  {
    name: "Sarah Chen",
    title: "Software Engineer",
    image: "/images/sarah.png",
    challenge: "Struggling with technical interviews, couldn't articulate system design concepts clearly",
    solution: "Used CheatCards during mock interviews and architecture discussions to practice responses",
    result: "Landed Staff Engineer role at Stripe using interview CheatCards",
    quote: "CheatCards taught me to speak like a senior engineer. I practiced system design explanations until they became natural.",
    cards: [
      { category: "INTERVIEW TIP", front: "How to respond to questions about customer acquisition cost, scaling plans, and burn rate when seeking funding?", back: "When seeking funding, it's essential to address questions on customer acquisition cost, scalability strategies, unique value proposition compared to competitors, burn rate, funding runway, and path to profitability. Provide concrete data on acquisition costs, growth plans, competitive advantages, financial sustainability, and profitability projections. Demonstrating a clear understanding of these metrics and outlining a viable path to profitability is crucial to instill confidence in investors." },
      { category: "CONCEPT", front: "Explain the key aspects of State Management in React and why Redux over useState?", back: "State Management in React involves managing and updating the state of components. Redux offers a centralized store for state management, providing a single source of truth and enabling predictable state changes. It is preferred over useState for complex applications due to its scalability and ease of debugging. Alternatives like Zustand and Context API offer different approaches. Performance issues can be addressed by optimizing component rendering, reducing unnecessary re-renders, and implementing code splitting." },
      { category: "MEETING TIP", front: "How to address being behind schedule in a project during a meeting effectively?", back: "When facing delays in a project, it's crucial to explain the reasons for the delay and present a plan to catch up. Focus on concrete solutions rather than excuses to regain lost time. To prevent future delays, propose measures like improved task management, regular progress tracking, and proactive issue resolution. Ensure to communicate these solutions clearly to stakeholders and emphasize implementing preventive actions to avoid similar setbacks." }
    ]
  },
  {
    name: "Marcus Rodriguez", 
    title: "PhD Student in Computer Science",
    image: "/images/marcus.png",
    challenge: "Overwhelmed by research papers and advisor meetings, couldn't organize knowledge effectively",
    solution: "Used SenScript to turn research discussions and paper reviews into structured study cards",
    result: "Successfully defending PhD thesis with organized research insights",
    quote: "My advisor meetings became structured knowledge. Four years of scattered research turned into a coherent academic story.",
    cards: [
      { category: "CONCEPT", front: "Explain the concept of Quantum Entanglement and Einstein's 'spooky action at a distance' with practical examples?", back: "Quantum Entanglement is a phenomenon where particles become interconnected and share state information regardless of distance. Einstein referred to this as 'spooky action at a distance,' questioning the instantaneous effect on entangled particles. A practical example is the correlation of spin states in entangled particles. In modern physics, Quantum Entanglement challenges classical notions of locality and has implications for quantum computing, cryptography, and understanding the fundamental nature of quantum mechanics." },
      { category: "KEY FACTS", front: "What is notable about the Finnish education system regarding reading and standardized tests?", back: "In the Finnish education system, students start reading at 7 but excel in PISA tests. The system emphasizes play, creativity, and critical thinking over standardized tests in early education. This approach fosters high academic achievement and innovative thinking among students, contributing to Finland's success in international education rankings like PISA." },
      { category: "INTERVIEW TIP", front: "How to differentiate between REST and GraphQL and optimize slow database queries in technical interviews?", back: "In technical interviews, explaining the distinctions between REST (Representational State Transfer) and GraphQL, understanding their use cases, and selecting the appropriate technology based on project requirements is crucial. When optimizing a slow database query, discuss strategies like indexing, query optimization, caching, or denormalization. Address high traffic issues by load testing, performance monitoring, identifying bottlenecks, scaling resources, and optimizing code for efficiency." }
    ]
  },
  {
    name: "Lisa Weber",
    title: "Polyglot Language Learner", 
    image: "/images/lisa.png",
    challenge: "Learning 5 languages simultaneously, couldn't keep track of vocabulary and grammar patterns",
    solution: "SenScript's 13-language support helped capture native speaker conversations and create multilingual flashcards",
    result: "Fluent in 5 languages, now teaching multilingual communication workshops",
    quote: "SenScript works in all my target languages. I capture native conversations in German, Spanish, French - automatic flashcards in each language.",
    cards: [
      { category: "QUICK WIN", front: "How can you improve your pronunciation of the 'ö' sound in Swedish?", back: "To pronounce the 'ö' sound in Swedish correctly, it's similar to the 'e' in 'her' or 'bird' but with rounded lips. A useful tip is to compare words like 'förr' (before) and 'får' (sheep) to practice the distinction. By practicing these two words at home and focusing on the 'ö' sound, you can improve your pronunciation significantly by differentiating between similar sounds and mastering the unique Swedish pronunciation." },
      { category: "CONCEPT", front: "What is 'Janteloven' and how does it influence communication in business contexts in Nordic countries?", back: "Janteloven is a set of social norms in Nordic countries emphasizing humility and collectivism over individual achievements. The core principle 'Du skal ikke tro at du er noe' (You shall not think you are anything special) guides interactions. In business settings, this influences Norwegian communication by discouraging boasting and favoring understatement. This cultural norm shapes communication by prioritizing modesty and group harmony over self-promotion." },
      { category: "INTERVIEW TIP", front: "How to effectively gather information about symptoms from a patient, including pain details and family history?", back: "When assessing a patient's symptoms, it's crucial to inquire about the exact onset of pain, its nature (constant or intermittent), intensity on a scale of 1 to 10, aggravating and alleviating factors, medication history, family medical background, and presence of other symptoms like nausea, dizziness, or shortness of breath. Encouraging the patient to provide specific details helps in accurate diagnosis and treatment planning." }
    ]
  }
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

export default function About() {
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Career Transformation Stories</h2>
          <p className="text-xl opacity-90 mb-16">The most interesting part: How real professionals transformed their careers</p>
        </div>
        
        <div className="space-y-24 max-w-8xl mx-auto">
          {/* Sarah Chen - Story 1 */}
          <div className="glass p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Image with Quote Overlay */}
              <div className="relative group lg:col-span-1">
                <img
                  src="/images/sarah.png"
                  alt="Sarah Chen"
                  className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Sarah Chen</h3>
                  <p className="text-lg font-medium mb-3">{personas[0].title}</p>
                  <blockquote className="text-sm italic leading-relaxed">
                    "{personas[0].quote}"
                  </blockquote>
                </div>
              </div>
              
              {/* Content */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-orange-500">The Challenge</h4>
                  <p className="text-lg mb-6">{personas[0].challenge}</p>
                  
                  <h4 className="text-2xl font-bold mb-4 text-green-400">The Result</h4>
                  <p className="text-lg font-semibold">{personas[0].result}</p>
                </div>
                
                {/* Example Cards */}
                <div>
                  <h4 className="text-xl font-bold mb-6 text-blue-400">Example CheatCards Generated</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {personas[0].cards.map((card, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                        <div className="text-xs font-bold text-orange-500 mb-2">{card.category}</div>
                        <div className="text-sm font-medium mb-2">{card.front}</div>
                        <div className="text-xs opacity-80 leading-relaxed">{card.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marcus Rodriguez - Story 2 */}
          <div className="glass p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Content */}
              <div className="lg:col-span-2 space-y-8 lg:order-1">
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-orange-500">The Challenge</h4>
                  <p className="text-lg mb-6">{personas[1].challenge}</p>
                  
                  <h4 className="text-2xl font-bold mb-4 text-green-400">The Result</h4>
                  <p className="text-lg font-semibold">{personas[1].result}</p>
                </div>
                
                {/* Example Cards */}
                <div>
                  <h4 className="text-xl font-bold mb-6 text-blue-400">Example Research CheatCards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {personas[1].cards.map((card, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                        <div className="text-xs font-bold text-purple-500 mb-2">{card.category}</div>
                        <div className="text-sm font-medium mb-2">{card.front}</div>
                        <div className="text-xs opacity-80 leading-relaxed">{card.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Image with Quote Overlay */}
              <div className="relative group lg:col-span-1 lg:order-2">
                <img
                  src="/images/marcus.png"
                  alt="Marcus Rodriguez"
                  className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Marcus Rodriguez</h3>
                  <p className="text-lg font-medium mb-3">{personas[1].title}</p>
                  <blockquote className="text-sm italic leading-relaxed">
                    "{personas[1].quote}"
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          {/* Lisa Weber - Story 3 */}
          <div className="glass p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Image with Quote Overlay */}
              <div className="relative group lg:col-span-1">
                <img
                  src="/images/lisa.png"
                  alt="Lisa Weber"
                  className="w-full aspect-[4/3] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Lisa Weber</h3>
                  <p className="text-lg font-medium mb-3">{personas[2].title}</p>
                  <blockquote className="text-sm italic leading-relaxed">
                    "{personas[2].quote}"
                  </blockquote>
                </div>
              </div>
              
              {/* Content */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-orange-500">The Challenge</h4>
                  <p className="text-lg mb-6">{personas[2].challenge}</p>
                  
                  <h4 className="text-2xl font-bold mb-4 text-green-400">The Result</h4>
                  <p className="text-lg font-semibold">{personas[2].result}</p>
                </div>
                
                {/* Example Cards */}
                <div>
                  <h4 className="text-xl font-bold mb-6 text-blue-400">Example Multilingual CheatCards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {personas[2].cards.map((card, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                        <div className="text-xs font-bold text-indigo-500 mb-2">{card.category}</div>
                        <div className="text-sm font-medium mb-2">{card.front}</div>
                        <div className="text-xs opacity-80 leading-relaxed">{card.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
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