# SenScript 🎙️

> AI-powered transcript-to-flashcard generator with floating transparent interface for macOS

## ✨ New Interface Features (v2.0)

- **🎯 Multi-Source Input** - Teams, Zoom, Slack integration + direct microphone
- **📝 Live Transcription** - Real-time speech-to-text with context processing
- **🃏 Dynamic Card Generation** - AI creates flashcards from conversation content
- **👻 Floating Transparent UI** - 4 glass-morphism containers with macOS vibrancy
- **📊 Smart Layout** - Cards take 50% height, grow with transcript context
- **⚡ Real-time Processing** - Speech → Transcript → AI Analysis → Card Generation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- macOS (primary target platform)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SenScript.git
   cd SenScript
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🎯 Usage

### Interface Layout (Top to Bottom)

```
┌─────────────────────────────────────────┐
│ [Input Controls] Teams|Zoom|Slack|Mic   │ ← Horizontal recording bar  
├─────────────────────────────────────────┤
│ Live Transcript Display                 │ ← Real-time text output
├─────────────────────────────────────────┤
│                                         │
│     Growing Card Stack (50%)            │ ← AI-generated flashcards
│     [Card 1] [Card 2] [Card 3]         │
│                                         │
├─────────────────────────────────────────┤
│ Status: ● Speech ● AI ● Mic             │ ← Compact status line
└─────────────────────────────────────────┘
```

### Navigation Modes

1. **SenScript** (default) - Main transcript-to-cards interface with integrated logo
2. **Files** - Card collection management and export
3. **Settings** - Configuration and source preferences

### Workflow

1. Select input source (Teams/Zoom/Slack/Mic) from horizontal control bar
2. Start transcription - see live text appear in transcript panel
3. Watch AI automatically generate flashcards from conversation content
4. Cards grow and stack in the main 50% height container
5. Monitor system status via compact indicators at bottom

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
- **Desktop**: Electron 27
- **Animations**: Framer Motion
- **AI**: OpenAI GPT-3.5 Turbo
- **Speech**: Web Speech API
- **Build**: Webpack 5
- **Package**: Electron Builder

## 🔧 Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start built application
npm start

# Create distributable package
npm run dist
```

### Development Workflow

1. **Main Process**: `npm run dev:main` - Watches and rebuilds Electron main process
2. **Renderer Process**: `npm run dev:renderer` - Starts webpack dev server for React app
3. **Combined**: `npm run dev` - Runs both processes concurrently

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