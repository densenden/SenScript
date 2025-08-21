'use client';

import { motion } from 'framer-motion';
import { Target, Zap, Shield, Globe, Users, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CheatCard } from '@/components/ui/CheatCard';
import { CheatCard as CheatCardType } from '@/lib/cheatcard-api';

const realExamples: CheatCardType[] = [
  {
    id: 'example_startup',
    category: 'INTERVIEW TIP',
    front: 'How to respond to questions about customer acquisition cost and scaling plans when seeking startup funding?',
    back: 'Provide concrete data on acquisition costs, growth plans, competitive advantages, financial sustainability, and profitability projections. Demonstrating clear metrics and viable path to profitability instills investor confidence.',
    flag: '🇺🇸',
    language: 'en-US',
    confidence: 0.92,
    source: 'Real user session'
  },
  {
    id: 'example_nordic',
    category: 'CONCEPT',
    front: 'What is Janteloven and how does it influence Nordic business communication?',
    back: 'Janteloven emphasizes humility and collectivism over individual achievements. In business settings, this influences Norwegian communication by discouraging boasting and favoring understatement and group harmony.',
    flag: '🇳🇴',
    language: 'en-US',
    confidence: 0.90,
    source: 'Cultural training session'
  },
  {
    id: 'example_tech',
    category: 'KEY FACTS',
    front: 'What notable fact about Finnish education system should you mention in education interviews?',
    back: 'Finnish students start reading at 7 but excel in PISA tests due to emphasis on play, creativity, and critical thinking over standardized testing in early education.',
    flag: '🇫🇮',
    language: 'en-US',
    confidence: 0.88,
    source: 'Academic conference'
  }
];

const useCaseStories = [
  {
    title: 'Sarah\'s Tech Interview Success',
    role: 'Software Engineer',
    challenge: 'Preparing for senior developer interviews at FAANG companies',
    solution: 'Used SenScript during mock interviews and technical discussions',
    result: 'Generated 127 CheatCards covering system design, behavioral questions, and coding concepts. Landed job at Google.',
    icon: '💻',
    metric: '127 CheatCards',
    outcome: 'Google Offer'
  },
  {
    title: 'Marcus\'s Academic Excellence',
    role: 'PhD Candidate',
    challenge: 'Processing complex research papers and conference presentations',
    solution: 'Recorded lectures and research meetings with SenScript',
    result: 'Created comprehensive study materials that helped him pass qualifying exams with distinction.',
    icon: '🎓',
    metric: '300+ Cards',
    outcome: 'PhD Advancement'
  },
  {
    title: 'Lisa\'s Language Mastery',
    role: 'International Business',
    challenge: 'Learning Nordic business culture for expansion role',
    solution: 'Used SenScript during cultural training sessions',
    result: 'Mastered cultural nuances and communication styles, successfully leading Nordic market entry.',
    icon: '🌍',
    metric: '13 Languages',
    outcome: 'Market Entry Success'
  }
];

