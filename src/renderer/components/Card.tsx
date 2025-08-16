import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from '../../shared/types';
import './Card.css';

interface CardProps {
  card: Flashcard;
  onNext?: () => void;
  onPrevious?: () => void;
  onMarkCorrect?: () => void;
  onMarkIncorrect?: () => void;
}

export const Card: React.FC<CardProps> = ({
  card,
  onNext,
  onPrevious,
  onMarkCorrect,
  onMarkIncorrect
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleFlip = () => {
    if (!isAnswered) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMarkCorrect = () => {
    setIsAnswered(true);
    onMarkCorrect?.();
    setTimeout(() => {
      setIsFlipped(false);
      setIsAnswered(false);
      onNext?.();
    }, 400);
  };

  const handleMarkIncorrect = () => {
    setIsAnswered(true);
    onMarkIncorrect?.();
    setTimeout(() => {
      setIsFlipped(false);
      setIsAnswered(false);
      onNext?.();
    }, 400);
  };

  return (
    <div className="card-container">
      <motion.div
        className="card glass"
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="card-face card-front">
          <div className="card-content">
            <p className="card-text">{card.front}</p>
          </div>
          <div className="card-hint">Tap to reveal answer</div>
        </div>
        
        <div className="card-face card-back">
          <div className="card-content">
            <p className="card-text">{card.back}</p>
          </div>
          {isFlipped && !isAnswered && (
            <motion.div 
              className="card-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                className="card-action-button incorrect"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkIncorrect();
                }}
              >
                <span className="icon">✗</span>
              </button>
              <button
                className="card-action-button correct"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkCorrect();
                }}
              >
                <span className="icon">✓</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};