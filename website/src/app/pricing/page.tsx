import Link from 'next/link';

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Perfect for trying CheatCard technology",
    features: [
      "90 minutes of processing",
      "Basic flashcard generation",
      "Export to JSON",
      "All 13 languages supported",
      "Chrome extension access",
      "Community support"
    ],
    cta: "Start Free",
    ctaLink: "/demo",
    popular: false,
    stripePriceId: null
  },
  {
    name: "Essential",
    price: "€9.99",
    period: "month",
    description: "Full CheatCard mode for serious preparation",
    features: [
      "200 minutes monthly",
      "Full CheatCard mode",
      "Interview categories",
      "Export to Anki, CSV, PDF",
      "Priority processing",
      "Email support",
      "€0.066/min overage"
    ],
    cta: "Start Essential",
    ctaLink: "#",
    popular: true,
    stripePriceId: "price_essential_monthly"
  },
  {
    name: "Premium",
    price: "€17.99", 
    period: "month",
    description: "Advanced CheatCards for career transformation",
    features: [
      "500 minutes monthly",
      "Advanced CheatCard templates",
      "Industry-specific categories",
      "Custom interview prep packages",
      "Priority AI processing",
      "1-on-1 strategy session",
      "€0.050/min overage"
    ],
    cta: "Start Premium",
    ctaLink: "#",
    popular: false,
    stripePriceId: "price_premium_monthly"
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Staff Engineer at Stripe",
    image: "/images/sarah.png",
    rating: 5,
    quote: "127 Strategic Cards led to my staff promotion and $45k salary increase. The interview prep was game-changing."
  },
  {
    name: "Marcus Rodriguez",
    title: "Senior PM at Notion", 
    image: "/images/marcus.png",
    rating: 5,
    quote: "203 Strategy Cards became my competitive advantage. Landed my dream role at Notion and led a $2M launch."
  },
  {
    name: "Lisa Weber",
    title: "Research Scientist at DeepMind",
    image: "/images/lisa.png", 
    rating: 5,
    quote: "156 Research Cards helped me synthesize 4 years into a coherent defense. Now at DeepMind doing what I love."
  }
];

const faqs = [
  {
    question: "How does CheatCard mode differ from regular flashcards?",
    answer: "CheatCards provide strategic interview responses, not just facts. They include 'what to say' vs 'what NOT to say' guidance, tactical interview tips, and context-aware content that helps you sound senior-level."
  },
  {
    question: "What languages are supported?",
    answer: "All 13 supported languages: English, German, Spanish, French, Italian, Portuguese, Dutch, Russian, Japanese, Korean, Chinese (Mandarin), Arabic, and Hindi with perfect accent recognition."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, cancel anytime with one click. No contracts, no hidden fees. Your CheatCards remain accessible even after cancellation."
  },
  {
    question: "How does the minute counting work?",
    answer: "We count actual processing time, not meeting length. A 60-minute meeting typically uses 45-50 minutes of processing time due to silence detection and optimization."
  },
  {
    question: "What conferencing platforms work with SenScript?",
    answer: "All web-based platforms: Teams, Zoom, Meet, WebEx, Slack, Discord, and more. Our universal audio capture works with any browser-based application."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes. SOC 2 compliant with local processing options. Audio is never stored permanently, and all CheatCards can be kept locally or encrypted in transit."
  },
  {
    question: "Do you offer refunds?",
    answer: "30-day money-back guarantee, no questions asked. If CheatCard technology doesn't transform your interview preparation, get a full refund."
  },
  {
    question: "Can I upgrade or downgrade plans?",
    answer: "Yes, change plans anytime. Upgrades take effect immediately, downgrades at your next billing cycle. Unused minutes roll over for one month."
  }
];

export default function Pricing() {
  return (
    <div className="container">
      {/* Header */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your <span className="text-orange-500">Success</span> Plan
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Transform conversations into career advancement with CheatCard technology. 
            Start free, upgrade when you're ready to dominate interviews.
          </p>
        </div>
      </section>

      {/* Value Props */}
      <section className="section-grid mb-8">
        <div className="glass p-6 text-center">
          <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block">
            bolt
          </span>
          <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
          <p className="text-sm opacity-90">Sub-3s CheatCard generation</p>
        </div>
        <div className="glass p-6 text-center">
          <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
            psychology
          </span>
          <h3 className="text-lg font-semibold mb-2">AI-Powered Intelligence</h3>
          <p className="text-sm opacity-90">Context-aware strategic content</p>
        </div>
        <div className="glass p-6 text-center">
          <span className="material-symbols-outlined icon-xl text-green-400 mb-4 block">
            security
          </span>
          <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
          <p className="text-sm opacity-90">SOC 2 compliant, local processing</p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="space-section">
        <div className="section-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`glass p-8 relative ${
              plan.popular ? 'ring-2 ring-orange-500' : ''
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-orange-500 mb-1">
                  {plan.price}
                  <span className="text-lg font-normal opacity-70">
                    {plan.period !== "forever" && `/${plan.period}`}
                  </span>
                </div>
                <p className="text-sm opacity-90">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-2">
                    <span className="material-symbols-outlined icon-sm text-green-400 mt-1">
                      check_circle
                    </span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={plan.ctaLink}
                className={`w-full text-center block py-3 px-6 rounded-lg font-semibold transition-all ${
                  plan.popular 
                    ? 'btn-primary' 
                    : 'btn'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Real Results from Real Professionals</h2>
          <p className="text-lg opacity-90">Career success stories with CheatCard technology</p>
        </div>
        <div className="section-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border-2 border-orange-500"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-orange-500">{testimonial.title}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined icon-sm text-orange-500">
                    star
                  </span>
                ))}
              </div>
              <p className="text-sm opacity-90 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-lg opacity-90">Everything you need to know about CheatCard pricing</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass p-6">
              <h3 className="text-lg font-semibold mb-3 text-orange-500">
                {faq.question}
              </h3>
              <p className="opacity-90 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of professionals who've turned conversations into competitive advantages
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="/about" className="btn text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
          <p className="text-sm opacity-70 mt-6">
            ✓ 30-day money-back guarantee &nbsp;&nbsp;•&nbsp;&nbsp; ✓ Cancel anytime &nbsp;&nbsp;•&nbsp;&nbsp; ✓ No contracts
          </p>
        </div>
      </section>
    </div>
  );
}