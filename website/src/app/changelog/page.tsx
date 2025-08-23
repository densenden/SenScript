'use client';

import Link from 'next/link';

const releases = [
  {
    version: "v3.2.0",
    date: "August 23, 2025",
    status: "latest",
    changes: [
      {
        type: "feature",
        title: "Perfect Navbar Layout",
        description: "Enhanced navigation with three-section distribution for better user experience",
        commit: "a025169"
      },
      {
        type: "feature", 
        title: "Interactive FAQ Section",
        description: "Improved pricing page with expandable FAQ items and better engagement",
        commit: "a838cec"
      },
      {
        type: "ui",
        title: "Enhanced Clerk Integration",
        description: "Perfect navbar alignment with seamless Clerk UserButton styling",
        commit: "132d74b"
      },
      {
        type: "fix",
        title: "Production Deployment",
        description: "Optimized deployment configuration for Vercel production environment",
        commit: "5b62e25"
      }
    ]
  },
  {
    version: "v3.1.0", 
    date: "August 20, 2025",
    status: "stable",
    changes: [
      {
        type: "feature",
        title: "Complete Stripe Integration",
        description: "Full payment infrastructure with Clerk authentication and subscription management",
        commit: "6ff0ca4"
      },
      {
        type: "feature",
        title: "Glass Morphism Design",
        description: "Complete marketing website redesign with modern glass morphism effects",
        commit: "09c1959"
      },
      {
        type: "improvement",
        title: "Next.js App Router",
        description: "Migrated to Next.js App Router architecture for better performance",
        commit: "2635d50"
      }
    ]
  },
  {
    version: "v3.0.0",
    date: "August 15, 2025", 
    status: "stable",
    changes: [
      {
        type: "feature",
        title: "Mobile Frame Demo",
        description: "Comprehensive mobile frame integration with enhanced demo experience", 
        commit: "cc97dd1"
      },
      {
        type: "feature",
        title: "CheatCard Technology",
        description: "Revolutionary CheatCard focus with strategic interview preparation",
        commit: "8f596fc"
      },
      {
        type: "improvement",
        title: "Language Handling",
        description: "Major improvements to language flags and output language respect",
        commit: "12c351b"
      },
      {
        type: "feature",
        title: "Unified Card System", 
        description: "Revolutionary unified card birth system with single-container morphing",
        commit: "4701a43"
      }
    ]
  },
  {
    version: "v2.8.0",
    date: "August 10, 2025",
    status: "archive", 
    changes: [
      {
        type: "feature",
        title: "Conversational Scenarios",
        description: "Transformed test scenarios to direct conversational situations",
        commit: "c5b5a2e"
      },
      {
        type: "feature",
        title: "Test Transcript Display", 
        description: "Enhanced testing with visible transcripts in transcript window",
        commit: "b2004ac"
      },
      {
        type: "fix",
        title: "Card Creation Optimization",
        description: "Removed undefined confidence percentages and improved card reliability",
        commit: "7464a2a"
      }
    ]
  }
];

const upcomingFeatures = [
  {
    title: "Team Collaboration",
    description: "Shared card libraries for organizations", 
    eta: "Q2 2025"
  },
  {
    title: "Advanced Export Options",
    description: "Direct integration with Notion, Slack, and Jira",
    eta: "Q2 2025"  
  },
  {
    title: "AI Provider Expansion",
    description: "Support for Gemini, Llama, and custom endpoints",
    eta: "Q3 2025"
  }
];

export default function Changelog() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            SenScript <span className="text-orange-500">Changelog</span>
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Track every improvement, feature, and fix as we build the future of strategic learning.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="section-grid mb-8">
        <div className="glass p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">20+</div>
          <div className="text-sm opacity-80">Updates This Month</div>
        </div>
        <div className="glass p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">4</div>
          <div className="text-sm opacity-80">Major Releases</div>
        </div>
        <div className="glass p-6 text-center">
          <div className="text-3xl font-bold text-orange-500 mb-2">100%</div>
          <div className="text-sm opacity-80">Uptime</div>
        </div>
      </section>

      {/* Release History */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Release History</h2>
          <p className="text-lg opacity-90">Every update brings you closer to strategic mastery</p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {releases.map((release, releaseIndex) => (
            <div key={releaseIndex} className="glass p-8">
              {/* Release Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    release.status === 'latest' ? 'bg-orange-500 text-white' :
                    release.status === 'stable' ? 'bg-green-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {release.version}
                  </div>
                  {release.status === 'latest' && (
                    <div className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                      Latest
                    </div>
                  )}
                </div>
                <div className="text-sm opacity-70">{release.date}</div>
              </div>

              {/* Changes */}
              <div className="space-y-4">
                {release.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      change.type === 'feature' ? 'bg-green-500/20 text-green-400' :
                      change.type === 'fix' ? 'bg-red-500/20 text-red-400' :
                      change.type === 'improvement' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {change.type}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{change.title}</h4>
                      <p className="text-sm opacity-90 mb-2">{change.description}</p>
                      <div className="flex items-center space-x-2 text-xs opacity-60">
                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}>
                          commit
                        </span>
                        <span>{change.commit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Coming Soon</h2>
          <p className="text-lg opacity-90">Features in active development</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{feature.title}</h3>
                <div className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                  {feature.eta}
                </div>
              </div>
              <p className="text-sm opacity-90">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Stay Updated</h2>
          <p className="text-lg opacity-90">Never miss an important update or new feature</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
              notifications
            </span>
            <h3 className="text-lg font-semibold mb-2">Release Notifications</h3>
            <p className="text-sm opacity-90 mb-4">
              Get notified when we ship new features and improvements
            </p>
            <Link href="/contact" className="btn btn-primary">
              Subscribe to Updates
            </Link>
          </div>
          
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-green-400 mb-4 block">
              code
            </span>
            <h3 className="text-lg font-semibold mb-2">Developer Updates</h3>
            <p className="text-sm opacity-90 mb-4">
              Technical details and API changes for power users
            </p>
            <Link href="/roadmap" className="btn">
              View Roadmap
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Try the Latest Version
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Experience all the new features and improvements in SenScript {releases[0].version}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn btn-primary text-lg px-8 py-4">
              Try SenScript Free
            </Link>
            <Link href="/pricing" className="btn text-lg px-8 py-4">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}