'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Crown, Gift } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PRICING_TIERS, CheatCardCategory, CHEATCARD_CATEGORIES } from '@/lib/constants';

const tiers = [
  {
    ...PRICING_TIERS.FREE,
    icon: Gift,
    gradient: 'from-gray-400 to-gray-600',
    popular: false
  },
  {
    ...PRICING_TIERS.ESSENTIAL,
    icon: Zap,
    gradient: 'from-orange-500 to-red-500',
    popular: true
  },
  {
    ...PRICING_TIERS.PREMIUM,
    icon: Crown,
    gradient: 'from-purple-500 to-indigo-600',
    popular: false
  }
];

const cheatCardFeatures = [
  {
    name: 'Interview Tip Cards',
    description: 'Strategic advice for handling specific interview questions',
    free: true,
    essential: true,
    premium: true
  },
  {
    name: 'Quick Win Cards',
    description: 'Simple tactics that impress interviewers instantly',
    free: false,
    essential: true,
    premium: true
  },
  {
    name: 'Key Facts Cards',
    description: 'Important data points to mention during interviews',
    free: false,
    essential: true,
    premium: true
  },
  {
    name: 'What to Say Cards',
    description: 'Recommended phrases and talking points',
    free: false,
    essential: true,
    premium: true
  },
  {
    name: 'Avoid This Cards',
    description: 'Common mistakes and what not to say',
    free: false,
    essential: true,
    premium: true
  },
  {
    name: 'Industry-Specific Templates',
    description: 'Customized CheatCards for your industry',
    free: false,
    essential: false,
    premium: true
  },
  {
    name: 'Advanced Export Formats',
    description: 'Anki, Quizlet, Notion, and custom formats',
    free: false,
    essential: false,
    premium: true
  },
  {
    name: 'Priority AI Processing',
    description: 'Faster card generation during peak times',
    free: false,
    essential: true,
    premium: true
  }
];

export default function PricingPage() {
  const handleSubscribe = (tierName: string) => {
    // This will integrate with Stripe checkout
    console.log(`Subscribe to ${tierName}`);
    
    // For demo purposes, just show alert
    alert(`Starting ${tierName} subscription flow... (Stripe integration will be added here)`);
  };

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1 
              className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Choose Your CheatCard Plan
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              From basic interview prep to advanced strategic advantages - 
              find the perfect plan for your goals.
            </motion.p>
            
            {/* Usage Note */}
            <motion.div 
              className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Zap className="w-4 h-4" />
              <span>All plans include real-time card generation in 13 languages</span>
            </motion.div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {tiers.map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 ${
                    tier.popular 
                      ? 'border-orange-400 dark:border-orange-600 transform scale-105' 
                      : 'border-gray-200 dark:border-gray-700'
                  } p-8 text-center`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${tier.gradient} mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {tier.currency}{tier.price}
                      </span>
                      {tier.interval && (
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          /{tier.interval}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mt-2">
                      {tier.minutes} minutes included
                      {tier.overage && (
                        <div className="text-sm">
                          {tier.currency}{tier.overage}/min overage
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8 text-left">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limitations for Free tier */}
                  {tier.limitations && (
                    <ul className="space-y-2 mb-8 text-left">
                      {tier.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start space-x-3 text-gray-500 dark:text-gray-400">
                          <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-center">•</div>
                          <span className="text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(tier.name)}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                      tier.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        : tier.name === 'Free'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tier.name === 'Free' ? 'Get Started Free' : `Choose ${tier.name}`}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Add-on: Reload 15 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 mb-16"
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Need Extra Minutes?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Get instant top-ups for those important conversations
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  €1.00
                </div>
                <div className="text-gray-600 dark:text-gray-300 mb-4">
                  +15 minutes
                </div>
                <button
                  onClick={() => handleSubscribe('Reload 15')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Buy Reload
                </button>
              </div>
            </div>
          </motion.div>

          {/* CheatCard Feature Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              CheatCard Features Comparison
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 pr-6">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Feature</span>
                    </th>
                    <th className="text-center py-4 px-4">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Free</span>
                    </th>
                    <th className="text-center py-4 px-4 bg-orange-50 dark:bg-orange-900/20 rounded-t-xl">
                      <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">Essential</span>
                    </th>
                    <th className="text-center py-4 pl-4">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Premium</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cheatCardFeatures.map((feature, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-4 pr-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {feature.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {feature.description}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        {feature.free ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <div className="w-5 h-5 mx-auto"></div>
                        )}
                      </td>
                      <td className="text-center py-4 px-4 bg-orange-50 dark:bg-orange-900/20">
                        {feature.essential ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <div className="w-5 h-5 mx-auto"></div>
                        )}
                      </td>
                      <td className="text-center py-4 pl-4">
                        {feature.premium ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <div className="w-5 h-5 mx-auto"></div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  q: "What counts as 'minutes'?",
                  a: "Each minute of audio processing counts toward your limit. This includes live conversations, uploaded files, or any audio input."
                },
                {
                  q: "Can I upgrade or downgrade anytime?",
                  a: "Yes! You can change your plan at any time. Changes take effect on your next billing cycle."
                },
                {
                  q: "What's the difference between Standard and CheatCard mode?",
                  a: "Standard mode creates educational flashcards. CheatCard mode creates strategic interview preparation cards with tactical advice."
                },
                {
                  q: "Do you offer refunds?",
                  a: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked."
                }
              ].map((faq, index) => (
                <div key={index} className="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}