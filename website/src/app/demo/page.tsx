'use client';

import { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

const steps = [
  {
    step: 1,
    title: "Create Free Account",
    description: "Sign up with OAuth - takes 30 seconds",
    icon: "person_add"
  },
  {
    step: 2,
    title: "Launch SenScript App",
    description: "Redirected to script.sen.studio - your 90 minutes start when you record",
    icon: "launch"
  },
  {
    step: 3,
    title: "Generate CheatCards", 
    description: "Join meetings, capture audio - watch strategic study materials appear instantly",
    icon: "auto_awesome"
  }
];

const useCaseExamples = [
  {
    title: "Job Interviews",
    persona: "Sarah",
    description: "Mock interviews → Strategic CheatCards → Staff Engineer at Stripe",
    category: "INTERVIEW TIP",
    example: "How to explain system design concepts clearly?",
    color: "text-orange-500"
  },
  {
    title: "Academic Research", 
    persona: "Marcus",
    description: "Academic presentations (Fachvorträge) → Research Cards → PhD Defense Success",
    category: "CONCEPT",
    example: "Quantum Entanglement and Einstein's theory explained",
    color: "text-purple-500"
  },
  {
    title: "Language Learning",
    persona: "Lisa", 
    description: "Foreign language podcasts → Multilingual Cards → 5 Languages Mastered",
    category: "QUICK WIN",
    example: "How to improve Swedish 'ö' pronunciation?",
    color: "text-indigo-500"
  }
];

export default function Demo() {
  const { isSignedIn, user } = useUser();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartApp = () => {
    if (!isSignedIn) {
      // This shouldn't happen as the button should show SignInButton instead
      return;
    }
    
    setIsStarting(true);
    
    // Redirect authenticated users to script.sen.studio
    setTimeout(() => {
      const scriptUrl = `https://script.sen.studio?auth=${user?.id}&source=demo&trial=true`;
      window.open(scriptUrl, '_blank');
      setIsStarting(false);
    }, 1500);
  };

  return (
    <div className="container">
      {/* Hero - Immediate Action */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your <span className="text-orange-500">Free</span> 90 Minutes
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            No demo simulation - get immediate access to the real SenScript application. 
            Your free trial minutes only count when you're actively recording.
          </p>
          {isSignedIn ? (
            <button 
              onClick={handleStartApp}
              disabled={isStarting}
              className={`btn btn-primary text-xl px-12 py-6 flex items-center space-x-3 mx-auto ${
                isStarting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isStarting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Opening SenScript App...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined icon-lg">play_arrow</span>
                  <span>Launch SenScript Now</span>
                </>
              )}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="btn btn-primary text-xl px-12 py-6 flex items-center space-x-3 mx-auto hover:scale-105">
                <span className="material-symbols-outlined icon-lg">login</span>
                <span>Sign Up & Start Free</span>
              </button>
            </SignInButton>
          )}
          <p className="text-sm opacity-70 mt-4">
            {isSignedIn 
              ? 'Opens script.sen.studio in new tab • No installation required'
              : 'Sign up with OAuth • Takes 30 seconds • No installation required'
            }
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">From Sign-Up to CheatCards in 3 Steps</h2>
          <p className="text-lg opacity-90">Complete flow takes under 2 minutes</p>
        </div>
        <div className="section-grid">
          {steps.map((step, index) => (
            <div key={index} className="glass p-8 text-center">
              <div className="w-20 h-20 glass border-2 border-white/20 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                <span className="text-orange-500">{step.step}</span>
              </div>
              <span className={`material-symbols-outlined icon-xl mb-4 block ${
                index === 0 ? 'text-blue-400' : 
                index === 1 ? 'text-purple-400' : 'text-green-400'
              }`}>
                {step.icon}
              </span>
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="opacity-90 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Real Success Stories */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Real People, Real Results</h2>
          <p className="text-lg opacity-90">See how professionals use SenScript every day</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {useCaseExamples.map((useCase, index) => (
            <div key={index} className="space-y-6">
              <div className="text-center">
                <h3 className={`text-2xl font-semibold mb-2 ${useCase.color}`}>
                  {useCase.title}
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  {useCase.description}
                </p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    index === 0 ? 'bg-orange-500' : 
                    index === 1 ? 'bg-purple-500' : 'bg-indigo-500'
                  } text-white`}>
                    {useCase.category}
                  </span>
                  <span className="text-xs opacity-60">Real Example</span>
                </div>
                <div className="text-sm font-medium mb-3">{useCase.example}</div>
                <div className="text-xs opacity-80">
                  Generated from real {useCase.persona.toLowerCase()} recordings
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* App Features Preview */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">What You Get in script.sen.studio</h2>
          <p className="text-lg opacity-90">Full-featured CheatCard workspace</p>
        </div>
        <div className="section-grid">
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block">
              bolt
            </span>
            <h3 className="text-lg font-semibold mb-2">Real-Time Generation</h3>
            <p className="text-sm opacity-90">CheatCards appear during live conversations</p>
          </div>
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
              category
            </span>
            <h3 className="text-lg font-semibold mb-2">Smart Categories</h3>
            <p className="text-sm opacity-90">Interview Tips, Quick Wins, Key Facts, Concepts</p>
          </div>
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-green-400 mb-4 block">
              download
            </span>
            <h3 className="text-lg font-semibold mb-2">Export Anywhere</h3>
            <p className="text-sm opacity-90">Anki, CSV, JSON, or print-ready formats</p>
          </div>
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-purple-400 mb-4 block">
              language
            </span>
            <h3 className="text-lg font-semibold mb-2">13 Languages</h3>
            <p className="text-sm opacity-90">Native-level accuracy in all supported languages</p>
          </div>
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-indigo-500 mb-4 block">
              devices
            </span>
            <h3 className="text-lg font-semibold mb-2">Universal Compatibility</h3>
            <p className="text-sm opacity-90">Teams, Zoom, Meet, podcasts, any audio source</p>
          </div>
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-rose-500 mb-4 block">
              security
            </span>
            <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
            <p className="text-sm opacity-90">Local processing, SOC 2 compliant, no data retention</p>
          </div>
        </div>
      </section>

      {/* Pricing Context */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Free Trial Details</h2>
          <p className="text-lg opacity-90">Everything you need to know about your 90 free minutes</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-orange-500">90</div>
            <div className="text-sm opacity-80">Free Minutes</div>
            <div className="text-xs opacity-60">No credit card required</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-blue-400">13</div>
            <div className="text-sm opacity-80">Languages</div>
            <div className="text-xs opacity-60">Including German, Spanish, French</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-green-400">∞</div>
            <div className="text-sm opacity-80">Export Formats</div>
            <div className="text-xs opacity-60">Anki, CSV, JSON, PDF</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-purple-400">€0</div>
            <div className="text-sm opacity-80">During Trial</div>
            <div className="text-xs opacity-60">Upgrade when ready</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Your CheatCard Journey Starts Now
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands who've transformed conversations into career advancement. 
            No commitment, no risk - just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <button 
                onClick={handleStartApp}
                disabled={isStarting}
                className="btn btn-primary text-lg px-8 py-4"
              >
                {isStarting ? 'Opening App...' : 'Start Free 90 Minutes'}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="btn btn-primary text-lg px-8 py-4">
                  Sign Up & Start Free
                </button>
              </SignInButton>
            )}
            <Link href="/use-cases" className="btn text-lg px-8 py-4">
              Read Success Stories
            </Link>
          </div>
          <p className="text-sm opacity-70 mt-6">
            ✓ Opens script.sen.studio instantly &nbsp;&nbsp;•&nbsp;&nbsp; ✓ No downloads &nbsp;&nbsp;•&nbsp;&nbsp; ✓ Works in any browser
          </p>
        </div>
      </section>
    </div>
  );
}