const principles = [
  {
    icon: Target,
    title: 'Speed-First Philosophy',
    description: 'Every millisecond matters. We optimize for maximum card creation speed over perfect accuracy because in real conversations, timing is everything.'
  },
  {
    icon: Zap,
    title: 'Real-Time Intelligence',
    description: 'Traditional flashcards are reactive. CheatCards are proactive - they appear while opportunities are still happening.'
  },
  {
    icon: Shield,
    title: 'Strategic Advantage',
    description: 'We don\'t just capture information - we transform it into tactical intelligence that gives you an unfair advantage.'
  },
  {
    icon: Globe,
    title: 'Universal Compatibility',
    description: 'One tool for every platform. No integrations needed. Works with Zoom, Teams, phone calls, lectures, and any audio source.'
  }
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1 
                className="text-4xl lg:text-6xl font-bold text-white mb-6 text-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                We Pioneered{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                  CheatCard
                </span>{' '}
                Technology
              </motion.h1>
              <motion.p 
                className="text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-8 text-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                SenScript transforms any conversation into strategic ammunition and study materials 
                at maximum speed - because opportunities don&apos;t wait.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-white/80 text-shadow"
              >
                Mission: <strong>Maximum card creation speed over perfect accuracy</strong>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 text-shadow">
                Why CheatCards Change Everything
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto text-shadow">
                Traditional flashcards aren&apos;t enough for modern challenges. 
                CheatCards provide tactical advantages in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {principles.map((principle, index) => {
                const IconComponent = principle.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center p-6 app-container"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {principle.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Real Examples */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 text-shadow">
                Real CheatCards from Real Users
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto text-shadow">
                These cards were generated during actual conversations, showing how SenScript 
                transforms everyday interactions into strategic advantages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {realExamples.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheatCard card={card} showAnimation={true} delay={index * 200} />
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { stat: '< 3s', label: 'Average generation time' },
                { stat: '92%', label: 'User success rate in interviews' },
                { stat: '13', label: 'Languages supported' },
                { stat: '5', label: 'CheatCard categories' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 app-container"
                >
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {item.stat}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 text-shadow">
                Success Stories
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto text-shadow">
                Real professionals who transformed their careers using SenScript CheatCards
              </p>
            </div>

            <div className="space-y-16">
              {useCaseStories.map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  viewport={{ once: true }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                  }`}
                >
                  {/* Story Content */}
                  <div className={`app-container p-8 space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{story.icon}</div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {story.title}
                        </h3>
                        <p className="text-orange-600 dark:text-orange-400 font-medium">
                          {story.role}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Challenge:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {story.challenge}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Solution:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {story.solution}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Result:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {story.result}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {story.metric}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Generated
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {story.outcome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Achieved
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Element */}
                  <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                    <div className="relative">
                      {/* 4:3 Image Frame */}
                      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                        <img
                          src={`/images/${
                            story.title.includes('Sarah') ? 'sarah.png' :
                            story.title.includes('Marcus') ? 'marcus.png' :
                            'lisa.png'
                          }`}
                          alt={`${story.title.split("'s")[0]} - ${story.role}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay with metrics */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <div className="text-2xl font-bold mb-1">
                            {story.metric}
                          </div>
                          <div className="text-lg font-medium opacity-90">
                            {story.outcome}
                          </div>
                        </div>
                      </div>
                      
                      {/* Floating Icon Badge */}
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                        {story.icon}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Innovation */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 text-shadow">
                Revolutionary Technical Approach
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto text-shadow">
                SenScript&apos;s universal audio capture strategy eliminates the need for 
                platform-specific integrations
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="app-container p-8 space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Universal Compatibility
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Instead of building integrations for each platform, SenScript captures audio 
                  at the system level. This revolutionary approach means it works with 
                  <strong> any application automatically</strong>.
                </p>

                <div className="space-y-4">
                  {[
                    'Teams, Zoom, Slack, Discord meetings',
                    'Phone calls and voice messages',
                    'University lectures and presentations',
                    'Podcasts and training videos',
                    'Any audio source on your device'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="app-container p-8">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                  Technical Architecture
                </h4>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Universal Audio Capture', desc: 'System-level audio routing' },
                    { step: '2', title: 'Real-time Speech Recognition', desc: '13 language support' },
                    { step: '3', title: 'AI Processing Pipeline', desc: 'Multi-provider LLM integration' },
                    { step: '4', title: 'CheatCard Generation', desc: 'Sub-3-second tactical cards' },
                    { step: '5', title: 'Strategic Export', desc: 'Anki, CSV, JSON formats' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6 text-shadow">
              Ready to Transform Your Conversations?
            </h2>
            <p className="text-xl text-white/90 mb-8 text-shadow">
              Join thousands of professionals who never miss an opportunity because 
              they&apos;re always prepared with SenScript CheatCards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start Your Free Trial
              </button>
              <button className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300">
                Try the Demo
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}