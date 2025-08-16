# SenScript 🎙️

> Real-time AI conversation assistant that listens continuously and provides instant answers when questions are detected.

## ✨ Features

- **🎯 Continuous Speech Recognition** - Always listening for questions in the background
- **🧠 Smart Question Detection** - Automatically identifies questions with keywords like "what", "how", "was", "wie"
- **🤖 AI-Powered Answers** - Uses OpenAI GPT-3.5 for contextual, intelligent responses
- **📱 Overlay Display** - Answers appear instantly without disrupting your workflow
- **🌍 Multi-Language Support** - Supports both German and English conversations
- **💳 Flashcard Creator** - Generate and manage educational flashcards
- **⚡ Real-time Processing** - Instant response to spoken questions

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

### Conversation Assistant Mode (Default)

1. Launch the app - it automatically starts in **Conversation Assistant** mode
2. Click the microphone button to begin listening
3. Speak naturally - questions containing keywords are automatically detected
4. AI-generated answers appear instantly in the overlay window
5. The app continues listening for follow-up questions

### Card Creator Mode

1. Toggle to **Card Creator** mode using the header buttons
2. Generate flashcards from your conversations
3. Review and manage your flashcard collection

### Keyboard Shortcuts

- Toggle between modes using the interface buttons
- Microphone controls via click interaction

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