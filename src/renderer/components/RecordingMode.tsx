import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceRecorder } from './VoiceRecorder';
import { cardGenerator } from '../services/CardGenerator';
import { deckService } from '../services/DeckService';
import { openAIService } from '../services/OpenAIService';
import { Flashcard } from '../../shared/types';
import './RecordingMode.css';

interface RecordingModeProps {
  onCardGenerated?: (cards: Flashcard[]) => void;
  onClose?: () => void;
}

export const RecordingMode: React.FC<RecordingModeProps> = ({
  onCardGenerated,
  onClose
}) => {
  const [generatedCards, setGeneratedCards] = useState<Flashcard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [useAI, setUseAI] = useState(true);

  const handleTranscript = async (transcript: string) => {
    if (transcript.trim().length < 10) return;
    
    setLastTranscript(transcript);
    setIsGenerating(true);

    try {
      let newCards: Flashcard[] = [];
      
      if (useAI) {
        // Try OpenAI first
        try {
          newCards = await openAIService.generateFlashcardsFromTranscript(transcript);
        } catch (aiError) {
          console.warn('AI generation failed, falling back to local:', aiError);
          // Fallback to local generation
          newCards = cardGenerator.generateCardsFromText(transcript, {
            maxCards: 3,
            cardType: 'mixed'
          });
        }
      } else {
        // Use local generation
        newCards = cardGenerator.generateCardsFromText(transcript, {
          maxCards: 3,
          cardType: 'mixed'
        });
      }

      if (newCards.length > 0) {
        // Add to transcription deck
        deckService.addTranscriptionCards(newCards);
        setGeneratedCards(prev => [...prev, ...newCards]);
        onCardGenerated?.(newCards);
      }
    } catch (error) {
      console.error('Error generating cards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearCards = () => {
    setGeneratedCards([]);
    setLastTranscript('');
  };

  return (
    <div className="recording-mode">
      <div className="recording-header">
        <h2 className="recording-title">Voice Recording</h2>
        <div className="header-controls">
          <button
            className={`ai-toggle ${useAI ? 'active' : ''}`}
            onClick={() => setUseAI(!useAI)}
            title="Toggle AI-powered card generation"
          >
            <span className="ai-icon">🤖</span>
            <span className="ai-label">{useAI ? 'AI' : 'Local'}</span>
          </button>
          <button className="close-button button-minimal" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <VoiceRecorder
        onTranscript={handleTranscript}
        onError={(error) => console.error('Recording error:', error)}
      />

      <AnimatePresence>
        {isGenerating && (
          <motion.div
            className="generating-indicator glass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="generating-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="24"
                  strokeDashoffset="12"
                />
              </svg>
            </motion.div>
            <span>Generating cards...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {generatedCards.length > 0 && (
        <div className="generated-cards">
          <div className="cards-header">
            <h3 className="cards-title">Generated Cards ({generatedCards.length})</h3>
            <button className="clear-button button-minimal" onClick={clearCards}>
              Clear
            </button>
          </div>
          
          <div className="cards-list">
            {generatedCards.slice(-5).map((card, index) => (
              <motion.div
                key={card.id}
                className="card-preview glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="card-preview-front">
                  <div className="card-preview-text">{card.front}</div>
                </div>
                <div className="card-preview-back">
                  <div className="card-preview-text">{card.back}</div>
                </div>
                <div className="card-preview-tags">
                  {card.tags?.map(tag => (
                    <span key={tag} className="card-tag">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {generatedCards.length > 5 && (
            <div className="more-cards-indicator">
              +{generatedCards.length - 5} more cards
            </div>
          )}
        </div>
      )}
    </div>
  );
};