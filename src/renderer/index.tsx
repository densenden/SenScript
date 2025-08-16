import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

console.log('React index.tsx loading...');

const container = document.getElementById('root');
if (!container) {
  console.error('Root element not found');
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found</div>';
} else {
  console.log('Root element found, creating React app...');
  const root = createRoot(container);
  root.render(<App />);
  console.log('React app rendered');
}