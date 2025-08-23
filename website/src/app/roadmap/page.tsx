'use client';

import Link from 'next/link';

const roadmapItems = [
  {
    quarter: "Q1 2025",
    status: "completed",
    items: [
      {
        title: "SenScript v3.0 Launch",
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
    quarter: "Q2 2025",
    status: "in-progress",
    items: [
      {
        title: "Mobile Optimization",
        description: "Enhanced mobile experience with phone microphone capture",
        completed: false
      },
      {
        title: "Team Collaboration",
        description: "Shared card libraries for organizations",
        completed: false
      },
      {
        title: "Advanced Export Options",
        description: "Direct integration with Notion, Slack, and Jira",
        completed: false
      }
    ]
  },
  {
    quarter: "Q3 2025",
    status: "planned",
    items: [
      {
        title: "AI Provider Expansion",
        description: "Support for Gemini, Llama, and custom endpoints",
        completed: false
      },
      {
        title: "Smart Clustering",
        description: "Automatically group related cards into threads",
        completed: false
      },
      {
        title: "Desktop System Audio",
        description: "Native desktop app with system-level audio capture",
        completed: false
      }
    ]
  },
  {
    quarter: "Q4 2025",
    status: "planned",
    items: [
      {
        title: "Enterprise Features",
        description: "SSO, admin controls, and compliance tools",
        completed: false
      },
      {
        title: "Advanced Analytics",
        description: "Learning insights and performance tracking",
        completed: false
      },
      {
        title: "API Access",
        description: "Public API for custom integrations",
        completed: false
      }
    ]
  },
  {
    quarter: "2026 & Beyond",
    status: "future",
    items: [
      {
        title: "AI-Powered Study Plans",
        description: "Personalized learning paths based on your cards",
        completed: false
      },
      {
        title: "Virtual Reality Integration",
        description: "Practice presentations in VR with CheatCard assistance",
        completed: false
      },
      {
        title: "Global Knowledge Network",
        description: "Anonymous insight sharing across industries",
        completed: false
      }
    ]
  }
];

const features = [
  {
    icon: "rocket_launch",
    title: "Speed First",
    description: "Every feature prioritizes maximum card generation speed"
  },
  {
    icon: "psychology",
    title: "AI-Driven",
    description: "Continuous AI improvements for better strategic content"
  },
  {
    icon: "security",
    title: "Privacy First",
    description: "Your conversations and cards remain private and secure"
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
            See what's coming next in CheatCard technology. Your feedback shapes our development priorities.
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
          <h2 className="text-3xl font-bold">Development Timeline</h2>
          <p className="text-lg opacity-90">Building the future of strategic learning</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {roadmapItems.map((quarter, quarterIndex) => (
            <div key={quarterIndex} className="relative mb-12">
              {/* Timeline line */}
              {quarterIndex < roadmapItems.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-orange-500/50 to-transparent"></div>
              )}
              
              <div className="glass p-8">
                {/* Quarter Header */}
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm mr-6 ${
                    quarter.status === 'completed' ? 'bg-green-500 text-white' :
                    quarter.status === 'in-progress' ? 'bg-orange-500 text-white' :
                    quarter.status === 'planned' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {quarter.quarter.split(' ')[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{quarter.quarter}</h3>
                    <p className={`text-sm font-medium ${
                      quarter.status === 'completed' ? 'text-green-400' :
                      quarter.status === 'in-progress' ? 'text-orange-400' :
                      quarter.status === 'planned' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {quarter.status === 'completed' ? 'Completed' :
                       quarter.status === 'in-progress' ? 'In Progress' :
                       quarter.status === 'planned' ? 'Planned' :
                       'Future Vision'}
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
          <h2 className="text-3xl font-bold">Shape Our Roadmap</h2>
          <p className="text-lg opacity-90">Your input drives our development priorities</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-orange-500 mb-4 block">
              feedback
            </span>
            <h3 className="text-lg font-semibold mb-2">Feature Requests</h3>
            <p className="text-sm opacity-90 mb-4">
              Tell us what CheatCard features would make the biggest impact for you
            </p>
            <Link href="/contact" className="btn btn-primary">
              Submit Request
            </Link>
          </div>
          
          <div className="glass p-6 text-center">
            <span className="material-symbols-outlined icon-xl text-blue-400 mb-4 block">
              bug_report
            </span>
            <h3 className="text-lg font-semibold mb-2">Bug Reports</h3>
            <p className="text-sm opacity-90 mb-4">
              Help us improve SenScript by reporting issues you encounter
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