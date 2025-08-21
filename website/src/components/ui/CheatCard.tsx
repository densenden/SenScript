'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheatCard as CheatCardType } from '@/lib/cheatcard-api';
import { CHEATCARD_CATEGORIES } from '@/lib/constants';

interface CheatCardProps {
  card: CheatCardType;
  autoFlip?: boolean;
  delay?: number;
  className?: string;
  showAnimation?: boolean;
}

export function CheatCard({ 
  card, 
  autoFlip = false, 
  delay = 0, 
  className = '',
  showAnimation = true
}: CheatCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAutoFlipped, setHasAutoFlipped] = useState(false);

  const categoryInfo = CHEATCARD_CATEGORIES[card.category];
  
  // Auto-flip effect
  if (autoFlip && !hasAutoFlipped) {
    setTimeout(() => {
      setIsFlipped(true);
      setHasAutoFlipped(true);
    }, delay + 1500);
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay / 1000,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={showAnimation ? cardVariants : undefined}
      initial={showAnimation ? "hidden" : undefined}
      animate={showAnimation ? "visible" : undefined}
      className={`relative w-full max-w-md mx-auto ${className}`}
    >
      <div 
        className="group cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-64 preserve-3d transition-transform duration-700"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${categoryInfo.color}`}>
                  <span className="mr-1">{categoryInfo.icon}</span>
                  {categoryInfo.name}
                </span>
                {card.flag && (
                  <span className="text-2xl">{card.flag}</span>
                )}
              </div>

              {/* Front Content */}
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg font-medium text-gray-900 dark:text-white text-center leading-relaxed">
                  {card.front}
                </p>
              </div>

              {/* Flip Indicator */}
              <div className="text-center text-gray-400 text-sm mt-4">
                Click to reveal answer →
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${categoryInfo.color}`}>
                  <span className="mr-1">{categoryInfo.icon}</span>
                  Answer
                </span>
                {card.confidence && (
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">
                      {Math.round(card.confidence * 100)}%
                    </span>
                    <div className="w-12 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${card.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Back Content */}
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {card.back}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  {card.timestamp && (
                    <span>{card.timestamp}</span>
                  )}
                  {card.interviewType && (
                    <span className="capitalize">{card.interviewType}</span>
                  )}
                  <span className="cursor-pointer hover:text-gray-700">
                    Click to flip back
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CheatCard;