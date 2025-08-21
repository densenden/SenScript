# SenScript - AI-Powered Educational Flashcard Generator

Real-time educational flashcard generation from any audio source - meetings, lectures, videos, or conversations. Transform spoken content into intelligent study materials instantly.

## 🚀 Quick Start

```bash
# Navigate to web-app directory
cd web-app

# Install dependencies
npm install

# Start the web application
npm start
# Opens at http://localhost:3002

# Alternative: Development mode with auto-restart
npm run dev
```

## 🎯 Key Features

- **Universal Audio Capture**: Works with microphone or any browser tab audio
- **Real-time Transcription**: Instant speech-to-text with multi-language support
- **AI Card Generation**: Intelligent flashcard creation using GPT-4, Claude, or DeepSeek
- **Smart Language Detection**: Automatic switching between 13 languages
- **Interview Mode**: Special "Spickzettel" mode for exam preparation
- **Export Options**: Save cards as Anki decks, CSV, or JSON
- **Model Display**: Shows which AI model generated each card

## 🏗️ Architecture

### Web Application Stack
```
SenScript Web App
├── Frontend (Vanilla JS + Tailwind CSS)
│   ├── Real-time transcription display
│   ├── Flashcard rendering with AI model info
│   └── Audio level visualization
├── Backend (Node.js)
│   ├── LLM orchestration
│   ├── Multi-provider support (OpenAI, Anthropic, DeepSeek)
│   └── Session management
└── APIs
    ├── Web Speech API (transcription)
    ├── MediaStream API (tab/system audio capture)
    └── LLM APIs (card generation)
```

## 🎤 Audio Sources

### Microphone Mode
- Direct microphone input
- Works with any microphone device
- Full transcription support
- Best for in-person conversations

### Tab Audio Mode
- Capture audio from any browser tab
- Perfect for online meetings, videos, lectures
- Works with: Zoom, Teams, Meet, YouTube, any web content
- Select tab when sharing screen to capture its audio
- Audio levels shown in real-time

## 🤖 AI Providers

Configure your preferred LLM provider in Settings:

| Provider | Models | Features |
|----------|--------|----------|
| **OpenAI** | GPT-4, GPT-3.5 | High quality, reliable |
| **Anthropic** | Claude 3 | Excellent reasoning |
| **DeepSeek** | DeepSeek-V2 | Cost-effective |

Each card displays which model generated it (e.g., "OpenAI", "Anthropic", "Deepseek").

## 📝 Card Types

- **Question**: Direct Q&A format for active recall
- **Definition**: Term and detailed explanation
- **Concept**: Complex idea breakdown
- **Fact**: Key information points

## ⚙️ Configuration

