import React from 'react';
import './Navigation.css';
import logoSvg from '../../../logo.svg';

type AppMode = 'senscript' | 'files' | 'settings';

interface NavigationProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeMode, onModeChange }) => {
  const modes = [
    { id: 'senscript' as AppMode, label: 'SenScript', available: true },
    { id: 'files' as AppMode, label: 'Files', available: false },
    { id: 'settings' as AppMode, label: 'Settings', available: false }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <img src={logoSvg} alt="SenScript" className="nav-logo" />
      </div>

      <div className="nav-modes">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => mode.available && onModeChange(mode.id)}
            className={`nav-mode ${activeMode === mode.id ? 'nav-mode-active' : ''} ${!mode.available ? 'nav-mode-disabled' : ''}`}
            disabled={!mode.available}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="nav-spacer" />
    </nav>
  );
};