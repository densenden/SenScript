'use client';

import { useState } from 'react';
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
      "Device audio capture",
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
      "600 minutes monthly",
      "Full CheatCard mode",
      "Interview categories",
      "Export to Anki, CSV, PDF",
      "Priority processing",
      "Email support",
      "€0.02/min overage"
    ],
    cta: "Start Essential",
    ctaLink: "#",
    popular: true,
    stripePriceId: "price_essential_monthly"
  },
  {
    name: "Professional",
    price: "€29.99", 
    period: "month",
    description: "Advanced CheatCards for career transformation",
    features: [
      "2500 minutes monthly",
      "Advanced CheatCard templates",
      "Industry-specific categories",
      "Custom interview prep packages",
      "Priority AI processing",
      "1-on-1 strategy session",
      "€0.015/min overage"
    ],
    cta: "Start Professional",
    ctaLink: "#",
    popular: false,
    stripePriceId: "price_professional_monthly"
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Staff Engineer at Stripe",
    image: "/images/sarah.png",
    rating: 5,
    quote: "Mock interviews → Strategic CheatCards → Staff Engineer at Stripe. The interview prep transformed my career trajectory."
  },
  {
    name: "Marcus Weber",
    title: "PhD Graduate", 
    image: "/images/marcus.png",
    rating: 5,
    quote: "Academic presentations → Research Cards → PhD Defense Success. 4 years of research organized into coherent defense."
  },
  {
    name: "Lisa Rodriguez",
    title: "Polyglot & Language Coach",
    image: "/images/lisa.png", 
    rating: 5,
    quote: "Foreign language podcasts → Multilingual Cards → 5 Languages Mastered. Perfect for pronunciation and vocabulary."
  }
];

const faqs = [
  {
    question: "How does device audio capture work?",
    answer: "We capture your computer's output audio (with permission) so any desktop app is supported - Teams, Zoom, Slack, Discord, local recordings, podcasts. On mobile we use microphone only. You can switch to microphone mode in the web app anytime."
  },
  {
    question: "What platforms are supported?",
    answer: "Desktop: Any application that plays audio (Teams, Zoom, Meet, Slack, Discord, Spotify, YouTube, local files). Mobile: Microphone input for live conversations. Browser: All web-based conferencing platforms."
  },
  {
    question: "How does CheatCard mode differ from regular flashcards?",
    answer: "CheatCards provide strategic interview responses, not just facts. They include tactical tips, context-aware content, and 'what to say vs what NOT to say' guidance that helps you sound senior-level."
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
    question: "Is my data secure and private?",
    answer: "Yes. SOC 2 compliant with local processing options. Audio is never stored permanently, and all CheatCards can be kept locally or encrypted in transit."
  },
  {
    question: "Can I upgrade or downgrade plans?",
    answer: "Yes, change plans anytime. Upgrades take effect immediately, downgrades at your next billing cycle. Minutes reset monthly (no rollover)."
  },
  {
    question: "What's the 15-minute boost option?",
    answer: "Quick €1 purchase for 15 extra minutes when you're running low. Perfect for finishing important sessions without interruption."
  }
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="glass p-6 mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-semibold pr-4">{question}</h3>
        <span className={`material-symbols-outlined transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`}>
          expand_more
        </span>
      </button>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm opacity-90 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
          <span className="material-symbols-outlined icon-xl text-purple-400 mb-4 block">
            devices
          </span>
          <h3 className="text-lg font-semibold mb-2">Universal Audio</h3>
          <p className="text-sm opacity-90">Desktop, mobile, any app</p>
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
          <p className="text-lg opacity-90">Everything you need to know about CheatCard technology</p>
        </div>
        <div className="content-max-width">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </section>

      {/* 15-Minute Boost Section */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Need Extra Minutes?</h2>
          <p className="text-lg opacity-90">Quick boost option for uninterrupted sessions</p>
        </div>
        <div className="glass p-6 max-w-md mx-auto text-center">
          <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block">
            flash_on
          </span>
          <h3 className="text-xl font-semibold mb-2">15-Minute Boost</h3>
          <div className="text-3xl font-bold text-orange-500 mb-4">€1</div>
          <p className="text-sm opacity-90 mb-6">
            Perfect for finishing important interviews or sessions without interruption. 
            One-click purchase, instant activation.
          </p>
          <button className="btn w-full">
            Add 15 Minutes
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Start Your CheatCard Journey
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands who've transformed conversations into career advancement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn btn-primary text-lg px-8 py-4">
              Start Free 90 Minutes
            </Link>
            <Link href="/about" className="btn text-lg px-8 py-4">
              Read Success Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}