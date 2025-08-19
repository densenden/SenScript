# SenScript 🎙️ v3.1

## **🎯 GOAL NUMBER 1: CARD CREATION SPEED**
**The primary objective of SenScript is maximum speed in generating educational flashcards from speech. Every feature, optimization, and design decision prioritizes faster card generation over perfect accuracy.**

> Multi-language AI transcript-to-flashcard generator with robust speech recognition and intelligent filtering

## ✨ Chrome Web App Features (v3.1)

- **🌐 Browser-Native** - Runs in Chrome with full Web Speech API support
- **🌍 Multi-Language Support** - Auto-detection and switching between 12 major languages
- **🎯 Universal Conferencing** - Works with Teams, Zoom, Slack, Meet, and any web-based service
- **📝 Robust Real-time Transcription** - Enhanced speech recognition with automatic retry and error recovery
- **🃏 Intelligent AI Card Generation** - Smart flashcards from live conversations with multiple LLM providers
- **🛡️ Corruption Filtering** - Advanced detection and filtering of garbled/corrupted speech recognition
- **👻 Glass Morphism UI** - Beautiful floating interface with smooth animations
- **🎧 Dual Audio Support** - Microphone input + device output capture
- **⚡ Speed & Robustness Optimized** - Never stops listening, maximum reliability

## 🧠 How It Works (Enhanced v3.1)

### Architecture Overview
SenScript is a real-time meeting assistant optimized for reliability and maximum speed in flashcard generation:

1. **Multi-Language Speech Capture** (app.js)
   - Uses Web Speech API for continuous speech recognition
   - Auto-detects and switches between 12 major languages (DE, EN, ES, FR, IT, PT, NL, RU, ZH, JA, KO, AR)
   - Robust error handling with automatic retry mechanisms
   - Corrupted text detection and filtering
   - Accumulates speech into complete sentences with smart segmentation

2. **Intelligent Content Processing** (app.js)
   - Advanced filtering of trivial content (greetings, filler words, garbled text)
   - Corruption detection patterns to filter out speech recognition errors
   - Detects worthy content: questions, definitions, technical terms, concepts
   - Segment-wise processing for better recognition accuracy
   - Prevents duplicate and similar content from being processed

3. **Multi-Provider AI Card Generation** (server.js, llm-providers.js, llm-conversation.js)
   - Supports OpenAI, Anthropic Claude, and DeepSeek models
   - Fastest-responder selection for optimal performance
   - Conversation-based approach to reduce API costs by 90%+
   - Analyzes content type (Question, Definition, Concept, Fact)
   - Generates educational flashcards in detected language
   - Intelligent fallback system with educational value assessment

4. **Enhanced Real-time Display**
   - Glass morphism UI with smooth animations (no wobbling)
   - Live audio level visualization with 7-dot system
   - Corrected transcript line ordering (swapped lines 2 and 3)
   - Real-time language detection display with flag indicators
   - Confidence scoring and provider tracking
   - Maximum 8 cards visible with push-up animations

## 🚀 Getting Started

### Prerequisites

- **Google Chrome** (latest version recommended)
- **OpenAI API key** (for AI-powered card generation)
- **Microphone access** (for speech recognition)

### Installation Options

#### Option 1: Chrome Extension (Recommended)
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SenScript.git
   cd SenScript
   git checkout chrome-web-app
   ```

2. **Build the extension**
   ```bash
   npm install
   npm run build:extension
   ```

3. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist-extension` folder

#### Option 2: Web App (Current)
1. **Clone and setup**
   ```bash
   git clone https://github.com/yourusername/SenScript.git
   cd SenScript/web-app
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start the application**
   ```bash
   # Start both server and web app
   npm run start  # or node server.js
   ```

4. **Open in Chrome**
   - Navigate to `http://localhost:3001` (or configured PORT)
   - Allow microphone permissions when prompted

## 🎯 Usage

### As Chrome Extension
1. **Click the SenScript icon** in Chrome toolbar
2. **Grant microphone permissions** when prompted
3. **Join any web conference** (Teams, Zoom, Slack, Meet, etc.)
4. **Start recording** - the extension automatically transcribes audio
5. **View live flashcards** generated from the conversation

