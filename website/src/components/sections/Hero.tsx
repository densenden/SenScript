'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, Mic, Zap } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-200 dark:bg-orange-900/20 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-medium mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>Real-Time AI Flashcard Generation</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight text-shadow"
            >
              Turn Any{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                Conversation
              </span>{' '}
              Into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Study Materials
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed text-shadow"
            >
              AI-powered flashcard generation from live conversations. 
              Turn meetings, lectures, and interviews into study materials in real-time - 
              including specialized <strong>CheatCard mode</strong> for strategic advantages.
            </motion.p>

            {/* Key Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-6 mb-10 justify-center lg:justify-start"
            >
              {[
                { icon: '⚡', text: 'Sub-3s Generation' },
                { icon: '🎯', text: 'Interview-Ready Cards' },
                { icon: '🌍', text: '13 Languages' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-white/80">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-medium text-shadow">{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/demo"
                className="group bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <Mic className="w-5 h-5" />
                <span>Try Live Demo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center lg:text-left">
                Works universally with:
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-gray-400 dark:text-gray-500">
                {['Zoom', 'Teams', 'Slack', 'Phone Calls', 'Lectures', 'Any Audio'].map((platform, index) => (
                  <span key={index} className="font-medium">
                    {platform}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Side - App Preview */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Main App Interface Mockup */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transform rotate-2">
                {/* App Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">SenScript</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Recording</span>
                  </div>
                </div>

                {/* Audio Visualization */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center space-x-1 h-12">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="bg-orange-500 w-1.5 rounded-full"
                        animate={{
                          height: [8, 32, 16, 40, 12]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    "Can you explain the difference between REST and GraphQL..."
                  </p>
                </div>

                {/* Generated Cards Preview */}
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm">💡</span>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">INTERVIEW TIP</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      How to differentiate between REST and GraphQL...
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm">⚡</span>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">QUICK WIN</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mention practical experience with both...
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-medium"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Real-time
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium"
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                AI-Powered
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;