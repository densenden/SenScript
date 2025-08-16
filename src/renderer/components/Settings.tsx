import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Settings.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  alwaysOnTop: boolean;
  onToggleAlwaysOnTop: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  alwaysOnTop,
  onToggleAlwaysOnTop
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="settings-panel glass-heavy"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="settings-header">
              <h3 className="settings-title">Settings</h3>
              <button className="button-minimal" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            
            <div className="settings-content">
              <div className="setting-item">
                <label className="setting-label">
                  <span className="setting-name">Always on Top</span>
                  <span className="setting-description">Keep window above other apps</span>
                </label>
                <button
                  className={`toggle ${alwaysOnTop ? 'active' : ''}`}
                  onClick={onToggleAlwaysOnTop}
                >
                  <span className="toggle-slider" />
                </button>
              </div>
              
              <div className="settings-section">
                <h4 className="section-title">Keyboard Shortcuts</h4>
                <div className="shortcut-list">
                  <div className="shortcut-item">
                    <span className="shortcut-action">Flip Card</span>
                    <span className="shortcut-key">Space / Enter</span>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Next Card</span>
                    <span className="shortcut-key">→ / N</span>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Previous Card</span>
                    <span className="shortcut-key">← / P</span>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Mark Incorrect</span>
                    <span className="shortcut-key">1</span>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Mark Correct</span>
                    <span className="shortcut-key">2</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};