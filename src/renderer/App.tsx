import React, { useState, useEffect } from 'react';
import './App.css';
import { ConversationAssistant } from './components/ConversationAssistant';
import logoSvg from '../../logo.svg';

type AppMode = 'conversation' | 'cards' | 'analytics' | 'settings';

interface ServiceStatus {
  speechRecognition: 'online' | 'offline' | 'pending';
  openai: 'online' | 'offline' | 'pending';
  microphone: 'online' | 'offline' | 'pending';
}

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('conversation');
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    speechRecognition: 'pending',
    openai: 'pending',
    microphone: 'pending'
  });

  useEffect(() => {
    // Check service statuses on mount
    checkServiceStatuses();
  }, []);

  const checkServiceStatuses = async () => {
    // Check Speech Recognition
    const speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    
    // Check Microphone Access
    let micStatus: 'online' | 'offline' = 'offline';
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      micStatus = 'online';
    } catch (error) {
      micStatus = 'offline';
    }

    // Check OpenAI API - check if valid key is configured
    let openaiStatus: 'online' | 'offline' = 'offline';
    
    // Check if API key exists and is not placeholder
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('Environment check:');
    console.log('- OPENAI_API_KEY available:', !!apiKey);
    console.log('- Key starts with sk-:', apiKey?.startsWith('sk-'));
    console.log('- Key length:', apiKey?.length);
    console.log('- First 20 chars:', apiKey?.substring(0, 20));
    
    if (apiKey && 
        apiKey !== 'your_openai_api_key_here' && 
        apiKey.startsWith('sk-') && 
        apiKey.length > 40) {
      openaiStatus = 'online';
      console.log('OpenAI: Valid API key detected - status online');
    } else {
      openaiStatus = 'offline';
      console.log('OpenAI: Invalid or missing API key - status offline');
    }

    setServiceStatus({
      speechRecognition: speechSupported ? 'online' : 'offline',
      openai: openaiStatus,
      microphone: micStatus
    });
  };

  const modes = [
    { id: 'conversation' as AppMode, label: 'Conversation', available: true },
    { id: 'cards' as AppMode, label: 'Cards', available: false },
    { id: 'analytics' as AppMode, label: 'Analytics', available: false },
    { id: 'settings' as AppMode, label: 'Settings', available: false }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <div className="brand-logo">
            <img src={logoSvg} alt="SenScript" className="logo-svg" />
          </div>
          <div className="brand-text">
            <div className="brand-name">SenScript</div>
            <div className="brand-tagline">AI Voice Assistant</div>
          </div>
        </div>

        <nav className="app-nav">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => mode.available && setActiveMode(mode.id)}
              className={`nav-item ${activeMode === mode.id ? 'nav-item-active' : ''} ${!mode.available ? 'nav-item-disabled' : ''}`}
              disabled={!mode.available}
            >
              {mode.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="app-content">
        <main className="main-content">
          {activeMode === 'conversation' && <ConversationAssistant />}
          {activeMode === 'cards' && (
            <div className="placeholder-content">
              <h2 className="text-xl font-bold">Card Creator</h2>
              <p className="text-secondary">Transform conversations into flashcards.</p>
              <p className="text-tertiary">Coming soon...</p>
            </div>
          )}
          {activeMode === 'analytics' && (
            <div className="placeholder-content">
              <h2 className="text-xl font-bold">Analytics</h2>
              <p className="text-secondary">Track your conversation insights.</p>
              <p className="text-tertiary">Coming soon...</p>
            </div>
          )}
          {activeMode === 'settings' && (
            <div className="placeholder-content">
              <h2 className="text-xl font-bold">Settings</h2>
              <p className="text-secondary">Configure your preferences.</p>
              <p className="text-tertiary">Coming soon...</p>
            </div>
          )}
        </main>

        <aside className="status-panel">
          <div className="status-header">
            <h3 className="text-sm font-semibold">System Status</h3>
          </div>
          
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Speech Recognition</span>
              <span className={`status-indicator ${serviceStatus.speechRecognition === 'online' ? 'status-online' : serviceStatus.speechRecognition === 'offline' ? 'status-offline' : 'status-pending'}`}>
                {serviceStatus.speechRecognition}
              </span>
            </div>
            
            <div className="status-item">
              <span className="status-label">OpenAI API</span>
              <span className={`status-indicator ${serviceStatus.openai === 'online' ? 'status-online' : serviceStatus.openai === 'offline' ? 'status-offline' : 'status-pending'}`}>
                {serviceStatus.openai}
              </span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Microphone</span>
              <span className={`status-indicator ${serviceStatus.microphone === 'online' ? 'status-online' : serviceStatus.microphone === 'offline' ? 'status-offline' : 'status-pending'}`}>
                {serviceStatus.microphone}
              </span>
            </div>
          </div>

          <button 
            onClick={checkServiceStatuses}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginTop: 'var(--space-3)' }}
          >
            Refresh Status
          </button>
        </aside>
      </div>
    </div>
  );
};