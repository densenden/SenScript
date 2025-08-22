'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheatCard } from '@/components/ui/CheatCard';
import { CheatCard as CheatCardType } from '@/lib/cheatcard-api';
import { DEMO_SCENARIOS } from '@/lib/constants';

const exampleCards: CheatCardType[] = [
  {
    id: 'example_1',
    category: 'INTERVIEW TIP',
    front: 'How to respond to questions about customer acquisition cost and scaling plans?',
    back: 'Provide concrete data on acquisition costs, growth plans, competitive advantages, and profitability projections. Demonstrating clear metrics and viable path to profitability instills investor confidence.',
    flag: 'US',
    language: 'en-US',
    confidence: 0.92
  },
  {
    id: 'example_2',
    category: 'QUICK WIN',
    front: 'How to improve pronunciation of the \'ö\' sound in Swedish interviews?',
    back: 'Practice \'förr\' (before) vs \'får\' (sheep) - \'ö\' is like \'e\' in \'her\' but with rounded lips. This demonstrates attention to detail and language precision.',
    flag: 'SE',
    language: 'en-US',
    confidence: 0.88
  },
  {
    id: 'example_3',
    category: 'KEY FACTS',
    front: 'What\'s notable about the Finnish education system for education interviews?',
    back: 'Finnish students start reading at 7 but excel in PISA tests due to emphasis on play, creativity, and critical thinking over standardized testing in early education.',
    flag: 'FI',
    language: 'en-US',
    confidence: 0.85
  },
  {
    id: 'example_4',
    category: 'CONCEPT',
    front: 'What is Janteloven and how does it influence Nordic business communication?',
    back: 'Janteloven emphasizes humility and collectivism over individual achievements. In business, this influences communication by discouraging boasting and favoring understatement and group harmony.',
    flag: 'NO',
    language: 'en-US',
    confidence: 0.90
  }
];

export function CheatCardShowcase() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const currentCard = exampleCards[currentCardIndex];
  const transcriptTexts = [
    "Alright, so you're asking for 2 million dollars. What's your customer acquisition cost? How do you plan to scale this?",
    "Hej! Many of you have problems with the 'ö' sound. It's like 'e' in 'her' but with rounded lips. Try 'förr' vs 'får'.",
    "Suomalainen koulutusjärjestelmä - students start reading at 7 but achieve high PISA results through play and creativity.",
    "Janteloven er et sett med sosiale normer som understreker ydmykhet og kollektivisme over individuell prestasjoner."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Reset animation states
      setShowCard(false);
      setShowProcessing(false);
      setShowTranscript(false);
      
      setTimeout(() => {
        // Show transcript
        setShowTranscript(true);
        
        setTimeout(() => {
          // Show processing
          setShowProcessing(true);
          
          setTimeout(() => {
            // Hide processing and show card
            setShowProcessing(false);
            setShowCard(true);
            
            // Move to next card after showing this one
            setTimeout(() => {
              setCurrentCardIndex((prev) => (prev + 1) % exampleCards.length);
            }, 3000);
          }, 2000);
        }, 2000);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            CheatCards in Action
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Watch how any conversation instantly transforms into strategic interview preparation cards
          </motion.p>
        </div>

        {/* Live Demo Animation */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Audio Processing Simulation */}
            <div className="space-y-8">
              {/* Audio Wave Visualization */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Live Recording</span>
                </div>
                
                {/* Audio Bars */}
                <div className="flex items-center justify-center space-x-1 h-20 mb-6">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-orange-500 w-2 rounded-full"
                      animate={{
                        height: [
                          Math.random() * 60 + 10,
                          Math.random() * 60 + 10,
                          Math.random() * 60 + 10
                        ]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>

                {/* Transcript Display */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[120px]">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Live Transcript:</div>
                  <AnimatePresence mode="wait">
                    {showTranscript && (
                      <motion.p
                        key={currentCardIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-gray-800 dark:text-gray-200"
                      >
                        {transcriptTexts[currentCardIndex]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* AI Processing Indicator */}
              <AnimatePresence>
                {showProcessing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                        AI generating CheatCard...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side - Generated CheatCard */}
            <div className="flex items-center justify-center">
              <AnimatePresence mode="wait">
                {showCard && (
                  <motion.div
                    key={currentCardIndex}
                    initial={{ opacity: 0, x: 100, rotateY: -90 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: -100, rotateY: 90 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <CheatCard 
                      card={currentCard} 
                      autoFlip={true} 
                      delay={500}
                      showAnimation={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: 'speed',
              title: 'Sub-3 Second Generation',
              description: 'Cards appear while you\'re still listening to the conversation'
            },
            {
              icon: 'psychology',
              title: 'Strategic Focus',
              description: 'Not just facts - tactical interview responses and key insights'
            },
            {
              icon: 'public',
              title: 'Universal Compatibility',
              description: 'Works with any audio source: meetings, lectures, phone calls'
            }
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="text-center p-6"
            >
              <div className="mb-4">
                <span className="material-icons text-4xl text-orange-500">{benefit.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
            Try CheatCard Mode Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default CheatCardShowcase;