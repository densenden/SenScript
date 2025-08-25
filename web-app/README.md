# SenScript Web App

Real-time conversation assistant that runs in Chrome browser with continuous speech recognition and AI-powered flashcard generation.

**🎯 GOAL NUMBER 1: CARD CREATION SPEED**

## Quick Start

```bash
# Start the server
node server.js

# Open in Chrome browser
http://localhost:3002
```

## Features

- **Real-time Speech Recognition**: Continuous listening with Web Speech API
- **Auto Language Detection**: German/English detection with confidence scoring  
- **OpenAI-Powered Flashcards**: Intelligent card generation using GPT-3.5-turbo
- **Animated Subtitles**: Sound wave text animation with subtitle best practices
- **System Audio Capture**: Record from any app via screen sharing permission
- **Responsive Design**: Mobile-first with 4 distinct screens
- **iOS 16 Glass Morphism**: Elegant dark blue gradient with blur effects
- **Theme Toggle**: Dark/light mode with proper logo switching

## File Structure

```
web-app/
├── index.html              # Main responsive UI with 4 screens
├── server.js               # Simple HTTP server with CORS support
├── js/                     # Modular JavaScript architecture
│   ├── core/
│   │   └── main.js         # Main SenScript application class
│   ├── audio/
│   │   ├── audio-system.js # Audio source management & switching
│   │   └── speech-recognition.js # Web Speech API integration
│   ├── cards/
│   │   ├── card-engine.js  # Card generation logic & testing
│   │   └── card-generator.js # AI-powered card creation
│   ├── ui/
│   │   ├── ui-manager.js   # UI interactions & modal management
│   │   └── settings-manager.js # Settings persistence & controls
│   ├── utils/
│   │   ├── language-detection.js # Multi-language detection
│   │   └── transcript-processing.js # Text processing utilities
│   └── loader.js           # Module loader with fallback support
├── assets/images/          # Logo files for theme switching
│   ├── logo-white.svg      # Dark mode logo
│   └── logo-black.svg      # Light mode logo
├── test-transcripts.js     # Hardcoded test data for card generation
├── app.js                  # Legacy monolithic file (fallback)
└── README.md               # This file
```

## Screens Layout

### Mobile (4 Screens)
1. **Logo + Controls**: SenScript branding, audio selector, record button
2. **Live Transcript**: Real-time speech-to-text display
3. **AI Flashcards**: Generated cards with category detection
4. **Info & Status**: API status, features list, export functionality

### Desktop  
- **Left Panel**: Logo + Controls + Status
- **Center**: Transcript (top) + Flashcards (bottom)
- **Right Panel**: Info + Features + Export

## Usage

1. **Setup**: Add your OpenAI API key to `.env` file
2. **Start Listening**: Click record button, allow microphone permissions
3. **Audio Source**: Choose microphone or system audio (screen sharing)
4. **Language Detection**: Automatic DE/EN switching based on content
5. **AI Card Generation**: 3+ word segments create intelligent flashcards with confidence scores
6. **Animated Transcript**: Watch live text with sound wave animation effects
7. **Theme Toggle**: Switch between dark/light modes
8. **Export**: Download cards as JSON when ready

## Development

All functionality is contained in a single working version:
- Clean file structure with no unused code
- Comprehensive console logging for debugging
- Error handling with graceful fallbacks
- Mobile-responsive with CSS Grid for desktop

## Browser Requirements

- **Chrome recommended**: Web Speech API works best
- **Microphone permissions**: Required for speech recognition
- **System audio**: Requires screen sharing permission via getDisplayMedia()

## Modular Architecture

### 🏗️ **Clean Separation of Concerns**
- **Core Module** (`main.js`): Application initialization & coordination
- **Audio System** (`audio/`): Microphone/system audio management & Web Speech API
- **Card Engine** (`cards/`): AI-powered flashcard generation & testing
- **UI Management** (`ui/`): Interface interactions, settings, modals
- **Utilities** (`utils/`): Language detection, text processing helpers
- **Module Loader** (`loader.js`): Dynamic loading with fallback support

### 🔧 **Technical Stack**
- **Frontend**: Modular vanilla JavaScript with class-based architecture
- **Speech API**: webkitSpeechRecognition with continuous mode
- **Audio Capture**: MediaDevices API for system/microphone input  
- **Styling**: CSS-only with glass morphism effects
- **Server**: Simple Node.js HTTP server for local development
- **Fallback**: Monolithic app.js as backup if modular system fails

### 🧪 **Testing & Development**
- **Console Functions**: `testCards()`, `testCheat()`, `window.app` for debugging
- **Modular Loading**: Sequential module loading with error handling
- **Performance**: Small, focused files instead of 5000+ line monolith
- **Maintainability**: Easy to find and modify specific functionality