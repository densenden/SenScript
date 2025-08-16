import React from 'react';
import './InputControls.css';
import { InputSource } from '../services/TranscriptionService';

interface InputControlsProps {
  source: InputSource;
  isTranscribing: boolean;
  onSourceChange: (source: InputSource) => void;
  onStartTranscription: () => void;
  onStopTranscription: () => void;
}

export const InputControls: React.FC<InputControlsProps> = ({
  source,
  isTranscribing,
  onSourceChange,
  onStartTranscription,
  onStopTranscription
}) => {
  const sources: { id: InputSource; label: string; available: boolean }[] = [
    { id: 'microphone', label: 'Mic', available: true },
    { id: 'teams', label: 'Teams', available: false },
    { id: 'zoom', label: 'Zoom', available: false },
    { id: 'slack', label: 'Slack', available: false }
  ];

  return (
    <div className="input-controls">
      <div className="source-selector">
        <span className="source-label">Input:</span>
        {sources.map((src) => (
          <button
            key={src.id}
            onClick={() => src.available && onSourceChange(src.id)}
            className={`source-btn ${source === src.id ? 'source-btn-active' : ''} ${!src.available ? 'source-btn-disabled' : ''}`}
            disabled={!src.available}
          >
            {src.label}
          </button>
        ))}
      </div>

      <div className="record-controls">
        <button
          onClick={isTranscribing ? onStopTranscription : onStartTranscription}
          className={`record-btn ${isTranscribing ? 'record-btn-active' : ''}`}
        >
          <div className={`record-indicator ${isTranscribing ? 'recording' : ''}`} />
          {isTranscribing ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="status-text">
        {isTranscribing ? 'Recording...' : 'Ready to record'}
      </div>
    </div>
  );
};