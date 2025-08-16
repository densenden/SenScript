import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  onError
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'de-DE';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        onError?.(event.error);
        setIsListening(false);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isRecording) {
          recognition.start();
        }
      };
    } else {
      onError?.('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording, onTranscript, onError]);

  const startRecording = () => {
    if (recognitionRef.current && isSupported) {
      setTranscript('');
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-recorder unsupported">
        <div className="unsupported-message">
          Speech recognition not supported in this browser
        </div>
      </div>
    );
  }

  return (
    <div className="voice-recorder">
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={toggleRecording}
      >
        <motion.div
          className="record-icon"
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isListening ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isRecording ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="6"
                y="6"
                width="12"
                height="12"
                rx="2"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
                fill="currentColor"
              />
              <path
                d="M19 10V12C19 16.42 15.42 20 11 20H13C17.97 20 22 15.97 22 11V10H19Z"
                fill="currentColor"
              />
              <path
                d="M5 10V12C5 15.87 8.13 19 12 19C15.87 19 19 15.87 19 12V10H17V12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12V10H5Z"
                fill="currentColor"
              />
              <path
                d="M11 22H13V20H11V22Z"
                fill="currentColor"
              />
            </svg>
          )}
        </motion.div>
        <span className="record-label">
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </span>
      </button>

      <AnimatePresence>
        {transcript && (
          <motion.div
            className="transcript-display glass"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="transcript-label">Transcription:</div>
            <div className="transcript-text">{transcript}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {isRecording && (
        <div className="recording-indicator">
          <motion.div
            className="recording-dot"
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span>Recording...</span>
        </div>
      )}
    </div>
  );
};