'use client';

import { useState } from 'react';

export type CheatCardCategory = 'INTERVIEW TIP' | 'KEY FACTS' | 'QUICK WIN' | 'WHAT TO SAY' | 'AVOID THIS';
export type InterviewType = 'technical' | 'behavioral' | 'industry';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface CheatCardProps {
  category: CheatCardCategory;
  front: string;
  back: string;
  flag?: string;
  interviewType?: InterviewType;
  difficulty?: Difficulty;
  tags?: string[];
  className?: string;
}

const categoryColors: Record<CheatCardCategory, string> = {
  'INTERVIEW TIP': 'border-blue-500 bg-blue-500/10',
  'KEY FACTS': 'border-green-500 bg-green-500/10',
  'QUICK WIN': 'border-yellow-500 bg-yellow-500/10',
  'WHAT TO SAY': 'border-purple-500 bg-purple-500/10',
  'AVOID THIS': 'border-red-500 bg-red-500/10'
};

const categoryIcons: Record<CheatCardCategory, string> = {
  'INTERVIEW TIP': 'lightbulb',
  'KEY FACTS': 'fact_check',
  'QUICK WIN': 'bolt',
  'WHAT TO SAY': 'chat',
  'AVOID THIS': 'warning'
};

export default function CheatCard({
  category,
  front,
  back,
  flag,
  interviewType,
  difficulty,
  tags,
  className = ''
}: CheatCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`relative w-full h-64 cursor-pointer perspective-1000 ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`
        absolute inset-0 w-full h-full transition-transform duration-700 transform-style-3d
        ${isFlipped ? 'rotate-y-180' : ''}
      `}>
        {/* Front of card */}
        <div className={`
          absolute inset-0 w-full h-full backface-hidden
          glass border-2 ${categoryColors[category]} rounded-2xl p-6
          flex flex-col justify-between
        `}>
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`
                  material-symbols-outlined icon-md
                  ${category === 'AVOID THIS' ? 'text-red-500' : 'text-orange-500'}
                `}>
                  {categoryIcons[category]}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  {category}
                </span>
              </div>
              {flag && (
                <span className="text-lg" role="img" aria-label={flag}>
                  {flag}
                </span>
              )}
            </div>
            <h3 className="text-lg font-medium leading-tight">
              {front}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            {interviewType && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 capitalize">
                {interviewType}
              </span>
            )}
            <span className="material-symbols-outlined icon-sm opacity-50">
              flip_to_back
            </span>
          </div>
        </div>

        {/* Back of card */}
        <div className={`
          absolute inset-0 w-full h-full backface-hidden rotate-y-180
          glass border-2 ${categoryColors[category]} rounded-2xl p-6
          flex flex-col justify-between
        `}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined icon-md text-orange-500">
                {categoryIcons[category]}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Answer
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              {back}
            </p>
          </div>
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add required CSS for 3D transforms
export const cheatCardStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`;