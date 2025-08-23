'use client';

import Link from 'next/link';

const roadmapItems = [
  {
    phase: "Launched Last Week",
    status: "completed",
    items: [
      {
        title: "SenScript v3.0 Launch (beta1)",
        description: "Chrome Web App with universal audio capture",
        completed: true
      },
      {
        title: "Multi-Language Support",
        description: "13 languages with perfect accent recognition",
        completed: true
      },
      {
        title: "CheatCard Technology",
        description: "Strategic interview responses, not just facts",
        completed: true
      }
    ]
  },
  {
    phase: "Performance Focus (Next 2-4 weeks)",
    status: "in-progress",
    items: [
      {
        title: "Sub-2s Card Generation",
        description: "Optimize AI processing pipeline for faster card creation",
        completed: false
      },
      {
        title: "Enhanced Card Quality",
        description: "Improve strategic content accuracy and relevance",
        completed: false
      },
      {
        title: "LLM Provider Expansion",
        description: "Support for DeepSeek, Anthropic Claude, Gemini, and custom endpoints",
        completed: false
      }
    ]
  },
  {
    phase: "Native Apps (Next month)",
    status: "planned",
    items: [
      {
        title: "iOS Native App",
        description: "React Native (Expo) with native STT and RevenueCat billing",
        completed: false
      },
      {
        title: "Android Native App",
        description: "Full feature parity with iOS, Google Play Billing integration",
        completed: false
      },
      {
        title: "Desktop App (Frameless)",
        description: "Electron/Tauri app with system audio capture and custom rounded UI",
        completed: false
      }
    ]
  },
  {
    phase: "Future Platforms (If userbase grows)",
    status: "future",
    items: [
      {
        title: "Smart Glasses Integration",
        description: "Ray-Ban Meta, Apple Vision Pro support for hands-free CheatCards",
        completed: false
      },
      {
        title: "CarPlay App",
        description: "Learn during commutes with voice-activated card review",
        completed: false
      },
      {
        title: "Augmented Reality Mode",
        description: "Overlay CheatCards in real-world presentations and meetings",
        completed: false
      }
    ]
  },
  {
    phase: "Community Ideas (Backlog)",
    status: "backlog",
    items: [
      {
        title: "Team Collaboration",
        description: "Shared card libraries for organizations",
        completed: false
      },
      {
        title: "Smart Clustering",
        description: "Automatically group related cards into threads",
        completed: false
      },
      {
        title: "Advanced Export Options",
        description: "Direct integration with Notion, Slack, and Jira",
        completed: false
      }
    ]
  }
];

const features = [
  {
    icon: "flash_on",
    title: "Agentic Coding Approach",
    description: "Every line serves the user's emotional journey - functional beauty meets speed"
  },
  {
    icon: "trending_up",
    title: "Velocity Without Compromise",
    description: "4-8 week MVP cycles, eliminating friction while maintaining quality"
  },
  {
    icon: "psychology",
    title: "Systems Thinking",
    description: "We don't build features. We build ecosystems that evolve with your needs"
  }
];

export default function Roadmap() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            SenScript <span className="text-orange-500">Roadmap</span>
          </h1>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Built with the <strong>SenDev approach</strong> - rapid iteration, single-brain execution, no quarterly delays. 
            <a href="https://dev.sen.studio" target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4 inline-flex items-center gap-2">
              <span className="material-symbols-outlined icon-sm">open_in_new</span>
              Learn Our Philosophy
            </a>
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="section-grid mb-8">
        {features.map((feature, index) => (
          <div key={index} className="glass p-6 text-center">
            <span className={`material-symbols-outlined icon-xl mb-4 block ${
              index === 0 ? 'text-orange-500' : 
              index === 1 ? 'text-blue-400' : 'text-green-400'
            }`}>
              {feature.icon}
            </span>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm opacity-90">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Timeline */}
      <section className="space-section">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Development Pipeline</h2>
          <p className="text-lg opacity-90">
            Moving fast with Studio Sen methodology - weeks, not quarters
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {roadmapItems.map((quarter, quarterIndex) => (
            <div key={quarterIndex} className="relative mb-12">
              
              <div className="glass p-8">
                {/* Quarter Header */}
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xs mr-6 ${
                    quarter.status === 'completed' ? 'bg-green-500 text-white' :
                    quarter.status === 'in-progress' ? 'bg-orange-500 text-white' :
                    quarter.status === 'planned' ? 'bg-blue-500 text-white' :
                    quarter.status === 'backlog' ? 'bg-purple-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      quarter.status === 'completed' ? '' :
                      quarter.status === 'in-progress' ? '' :
                      quarter.status === 'planned' ? '' :
                      quarter.status === 'backlog' ? '' : ''
                    }`} style={{fontVariationSettings: "'wght' 100"}}>
                      {quarter.status === 'completed' ? 'check_circle' :
                       quarter.status === 'in-progress' ? 'bolt' :
                       quarter.status === 'planned' ? 'phone_android' :
                       quarter.status === 'backlog' ? 'forum' : 'rocket_launch'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{quarter.phase}</h3>
                    <p className={`text-sm font-medium ${
                      quarter.status === 'completed' ? 'text-green-400' :
                      quarter.status === 'in-progress' ? 'text-orange-400' :
                      quarter.status === 'planned' ? 'text-blue-400' :
                      quarter.status === 'backlog' ? 'text-purple-400' :
                      'text-gray-400'
                    }`}>
                      {quarter.status === 'completed' ? 'Shipped' :
                       quarter.status === 'in-progress' ? 'Active Development' :
                       quarter.status === 'planned' ? 'Next Sprint' :
                       quarter.status === 'backlog' ? 'Community Driven' :
                       'Vision'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quarter.items.map((item, itemIndex) => (
                    <div key={itemIndex} className={`bg-white/5 border rounded-2xl p-6 ${
                      item.completed ? 'border-green-500/30' : 'border-white/10'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-lg">{item.title}</h4>
                        {item.completed && (
                          <span className="material-symbols-outlined text-green-400">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-sm opacity-90 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="glass p-8">
        <div className="content-center space-large">
          <h2 className="text-3xl font-bold">Community-Driven Development</h2>
          <p className="text-lg opacity-90">Discuss ideas, upvote features, and help us prioritize what matters most</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block">
              forum
            </span>
            <h3 className="text-lg font-semibold mb-2">Feature Discussions</h3>
            <p className="text-sm opacity-90 mb-4">
              Join conversations about upcoming features and share your ideas
            </p>
            <Link href="/contact" className="btn btn-primary">
              Start Discussion
            </Link>
          </div>
          
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
              thumb_up
            </span>
            <h3 className="text-lg font-semibold mb-2">Upvote Ideas</h3>
            <p className="text-sm opacity-90 mb-4">
              Vote on community suggestions to help us prioritize development
            </p>
            <Link href="/contact" className="btn">
              Vote Now
            </Link>
          </div>
          
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-green-400 mb-4 block">
              bug_report
            </span>
            <h3 className="text-lg font-semibold mb-2">Bug Reports</h3>
            <p className="text-sm opacity-90 mb-4">
              Help us maintain quality by reporting issues you encounter
            </p>
            <Link href="/contact" className="btn">
              Report Bug
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="glass p-8 content-center">
        <div className="content-max-width">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Try What's Available Now?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Don't wait for future features - start creating CheatCards today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="btn btn-primary text-lg px-8 py-4">
              Try SenScript Free
            </Link>
            <Link href="/changelog" className="btn text-lg px-8 py-4">
              View Recent Updates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}