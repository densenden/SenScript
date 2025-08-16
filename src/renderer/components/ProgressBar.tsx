import React from 'react';
import { motion } from 'framer-motion';
import './ProgressBar.css';

interface ProgressBarProps {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  correct,
  incorrect
}) => {
  const progress = (current / total) * 100;
  const correctPercentage = total > 0 ? (correct / current) * 100 : 0;

  return (
    <div className="progress-container">
      <div className="progress-stats">
        <span className="progress-text">{current} / {total}</span>
        {current > 0 && (
          <span className="progress-accuracy">
            {Math.round(correctPercentage)}% correct
          </span>
        )}
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <div className="progress-indicators">
        <div className="indicator correct">
          <span className="indicator-icon">✓</span>
          <span className="indicator-count">{correct}</span>
        </div>
        <div className="indicator incorrect">
          <span className="indicator-icon">✗</span>
          <span className="indicator-count">{incorrect}</span>
        </div>
      </div>
    </div>
  );
};