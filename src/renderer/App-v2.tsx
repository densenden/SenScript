import React, { useState, useEffect } from 'react';
import './App-v2.css';
import { InputControls } from './components/InputControls';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { CardStack } from './components/CardStack';
import { StatusBar } from './components/StatusBar';
import { Navigation } from './components/Navigation';
import { TranscriptionService, TranscriptChunk, InputSource } from './services/TranscriptionService';
import { CardGenerationService, FlashCard } from './services/CardGenerationService';

type AppMode = 'senscript' | 'files' | 'settings';

interface SystemStatus {
  speech: 'online' | 'offline' | 'pending';
  ai: 'online' | 'offline' | 'pending';
  microphone: 'online' | 'offline' | 'pending';
}

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('senscript');
  const [inputSource, setInputSource] = useState<InputSource>('microphone');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptChunks, setTranscriptChunks] = useState<TranscriptChunk[]>([]);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    speech: 'pending',
    ai: 'pending',
    microphone: 'pending'
  });

  const [transcriptionService] = useState(() => 
    new TranscriptionService({
      source: inputSource,
      language: 'en-US',
      continuous: true,
      interimResults: true
    })
  );

  const [cardGenerationService] = useState(() => new CardGenerationService());

  useEffect(() => {
    // Check system status on mount
    checkSystemStatus();

    // Set up transcription callbacks
    transcriptionService.onTranscriptReceived((chunk) => {
      setTranscriptChunks(prev => [...prev, chunk]);
      cardGenerationService.addTranscriptChunk(chunk);
    });

    transcriptionService.onStatusChanged((status) => {
      setIsTranscribing(status === 'listening');
      setSystemStatus(prev => ({
        ...prev,
        speech: status === 'listening' ? 'online' : status === 'error' ? 'offline' : 'pending'
      }));
    });

    transcriptionService.onErrorReceived((error) => {
      console.error('Transcription error:', error);
      setSystemStatus(prev => ({ ...prev, speech: 'offline' }));
    });

    // Set up card generation callbacks
    cardGenerationService.onCardGenerated((card) => {
      setCards(prev => [...prev, card]);
    });

  }, [transcriptionService, cardGenerationService]);

  const checkSystemStatus = async () => {
    // Check microphone access
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setSystemStatus(prev => ({ ...prev, microphone: 'online' }));
    } catch {
      setSystemStatus(prev => ({ ...prev, microphone: 'offline' }));
    }

    // Check AI API
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here' && apiKey.startsWith('sk-')) {
      setSystemStatus(prev => ({ ...prev, ai: 'online' }));
    } else {
      setSystemStatus(prev => ({ ...prev, ai: 'offline' }));
    }

    // Speech status is managed by transcription service
    const speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setSystemStatus(prev => ({ 
      ...prev, 
      speech: speechSupported ? 'online' : 'offline' 
    }));
  };

  const handleSourceChange = (source: InputSource) => {
    setInputSource(source);
    transcriptionService.setSource(source);
  };

  const handleStartTranscription = () => {
    console.log('🔴 App: handleStartTranscription called');
    console.log('🔍 Current transcription service state:', {
      inputSource,
      isTranscribing,
      systemStatus
    });
    transcriptionService.start();
  };

  const handleStopTranscription = () => {
    console.log('⏹️ App: handleStopTranscription called');
    transcriptionService.stop();
  };

  const handleClearTranscript = () => {
    setTranscriptChunks([]);
  };

  const handleClearCards = () => {
    setCards([]);
    cardGenerationService.clearCards();
  };

  const handleRemoveCard = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
    cardGenerationService.removeCard(cardId);
  };

  return (
    <div className="app-v2">
      {/* Container 1: Navigation */}
      <div className="floating-container nav-container">
        <Navigation 
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />
      </div>

      {/* Container 2: Input Controls */}
      <div className="floating-container input-container">
        <InputControls
          source={inputSource}
          isTranscribing={isTranscribing}
          onSourceChange={handleSourceChange}
          onStartTranscription={handleStartTranscription}
          onStopTranscription={handleStopTranscription}
        />
      </div>

      {/* Container 3: Transcript Display */}
      <div className="floating-container transcript-container">
        <TranscriptDisplay
          chunks={transcriptChunks}
          onClear={handleClearTranscript}
        />
      </div>

      {/* Container 4: Card Stack (50% height) */}
      <div className="floating-container cards-container">
        <CardStack
          cards={cards}
          onClear={handleClearCards}
          onRemoveCard={handleRemoveCard}
        />
      </div>

      {/* Container 5: Status Bar */}
      <div className="floating-container status-container">
        <StatusBar status={systemStatus} />
      </div>
    </div>
  );
};