# SenScript 🎙️

> Chrome-based AI transcript-to-flashcard generator with universal conferencing integration

## ✨ Chrome Web App Features (v3.0)

- **🌐 Browser-Native** - Runs in Chrome with full Web Speech API support
- **🎯 Universal Conferencing** - Works with Teams, Zoom, Slack, Meet, and any web-based service
- **📝 Real-time Transcription** - Reliable browser-based speech recognition
- **🃏 AI Card Generation** - Intelligent flashcards from live conversations
- **👻 Transparent Popup** - Floating overlay that works over any application
- **🎧 Perfect Audio Integration** - Direct mic access with zero compatibility issues

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

#### Option 2: Web App
1. **Start development server**
   ```bash
   npm run dev:web
   ```

2. **Open in Chrome**
   - Navigate to `http://localhost:3000`
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

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

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

## 🔮 Roadmap

- [ ] Enhanced multi-language support
- [ ] Custom wake word detection
- [ ] Cloud sync for flashcards
- [ ] Voice response capability
- [ ] Integration with popular note-taking apps
- [ ] Advanced conversation analytics

---

**Built with ❤️ for seamless AI-powered conversations**