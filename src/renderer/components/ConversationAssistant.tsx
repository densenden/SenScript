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
        recognition.maxAlternatives = 1;

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
          let errorMessage = 'Speech recognition error';
          
          switch (event.error) {
            case 'network':
              errorMessage = 'Network connection required for speech recognition. Please check your internet connection.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access denied. Please allow microphone permissions.';
              break;
            case 'no-speech':
              errorMessage = 'No speech detected. Try speaking closer to the microphone.';
              break;
            case 'audio-capture':
              errorMessage = 'Microphone not found or not working. Please check your audio settings.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech recognition service not available. Please try again later.';
              break;
            default:
              errorMessage = `Speech recognition error: ${event.error}`;
          }
          
          setError(errorMessage);
          setIsListening(false);
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
      } catch (err) {
        console.error('Error setting up speech recognition:', err);
        setError('Error setting up speech recognition. Please ensure microphone permissions are granted.');
      }
    } else {
      console.log('Speech recognition not supported');
      setError('Speech recognition not supported. Please use a Chromium-based browser (Chrome, Edge, etc.).');
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
        <div className="error-message glass">
          <h3>⚠️ Speech Recognition Issue</h3>
          <p>{error}</p>
          {error.includes('network') && (
            <div className="error-solutions">
              <h4>Solutions:</h4>
              <ul>
                <li>Check your internet connection</li>
                <li>Try restarting the application</li>
                <li>Ensure you're using a Chromium-based browser engine</li>
              </ul>
            </div>
          )}
          {error.includes('not supported') && (
            <div className="error-solutions">
              <h4>Requirements:</h4>
              <ul>
                <li>SenScript uses Chromium's speech recognition engine</li>
                <li>Microphone permissions are required</li>
                <li>Internet connection is needed for processing</li>
              </ul>
            </div>
          )}
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            🔄 Retry
          </button>
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