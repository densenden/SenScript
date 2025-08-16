import React, { useState } from 'react';
import './CardStack.css';
import { FlashCard } from '../services/CardGenerationService';

interface CardStackProps {
  cards: FlashCard[];
  onClear: () => void;
  onRemoveCard: (cardId: string) => void;
}

export const CardStack: React.FC<CardStackProps> = ({ cards, onClear, onRemoveCard }) => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: FlashCard['category']) => {
    switch (category) {
      case 'fact':
        return 'category-fact';
      case 'definition':
        return 'category-definition';
      case 'concept':
        return 'category-concept';
      case 'process':
        return 'category-process';
      case 'example':
        return 'category-example';
      default:
        return 'category-concept';
    }
  };

  return (
    <div className="card-stack">
      <div className="card-stack-header">
        <h3 className="card-stack-title">Generated Cards</h3>
        <div className="card-stack-actions">
          <span className="card-count">{cards.length} cards</span>
          {cards.length > 0 && (
            <button onClick={onClear} className="clear-cards-btn">
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="cards-container">
        {cards.length === 0 ? (
          <div className="cards-placeholder">
            <div className="placeholder-icon">🃏</div>
            <p>Cards will appear here as AI analyzes your transcript</p>
            <p className="placeholder-hint">Start recording to generate flashcards</p>
          </div>
        ) : (
          <div className="cards-grid">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`flash-card ${flippedCards.has(card.id) ? 'flipped' : ''}`}
                onClick={() => toggleCard(card.id)}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <div className="card-header">
                      <span className={`category-badge ${getCategoryColor(card.category)}`}>
                        {card.category}
                      </span>
                      <button
                        className="remove-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveCard(card.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="card-content">
                      <p className="card-text">{card.front}</p>
                    </div>
                    <div className="card-hint">
                      <span>Click to reveal answer</span>
                    </div>
                  </div>

                  <div className="card-back">
                    <div className="card-header">
                      <span className={`category-badge ${getCategoryColor(card.category)}`}>
                        {card.category}
                      </span>
                      <div className="confidence-indicator">
                        {Math.round(card.confidence * 100)}%
                      </div>
                    </div>
                    <div className="card-content">
                      <p className="card-text">{card.back}</p>
                    </div>
                    <div className="card-tags">
                      {card.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};