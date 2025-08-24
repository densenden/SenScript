'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

// Type definition for roadmap items
interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
  priority: number;
  votes: number;
  category?: string;
  estimated_completion?: string;
  created_at: string;
  updated_at: string;
}

// Organize roadmap items by status groups
const roadmapSections = [
  {
    title: "Recently Completed",
    status: "completed" as const,
    icon: "check_circle",
    color: "text-green-400",
    bgColor: "bg-green-500"
  },
  {
    title: "In Development",
    status: "in_progress" as const,
    icon: "construction",
    color: "text-orange-400",
    bgColor: "bg-orange-500"
  },
  {
    title: "Planned Features",
    status: "planned" as const,
    icon: "upcoming",
    color: "text-blue-400",
    bgColor: "bg-blue-500"
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
  const { user, isLoaded } = useUser();
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingItem, setVotingItem] = useState<string | null>(null);

  // Load roadmap items and user votes
  useEffect(() => {
    loadRoadmapData();
  }, [user]);

  const loadRoadmapData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/roadmap');
      if (!response.ok) {
        throw new Error('Failed to load roadmap data');
      }
      
      const { items, userVotes: votes } = await response.json();
      setRoadmapItems(items);
      setUserVotes(votes || []);
    } catch (error) {
      console.error('Failed to load roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (itemId: string) => {
    if (!user || userVotes.includes(itemId)) return;
    
    setVotingItem(itemId);
    try {
      const response = await fetch('/api/roadmap/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          action: 'add'
        }),
      });

      if (response.ok) {
        setUserVotes([...userVotes, itemId]);
        // Update the vote count in the local state
        setRoadmapItems(items => 
          items.map(item => 
            item.id === itemId 
              ? { ...item, votes: item.votes + 1 }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVotingItem(null);
    }
  };

  const getItemsByStatus = (status: string) => {
    return roadmapItems.filter(item => item.status === status);
  };
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
        
        {loading ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined animate-spin text-4xl text-orange-500 mb-4 block">
              refresh
            </span>
            <p className="text-lg opacity-90">Loading roadmap...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {roadmapSections.map((section, sectionIndex) => {
              const sectionItems = getItemsByStatus(section.status);
              if (sectionItems.length === 0) return null;
              
              return (
                <div key={sectionIndex} className="mb-12">
                  <div className="glass p-8">
                    {/* Section Header */}
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xs mr-6 ${section.bgColor} text-white`}>
                        <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'wght' 100"}}>
                          {section.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{section.title}</h3>
                        <p className={`text-sm font-medium ${section.color}`}>
                          {sectionItems.length} item{sectionItems.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sectionItems.map((item) => (
                        <div key={item.id} className={`bg-white/5 border rounded-2xl p-6 ${
                          item.status === 'completed' ? 'border-green-500/30' : 
                          item.status === 'in_progress' ? 'border-orange-500/30' :
                          'border-white/10'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                                item.category === 'feature' ? 'bg-blue-100 text-blue-800' :
                                item.category === 'improvement' ? 'bg-green-100 text-green-800' :
                                item.category === 'integration' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {item.category}
                              </span>
                            </div>
                            {item.status === 'completed' && (
                              <span className="material-symbols-outlined text-green-400 text-xl">
                                check_circle
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm opacity-90 leading-relaxed mb-4">
                            {item.description}
                          </p>
                          
                          {item.estimated_completion && (
                            <p className="text-xs opacity-70 mb-3">
                              <span className="material-symbols-outlined text-xs mr-1">schedule</span>
                              {item.estimated_completion}
                            </p>
                          )}
                          
                          {/* Voting Section */}
                          {item.status !== 'completed' && (
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm opacity-70">
                                  thumb_up
                                </span>
                                <span className="text-sm font-medium">{item.votes}</span>
                              </div>
                              
                              {isLoaded && user ? (
                                <button
                                  onClick={() => handleVote(item.id)}
                                  disabled={userVotes.includes(item.id) || votingItem === item.id}
                                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                    userVotes.includes(item.id) 
                                      ? 'bg-green-500/20 text-green-400 cursor-default' 
                                      : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 cursor-pointer'
                                  } disabled:opacity-50`}
                                >
                                  {votingItem === item.id ? (
                                    <span className="material-symbols-outlined animate-spin text-xs">
                                      refresh
                                    </span>
                                  ) : userVotes.includes(item.id) ? (
                                    <>Voted</>
                                  ) : (
                                    <>Vote</>
                                  )}
                                </button>
                              ) : (
                                <Link 
                                  href="/sign-in" 
                                  className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-all"
                                >
                                  Sign in to vote
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Empty state */}
            {roadmapItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl opacity-50 mb-4 block">
                  construction
                </span>
                <p className="text-lg opacity-90">Roadmap items are being loaded...</p>
                <p className="text-sm opacity-70 mt-2">Check back soon!</p>
              </div>
            )}
          </div>
        )}
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