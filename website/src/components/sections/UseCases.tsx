'use client';

import { motion } from 'framer-motion';
import { CheatCard } from '@/components/ui/CheatCard';
import { CheatCard as CheatCardType } from '@/lib/cheatcard-api';

const useCases = [
  {
    title: 'Job Interview Preparation',
    description: 'Turn any practice interview or industry conversation into tactical response cards',
    icon: 'work',
    examples: [
      {
        id: 'interview_1',
        category: 'INTERVIEW TIP' as const,
        front: 'How to respond to "What are your weaknesses?" in Dutch interviews?',
        back: 'In Dutch interviews, directness is valued. Avoid clichés like "I\'m a perfectionist." Instead, provide a genuine weakness and explain how you are addressing it. Dutch interviewers appreciate honesty but also value self-promotion.',
        flag: 'NL',
        language: 'en-US' as const,
        confidence: 0.92
      }
    ],
    benefits: [
      'Strategic response templates',
      'Industry-specific talking points',
      'What to say vs what NOT to say',
      'Real interview scenarios'
    ]
  },
  {
    title: 'Academic Exam Preparation',
    description: 'Transform lectures and study sessions into strategic review cards',
    icon: 'school',
    examples: [
      {
        id: 'academic_1',
        category: 'CONCEPT' as const,
        front: 'What is quantum superposition and its significance in quantum mechanics?',
        back: 'Quantum superposition allows particles to exist in multiple states simultaneously until measured. This principle, along with the Heisenberg uncertainty principle, forms the foundation of quantum mechanics.',
        flag: 'US',
        language: 'en-US' as const,
        confidence: 0.95
      }
    ],
    benefits: [
      'Key concepts extraction',
      'Definition cards for complex topics',
      'Study-optimized formatting',
      'Multi-language support'
    ]
  },
  {
    title: 'Professional Development',
    description: 'Capture insights from meetings, conferences, and networking events',
    icon: 'trending_up',
    examples: [
      {
        id: 'professional_1',
        category: 'QUICK WIN' as const,
        front: 'How to demonstrate attention to detail in Swedish language situations?',
        back: 'Practice \'förr\' (before) vs \'får\' (sheep) - \'ö\' is like \'e\' in \'her\' but with rounded lips. This shows linguistic precision and cultural awareness.',
        flag: 'SE',
        language: 'en-US' as const,
        confidence: 0.88
      }
    ],
    benefits: [
      'Meeting key insights',
      'Networking follow-ups',
      'Skill demonstration tactics',
      'Cultural intelligence'
    ]
  }
];

export function UseCases() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            CheatCards for Every Situation
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Real examples from actual users who transformed their conversations into competitive advantages
          </motion.p>
        </div>

        {/* Use Cases */}
        <div className="space-y-20">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Content Side */}
              <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="material-icons text-4xl text-orange-500">{useCase.icon}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {useCase.title}
                  </h3>
                </div>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  {useCase.description}
                </p>

                {/* Benefits */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    What You Get:
                  </h4>
                  <ul className="space-y-2">
                    {useCase.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200">
                  Try This Scenario
                </button>
              </div>

              {/* Card Example Side */}
              <div className={`flex justify-center ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <div className="w-full max-w-md">
                  <CheatCard 
                    card={useCase.examples[0]}
                    showAnimation={true}
                    delay={index * 300}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistics Section */}
        <motion.div 
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            { stat: '< 3s', label: 'Average card generation time' },
            { stat: '13', label: 'Languages supported' },
            { stat: '5', label: 'CheatCard categories' }
          ].map((item, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {item.stat}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to turn your next conversation into an advantage?
          </h3>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Start Creating CheatCards Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default UseCases;