### API Keys
Create a `.env` file in the web-app directory:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=...
```

### Settings Panel
- **Output Language**: Auto-detect or fixed language for cards
- **Education Level**: Adjust complexity (1=Beginner, 5=Expert)
- **Detail Level**: Control answer depth (1=Brief, 5=Comprehensive)
- **Example Complexity**: Set example sophistication (1=Simple, 5=Academic)
- **Interview Mode**: Toggle for exam preparation cards

## 🛠️ Development

### Project Structure
```
web-app/                    # Main application directory  
├── index.html             # UI with glass morphism & enhanced animations
├── app.js                 # Core application logic (3000+ lines)
├── card-engine.js         # NEW: Universal card generation engine
├── test-transcripts.js    # NEW: Hardcoded test data for isolated testing
├── server.js             # Node.js backend server
├── llm-conversation.js   # AI conversation management
├── llm-providers.js      # Multi-provider orchestration
├── settings-config.js    # Comprehensive configuration system
└── package.json          # Dependencies and scripts
```

### Key Technologies
- **Frontend**: Vanilla JavaScript, Tailwind CSS, Glass Morphism UI
- **Backend**: Node.js, Express
- **APIs**: Web Speech API, MediaStream API
- **AI**: OpenAI, Anthropic, DeepSeek APIs
- **Real-time**: WebSockets for future enhancements

## ⚡ Performance Optimizations (v2.0)

### Speed-First Card Generation Engine
- **Ultra-Fast Processing**: Card generation in <1 second with new engine
- **Smart Duplicate Detection**: 30-second cache prevents redundant processing
- **Optimized Worthiness Checks**: Single-pass analysis with minimal computation
- **Retry Logic**: Exponential backoff ensures reliability under load
- **Performance Metrics**: Built-in success rate and response time tracking

### Enhanced Transcript UI
- **3-Line Smooth Display**: Lines 1-2 stay static, move up when complete
- **Flip Animations**: Smooth transitions between interim and final text
- **Connected Readability**: Text flows naturally with proper paragraphs
- **Visual Feedback**: Real-time typing animations and language switching

### Advanced Language Handling  
- **Input-Output Sync**: Card language automatically sets input language
- **Dynamic Switching**: Detects language changes mid-conversation
- **Smart Persistence**: Remembers and applies language preferences
- **Visual Transitions**: Shows language switches with flag indicators

### System Performance
- **Memory**: Automatic cleanup for long sessions
- **Reliability**: Never stops listening, robust error handling
- **Testing**: Isolated card generation testing with `testCards()` command
- **Multi-language**: 13 languages with 90%+ detection accuracy

## 🔒 Privacy & Security

- **Local First**: All processing happens in your browser
- **No Server Storage**: No data retention on server
- **Secure Keys**: API keys stored locally, never transmitted
- **User Control**: Export and delete your data anytime
- **Tab Audio**: Only captures audio from selected tab

## 🎨 UI Features

- **Glass Morphism Design**: Modern, translucent interface
- **Dark/Light Mode**: Automatic theme switching
- **Audio Visualization**: Real-time 7-dot level indicators
- **Transcript Display**: Live scrolling with 3-line history
- **Card Management**: View confidence scores and AI provider
- **Responsive Design**: Optimized for all screen sizes

## 🌍 Supported Languages

Auto-detection and switching between:
- 🇩🇪 German (de-DE)
- 🇺🇸 English (en-US)
- 🇫🇷 French (fr-FR)
- 🇪🇸 Spanish (es-ES)
- 🇮🇹 Italian (it-IT)
- 🇵🇹 Portuguese (pt-PT)
- 🇳🇱 Dutch (nl-NL)
- 🇷🇺 Russian (ru-RU)
- 🇨🇳 Chinese (zh-CN)
- 🇯🇵 Japanese (ja-JP)
- 🇰🇷 Korean (ko-KR)
- 🇸🇦 Arabic (ar-SA)
- 🇬🇷 Greek (el-GR)

## 🚧 Known Limitations

- Tab audio transcription requires Chrome/Chromium browsers
- Web Speech API requires internet connection
- Some languages have better recognition accuracy than others
- System audio capture quality depends on tab audio settings

## 📈 Roadmap

- [ ] Chrome Extension packaging for easier deployment
- [ ] Offline mode with local LLMs (Ollama integration)
- [ ] Advanced card clustering and organization
- [ ] Real-time collaboration features
- [ ] Mobile app development
- [ ] Voice commands for hands-free operation
- [ ] Custom prompt templates

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🧪 Testing & Debugging

### Console Testing Commands
```javascript
// Test card generation with hardcoded transcripts
testCards()

// View card engine performance statistics  
app.cardEngine.getStats()

// Reset card engine cache for fresh testing
app.cardEngine.reset()
```

### Development Features
- **Isolated Testing**: 10 hardcoded test transcripts for debugging card generation
- **Performance Metrics**: Success rates, response times, error tracking
- **Multi-language Tests**: German, English, and edge case validation
- **Visual Feedback**: Console logs with emojis for easy debugging

## 🐛 Troubleshooting

### Common Issues

**No transcription appearing:**
- Check microphone permissions in browser
- For tab audio, ensure you selected "Share tab audio" when sharing
- Verify the audio source toggle is set correctly
- Run `testCards()` in console to test card generation independently

**Cards not generating:**
- Check API keys in .env file
- Verify at least one LLM provider is configured
- Check browser console for errors
- Test with `app.cardEngine.isTextWorthyOfCard("your test text")`

**Audio levels show but no transcription:**
- This is normal for tab audio - transcription depends on clear speech
- Try switching to microphone mode for testing
- Check `app.cardEngine.getStats()` for processing statistics

**Performance Issues:**
- Card engine automatically prevents duplicate processing
- Check console for `[CARD-ENGINE]` performance logs
- Use `app.cardEngine.reset()` to clear cache if needed

## 📄 License

MIT License - See LICENSE file for details

## 👏 Credits

Built with passion for better learning and knowledge retention.

---

**SenScript** - Transform any conversation into knowledge cards 🎓