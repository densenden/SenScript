import React from 'react';
import './StatusBar.css';

interface SystemStatus {
  speech: 'online' | 'offline' | 'pending';
  ai: 'online' | 'offline' | 'pending';
  microphone: 'online' | 'offline' | 'pending';
}

interface StatusBarProps {
  status: SystemStatus;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  const getStatusIcon = (state: 'online' | 'offline' | 'pending') => {
    switch (state) {
      case 'online':
        return '●';
      case 'offline':
        return '○';
      case 'pending':
        return '◑';
      default:
        return '○';
    }
  };

  const getStatusClass = (state: 'online' | 'offline' | 'pending') => {
    switch (state) {
      case 'online':
        return 'status-online';
      case 'offline':
        return 'status-offline';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-offline';
    }
  };

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">Speech</span>
        <span className={`status-indicator ${getStatusClass(status.speech)}`}>
          {getStatusIcon(status.speech)}
        </span>
      </div>

      <div className="status-item">
        <span className="status-label">AI</span>
        <span className={`status-indicator ${getStatusClass(status.ai)}`}>
          {getStatusIcon(status.ai)}
        </span>
      </div>

      <div className="status-item">
        <span className="status-label">Mic</span>
        <span className={`status-indicator ${getStatusClass(status.microphone)}`}>
          {getStatusIcon(status.microphone)}
        </span>
      </div>

      <div className="status-spacer" />

      <div className="app-info">
        <span className="text-xs text-tertiary">
          SenScript v2.0
        </span>
      </div>
    </div>
  );
};