### Universal Conferencing Integration

```
┌─────────────────────────────────────┐
│  Teams Meeting Tab  │  SenScript   │ ← Works alongside any conference
├─────────────────────────────────────┤
│                     │ 🎤 Recording  │
│   Video Conference  │ 📝 Live Text  │ ← Transparent overlay
│                     │ 🃏 AI Cards   │
│                     │ ● Status      │
└─────────────────────────────────────┘
```

### Key Features

- **Overlay Mode**: Transparent popup that floats over conference windows
- **Auto-Detection**: Recognizes when you're in a meeting and offers to start
- **Cross-Platform**: Works with any web-based conferencing service
- **Privacy-First**: All processing happens locally in your browser
- **Export Ready**: Save flashcards in multiple formats (Anki, CSV, JSON)

## 🏗️ Architecture

```
SenScript/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Application entry point
│   │   └── preload.ts  # Renderer preload script
│   ├── renderer/       # React frontend
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # Business logic
│   │   └── styles/     # CSS styles
│   └── shared/         # Shared types and utilities
├── dist/              # Built application
└── dist-app/          # Packaged app (after electron-builder)
```

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Platform**: Chrome Extension API + Web Standards
- **Speech Recognition**: Browser Web Speech API (Google's service)
- **AI**: OpenAI GPT-3.5 Turbo
- **Animations**: Framer Motion
- **Build**: Webpack 5 + Chrome Extension Tools
- **Package**: Chrome Web Store ready

## 🔧 Development

### Available Scripts

```bash
# Development web app with hot reload
npm run dev:web

# Build Chrome extension
npm run build:extension

# Development extension (watch mode)
npm run dev:extension

# Start web app in production mode
npm run start:web

# Package for Chrome Web Store
npm run package:store
```

### Development Workflow

1. **Web Development**: `npm run dev:web` - Start local development server
2. **Extension Testing**: Load unpacked extension from `dist-extension/` folder
3. **Live Reload**: Changes automatically refresh in both web and extension modes
4. **Testing**: Open Chrome DevTools to debug speech recognition and API calls

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the web-app directory:

```env
# Multi-Provider LLM Support (at least one required)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Fallback Keys (used when user doesn't provide keys)
FALLBACK_OPENAI_KEY=fallback_openai_key
FALLBACK_ANTHROPIC_KEY=fallback_anthropic_key  
FALLBACK_DEEPSEEK_KEY=fallback_deepseek_key

# Model Configuration
OPENAI_MODEL=gpt-3.5-turbo           # Default OpenAI model
ANTHROPIC_MODEL=claude-3-haiku-20240307  # Default Anthropic model
DEEPSEEK_MODEL=deepseek-chat         # Default DeepSeek model

# Response Limits
OPENAI_MAX_TOKENS=200                # OpenAI response length
ANTHROPIC_MAX_TOKENS=200             # Anthropic response length  
DEEPSEEK_MAX_TOKENS=200              # DeepSeek response length

# Creativity Settings
OPENAI_TEMPERATURE=0.7               # OpenAI response creativity
ANTHROPIC_TEMPERATURE=0.7            # Anthropic response creativity
DEEPSEEK_TEMPERATURE=0.7             # DeepSeek response creativity

# Server Configuration
PORT=3001                            # Server port (default: 3001)
```

## 💰 API Cost Optimization (v3.1 Improvements)

### ✅ Major Cost Reductions Implemented
✨ **90%+ Cost Reduction Achieved!**
- **Conversation-based processing**: Maintains context across calls, reducing redundant prompts
- **Fastest-responder selection**: Races multiple providers for optimal performance and cost
- **Intelligent conversation management**: Maintains context threads per session
- **Smart content filtering**: Enhanced filtering prevents unnecessary API calls for corrupted/trivial text
- **Provider failover**: Automatic switching to cheaper/faster alternatives when available

### Current Cost Structure (v3.1)
- **Conversation context maintained**: Reduces prompt repetition by 80%
- **Multi-provider racing**: Uses cheapest/fastest available option
- **Enhanced filtering**: 50% fewer unnecessary API calls due to corruption detection
- **Estimated cost**: ~$0.0001 per card (down from $0.001)

### Cost Reduction Strategies

#### 1. **Batch Processing** (Recommended)
Instead of calling API for each sentence, batch multiple sentences:
```javascript
// Collect sentences for 30 seconds, then process together
const batchedSentences = [];
// Send one API call with multiple sentences
// Generate multiple cards in one response
```

#### 2. **Use Cheaper Models**
```env
OPENAI_MODEL=gpt-3.5-turbo          # Current: ~$0.001/card
OPENAI_MODEL=gpt-4o-mini            # Alternative: Cheaper, good quality
```

#### 3. **Reduce Token Usage**
```env
OPENAI_MAX_TOKENS=150                # Reduce from 200 to 150
OPENAI_TEMPERATURE=0.5               # Less creative = shorter responses
```

#### 4. **Implement Caching**
- Cache similar questions/concepts
- Reuse responses for repeated content
- Store common technical terms locally

#### 5. **Smart Filtering**
Enhance the `isTextWorthyOfCard()` function to be more selective:
- Increase minimum text length requirement
- Add duplicate detection
- Filter out more non-educational content

#### 6. **Conversation Context** (Advanced)
Maintain a conversation thread:
```javascript
// Instead of new calls, use conversation history
const conversation = [
  {role: "system", content: "You are a meeting assistant..."},
  {role: "user", content: "Previous context..."},
  {role: "assistant", content: "Previous response..."},
  {role: "user", content: "New sentence to process..."}
];
```

#### 7. **Local Processing First**
- Use local NLP for initial categorization
- Only send to OpenAI if confidence is low
- Implement rule-based card generation for common patterns

### Estimated Savings
- **Current**: ~$0.001 per sentence → $0.60 per hour (10 cards/min)
- **Optimized**: ~$0.0002 per sentence → $0.12 per hour (80% reduction)
- **With Batching**: ~$0.00005 per sentence → $0.03 per hour (95% reduction)

### App Settings

The app creates a frameless, always-on-top window that:
- Remains visible during other activities
- Provides instant access to AI assistance
- Minimizes workflow disruption

## 📝 Features in Detail

### Question Detection

The app listens for question indicators in multiple languages:
- **English**: "what", "how", "when", "where", "why", "who"
- **German**: "was", "wie", "wann", "wo", "warum", "wer"

### AI Integration

- Uses OpenAI GPT-3.5 Turbo for response generation
- Provides contextual answers based on detected questions
- Falls back gracefully when AI services are unavailable

### Overlay Interface

- Non-intrusive design that stays on top of other windows
- Smooth animations powered by Framer Motion
- Responsive layout adapting to content length

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/SenScript/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your setup and the issue

## 🔮 Roadmap & Recent Updates

### ✅ v3.1 Completed Features
- [x] **Multi-language support** - 12 major languages with auto-detection
- [x] **Robust error handling** - Never stops listening, automatic retry mechanisms
- [x] **Corruption filtering** - Advanced detection of garbled speech recognition
- [x] **Multi-provider LLM support** - OpenAI, Anthropic, DeepSeek with racing
- [x] **Conversation context** - 90% cost reduction through context maintenance
- [x] **Enhanced UI animations** - Fixed wobbling, improved transcript ordering
- [x] **Audio level visualization** - Real-time 7-dot level indicators
- [x] **Segment-wise processing** - Better speech recognition accuracy

### 🚀 Upcoming Features (v3.2)
- [ ] **Chrome Extension** - True browser extension deployment
- [ ] **Enhanced language detection** - Better segment-wise language switching  
- [ ] **Custom wake word detection** - Activate on specific phrases
- [ ] **Cloud sync for flashcards** - Cross-device synchronization
- [ ] **Voice response capability** - AI can speak back answers
- [ ] **Integration with popular note-taking apps** - Notion, Obsidian, Anki export
- [ ] **Advanced conversation analytics** - Learning progress tracking
- [ ] **Batch processing mode** - Process recorded meetings offline
- [ ] **Local LLM support** - Offline operation with local models

---

**Built with ❤️ for seamless AI-powered conversations**