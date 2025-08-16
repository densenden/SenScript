import React, { useState } from 'react';
import './App.css';

console.log('App.tsx loading...');

export const App: React.FC = () => {
  console.log('App component rendering...');
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' ';
          }
        }

        if (finalTranscript.trim()) {
          console.log('Transcript:', finalTranscript);
          setTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Error starting speech recognition');
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div className="strip">
      {/* Header strip - draggable */}
      <div className="header-strip">
        <div className="brand">
          <span className="brand-icon">🎤</span>
          <span className="brand-text">SenScript</span>
        </div>
        <div className="status">
          <div className={`status-dot ${isListening ? 'listening' : 'inactive'}`} />
          <span className="status-text">
            {isListening ? 'Listening...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="content no-drag">
        {error && (
          <div className="error-card">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <p>Try using Chrome or Edge for best speech recognition support.</p>
          </div>
        )}

        {transcript && (
          <div className="transcript-card">
            <div className="transcript-label">Live Transcript:</div>
            <div className="transcript-text">{transcript}</div>
          </div>
        )}

        <div className="main-card">
          <h3>🎤 Voice Assistant</h3>
          <p>Click the microphone to start listening for questions.</p>
          
          <button
            className={`mic-button ${isListening ? 'active' : ''} no-drag`}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? '⏸️ Stop' : '🎤 Listen'}
          </button>

          <div className="examples">
            <h4>Try saying:</h4>
            <p>"What is artificial intelligence?"</p>
            <p>"How does machine learning work?"</p>
          </div>
        </div>
      </div>
    </div>
  );
};