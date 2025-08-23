'use client';

import { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

const steps = [
  {
    step: 1,
    title: "Sign Up",
    description: "Auth with Apple ID, GitHub, Google, or email",
    icon: "person_add"
  },
  {
    step: 2,
    title: "Start Meeting",
    description: "Start your meeting or lecture and let SenScript listen",
    icon: "launch"
  },
  {
    step: 3,
    title: "Generate Cards", 
    description: "Get flashcards and cheatcards instantly",
    icon: "auto_awesome"
  }
];

const useCaseExamples = [
  {
    title: "Job Interviews",
    persona: "Sarah",
    description: "Mock interviews → Strategic CheatCards → Senior Engineer promotion",
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
    
    // Redirect to info page (webapp not ready yet)
    setTimeout(() => {
      const infoUrl = `https://getscript.sen.studio?source=demo`;
      window.open(infoUrl, '_blank');
      setIsStarting(false);
    }, 1500);
  };

  return (
    <div className="container">
      {/* Development Notice */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-orange-400 font-medium">
            🚧 WebApp in Development - Check current status:
          </p>
          <a 
            href="https://getscript.sen.studio" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm"
          >
            Visit getscript.sen.studio
          </a>
        </div>
      </div>

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
          <div className="flex flex-col items-center gap-4">
            {isSignedIn ? (
              <>
                <button 
                  onClick={handleStartApp}
                  disabled={isStarting}
                  className={`btn btn-primary text-xl px-12 py-6 flex items-center space-x-3 ${
                    isStarting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  {isStarting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Opening Info Page...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined icon-lg">info</span>
                      <span>Get Development Updates</span>
                    </>
                  )}
                </button>
                <p className="text-sm opacity-70">✓ Already signed in as {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}</p>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="btn btn-primary text-xl px-12 py-6 flex items-center space-x-3 hover:scale-105">
                  <span className="material-symbols-outlined icon-lg">login</span>
                  <span>Sign Up & Start Free</span>
                </button>
              </SignInButton>
            )}
          </div>
          <div className="text-sm opacity-70 mt-4 text-center">
            {isSignedIn ? (
              <div className="flex items-center justify-center gap-4">
                <span>✓ Account ready • Webapp in development</span>
                <a href="https://getscript.sen.studio" target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-1">
                  Updates
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span>Sign up with OAuth • Takes 30 seconds</span>
                <a href="https://getscript.sen.studio" target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-1">
                  Info Page
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">3 Steps to Success</h2>
          <p className="text-lg opacity-90">Complete flow in under 2 minutes</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {steps.map((step, index) => (
            <div key={index} className="glass p-8 flex flex-col min-h-[400px]">
              <div className="relative mb-6">
                <img 
                  src={`/images/step${step.step}.png`}
                  alt={`Step ${step.step}: ${step.title}`}
                  className="w-full aspect-[3/2] object-cover object-top rounded-[12px]"
                />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
              </div>
              <p className="opacity-90 leading-relaxed flex-1">{step.description}</p>
              {step.step === 3 && (
                <div className="mt-6">
                  <Link 
                    href="/more-information#cheatcards-vs-flashcards" 
                    className="btn btn-sm bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2"
                  >
                    More Info
                  </Link>
                </div>
              )}
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
          <h2 className="text-3xl font-bold">What You'll Get in the SenScript App</h2>
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
                {isStarting ? 'Opening Info...' : 'Get Development Updates'}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="btn btn-primary text-lg px-8 py-4">
                  Sign Up for Early Access
                </button>
              </SignInButton>
            )}
            <Link href="/use-cases" className="btn text-lg px-8 py-4">
              Read Success Stories
            </Link>
          </div>
          <div className="text-sm opacity-70 mt-6 text-center">
            {isSignedIn ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <span>✓ Account ready for early access</span>
                <span>•</span>
                <a href="https://getscript.sen.studio" target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-1">
                  Development Updates
                </a>
              </div>
            ) : (
              <p>✓ Free signup • ✓ Early access • ✓ Development updates</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}