import React, { useEffect, useRef, useState } from 'react';
import './TranscriptDisplay.css';
import { TranscriptChunk } from '../services/TranscriptionService';

interface TranscriptDisplayProps {
  chunks: TranscriptChunk[];
  onClear: () => void;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ chunks, onClear }) => {
  const [currentLine, setCurrentLine] = useState('');
  const [previousLine, setPreviousLine] = useState('');
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Get final text and interim text
    const finalText = chunks
      .filter(chunk => chunk.isFinal)
      .map(chunk => chunk.text)
      .join(' ')
      .trim();

    const latestInterimText = chunks
      .filter(chunk => !chunk.isFinal)
      .slice(-1)[0]?.text || '';

    // Combine final and interim for current display
    const fullText = finalText + (latestInterimText ? ' ' + latestInterimText : '');

    if (fullText !== currentLine) {
      // Split text into words for 2-line display
      const words = fullText.split(' ');
      const maxWordsPerLine = 8; // Adjust based on font size and container width
      
      if (words.length <= maxWordsPerLine) {
        // Single line
        setPreviousLine('');
        setCurrentLine(fullText);
      } else {
        // Two lines - move current to previous, new words to current
        const recentWords = words.slice(-maxWordsPerLine);
        const previousWords = words.slice(-maxWordsPerLine * 2, -maxWordsPerLine);
        
        setPreviousLine(previousWords.join(' '));
        setCurrentLine(recentWords.join(' '));
      }
      
      // Trigger animation
      setAnimationKey(prev => prev + 1);
    }
  }, [chunks, currentLine]);

  return (
    <div className="transcript-display">
      <div className="transcript-header">
        <span className="recording-indicator">●</span>
        <span className="transcript-label">LIVE</span>
        {chunks.length > 0 && (
          <button onClick={onClear} className="clear-btn">
            ×
          </button>
        )}
      </div>

      <div className="subtitle-container">
        {currentLine || previousLine ? (
          <div className="subtitle-text" key={animationKey}>
            {previousLine && (
              <div className="subtitle-line previous-line">
                {previousLine}
              </div>
            )}
            <div className="subtitle-line current-line">
              {currentLine || 'Listening...'}
            </div>
          </div>
        ) : (
          <div className="subtitle-placeholder">
            <div className="pulse-dot"></div>
            <span>Ready to transcribe</span>
          </div>
        )}
      </div>
    </div>
  );
};