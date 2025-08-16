import React, { useState } from 'react';
import './Cards.css';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  nextReview?: Date;
}

export const Cards: React.FC = () => {
  const [cards] = useState<FlashCard[]>([
    {
      id: '1',
      front: 'What is artificial intelligence?',
      back: 'AI is the simulation of human intelligence processes by machines, especially computer systems.',
      difficulty: 'medium'
    },
    {
      id: '2', 
      front: 'How does machine learning work?',
      back: 'Machine learning uses algorithms and statistical models to enable computers to learn and improve from experience without being explicitly programmed.',
      difficulty: 'hard'
    },
    {
      id: '3',
      front: 'What is deep learning?',
      back: 'Deep learning is a subset of machine learning that uses artificial neural networks with multiple layers to model and understand complex patterns.',
      difficulty: 'easy'
    }
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentCardIndex];

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setIsFlipped(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="cards-container">
      <div className="cards-header">
        <h2 className="text-xl font-bold">Flashcard Stack</h2>
        <div className="card-counter">
          {currentCardIndex + 1} of {cards.length}
        </div>
      </div>

      <div className="card-stack">
        {/* Background cards for stack effect */}
        <div className="background-card card-3"></div>
        <div className="background-card card-2"></div>
        
        {/* Main active card */}
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={flipCard}>
          <div className="card-inner">
            <div className="card-front glass-strong">
              <div className="card-header">
                <span className="card-type">Question</span>
                <span className={`difficulty-badge difficulty-${currentCard?.difficulty}`}>
                  {currentCard?.difficulty}
                </span>
              </div>
              <div className="card-content">
                <p>{currentCard?.front}</p>
              </div>
              <div className="card-hint">
                <span className="text-tertiary">Click to reveal answer</span>
              </div>
            </div>
            
            <div className="card-back glass-strong">
              <div className="card-header">
                <span className="card-type">Answer</span>
                <span className={`difficulty-badge difficulty-${currentCard?.difficulty}`}>
                  {currentCard?.difficulty}
                </span>
              </div>
              <div className="card-content">
                <p>{currentCard?.back}</p>
              </div>
              <div className="card-hint">
                <span className="text-tertiary">Click to flip back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-controls">
        <button className="btn btn-secondary" onClick={prevCard}>
          Previous
        </button>
        <button className="btn btn-primary" onClick={flipCard}>
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        <button className="btn btn-secondary" onClick={nextCard}>
          Next
        </button>
      </div>

      <div className="study-stats glass">
        <div className="stat-item">
          <span className="stat-label">Total Cards</span>
          <span className="stat-value">{cards.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Reviewed</span>
          <span className="stat-value">0</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Remaining</span>
          <span className="stat-value">{cards.length}</span>
        </div>
      </div>
    </div>
  );
};