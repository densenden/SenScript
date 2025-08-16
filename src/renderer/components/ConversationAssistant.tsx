import React, { useState, useEffect, useRef } from 'react';
import './ConversationAssistant.css';

console.log('ConversationAssistant.tsx loading...');

export const ConversationAssistant: React.FC = () => {
  console.log('ConversationAssistant component rendering...');
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    console.log('Checking speech recognition support...');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('Speech recognition supported');
      setIsSupported(true);
      
      try {
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setError('');
        };

        recognition.onresult = (event) => {
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

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
      } catch (err) {
        console.error('Error setting up speech recognition:', err);
        setError('Error setting up speech recognition');
      }
    } else {
      console.log('Speech recognition not supported');
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    console.log('Starting speech recognition...');
    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        setError('Error starting speech recognition');
      }
    }
  };

  const stopListening = () => {
    console.log('Stopping speech recognition...');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  if (error) {
    return (
      <div className="conversation-assistant">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <p>Try using Chrome or Edge for best speech recognition support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-assistant">
      <div className="assistant-header">
        <div className="status-indicator">
          <div className={`status-dot ${isListening ? 'listening' : 'inactive'}`} />
          <span className="status-text">
            {isListening ? 'Listening...' : 'Ready'}
          </span>
        </div>
        
        <button
          className={`listen-toggle ${isListening ? 'active' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported}
        >
          {isListening ? '⏸️' : '🎤'}
        </button>
      </div>

      <div className="conversation-content">
        {transcript && (
          <div className="live-transcript glass">
            <div className="transcript-label">Live Transcript:</div>
            <div className="transcript-text">{transcript}</div>
          </div>
        )}

        <div className="instructions">
          <h3>Welcome to SenScript!</h3>
          <p>Click the microphone button to start listening.</p>
          <p>Ask questions and get instant AI-powered answers.</p>
          
          <div className="test-section">
            <h4>Test Speech Recognition:</h4>
            <p>Try saying: "What is artificial intelligence?"</p>
            <p>Or: "How does machine learning work?"</p>
          </div>
        </div>
      </div>
    </div>
  );
};