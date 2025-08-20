# SenScript - Product Requirements Document (PRD)

## Executive Summary

**Product Name:** SenScript - AI-Powered Real-Time Flashcard Generator  
**Version:** 3.0 (Chrome Web App)  
**Platform:** Web-based application with Chrome extension capabilities  
**Primary Goal:** Maximum speed in generating educational flashcards from live speech input  

**Core Value Proposition:** Transform live conversations, lectures, and meetings into instant educational flashcards using AI, with specialized modes for learning and interview preparation.

---

## 1. Product Overview

### 1.1 Mission Statement
SenScript prioritizes **maximum card creation speed** over perfect accuracy, enabling real-time learning and knowledge capture during live conversations, lectures, meetings, and presentations.

### 1.2 Target Users
- **Students** - Live lecture note-taking and study material generation
- **Professionals** - Meeting knowledge extraction and interview preparation
- **Language Learners** - Real-time vocabulary and concept capture
- **Researchers** - Conference and presentation content extraction

### 1.3 Key Innovation
Universal audio capture strategy that works with ANY application (Teams, Zoom, Slack, Discord, phone calls) without platform-specific integrations.

---

## 2. Technical Architecture

### 2.1 Core Technology Stack

#### **Frontend (Chrome Web App)**
```javascript
// Core Technologies
- HTML5 + CSS3 (Glass Morphism UI Design)
- Vanilla JavaScript (ES6+)
- Web Speech Recognition API (webkitSpeechRecognition)
- Web Audio API (AudioContext, AnalyserNode)
- LocalStorage for persistent settings

// UI Framework
- Custom CSS with Glass Morphism design system
- Responsive design (mobile-first approach)
- Real-time audio visualization
- Modal-based settings management
```

#### **Backend (Node.js Server)**
```javascript
// Server Stack
- Node.js + HTTP server
- Express-like routing (custom implementation)
- CORS enabled for cross-origin requests
- Real-time API endpoints

// Dependencies
- dotenv: Environment variable management
- better-sqlite3: Local database (optional)
- Various LLM provider SDKs
```

#### **AI Integration Layer**
```javascript
// LLM Providers (Multi-provider support)
- OpenAI GPT (3.5-turbo, 4o-mini, 4o)
- Anthropic Claude (3 Haiku, 3.5 Sonnet)
- DeepSeek (Chat, Coder models)

// Conversation Management
- Context retention across sessions
- Education level adaptation
- Interview mode specialized prompts
```

### 2.2 Key Architecture Components

#### **LLM Conversation Manager (llm-conversation.js)**
**Critical Component - Essential for Multi-Platform Rebuild**

```javascript
class LLMConversation {
    // Core Features
    - Multi-provider LLM support with failover
    - Conversation context retention (reduces API costs by 90%+)
    - Education level adaptation (5 levels)
    - Interview mode with specialized prompts
    - Language detection and response in same language
    - Token optimization and cost management
    
    // Key Methods
    - processTranscript(sessionId, transcript, language, languageFlag, outputLanguage, interviewMode)
    - createNewConversation(language, interviewMode)
    - updateEducationSettings(sessionId, newSettings)
    - selectOptimalProvider() // Auto-selects fastest provider
    
    // Provider Integration
    - OpenAI Chat Completions API
    - Anthropic Messages API  
    - DeepSeek Chat API
    - Automatic JSON parsing with error handling
    - Response time tracking and provider optimization
}
```

#### **Audio Processing Pipeline**
```javascript
// Universal Audio Capture
1. Microphone Input: getUserMedia() → AudioContext → AnalyserNode
2. System Audio: getDisplayMedia({audio: true}) → Screen capture with audio
3. Real-time Processing: webkitSpeechRecognition continuous mode
4. Audio Visualization: Real-time level meters and frequency analysis

// Speech Recognition Configuration
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'auto-detect'; // Supports 13 languages
recognition.maxAlternatives = 1;
```

#### **Language Detection System**
```javascript
// Supported Languages (13 total)
const SUPPORTED_LANGUAGES = {
    'de-DE': '🇩🇪 German',
    'en-US': '🇺🇸 English', 
    'fr-FR': '🇫🇷 French',
    'es-ES': '🇪🇸 Spanish',
    'it-IT': '🇮🇹 Italian',
    'pt-PT': '🇵🇹 Portuguese',
    'nl-NL': '🇳🇱 Dutch',
    'ru-RU': '🇷🇺 Russian',
    'zh-CN': '🇨🇳 Chinese',
    'ja-JP': '🇯🇵 Japanese',
    'ko-KR': '🇰🇷 Korean',
    'ar-SA': '🇸🇦 Arabic',
    'el-GR': '🇬🇷 Greek'
};

// Auto-detection with confidence scoring
// Pattern-based language identification
// User override with fixed output language option
```

---

## 3. Feature Specifications

### 3.1 Core Features

#### **Real-Time Speech-to-Text**
- **Technology:** Chrome Web Speech API (webkitSpeechRecognition)
- **Mode:** Continuous listening with interim results
- **Languages:** 13 supported languages with auto-detection
- **Audio Sources:** 
  - Microphone input (user speech)
  - System audio capture (meetings, calls, presentations)
- **Visualization:** Real-time audio level meters and waveform display

#### **AI Flashcard Generation**
- **Processing Speed:** Optimized for sub-3-second card generation
- **Card Structure:** Front (question/concept) + Back (answer/explanation) + Source link
- **Content Types:** 
  - Standard Mode: How-To, Why, Key Insight, Definition, Example
  - Interview Mode: Interview Tip, Key Facts, What to Say, Avoid This, Quick Win
- **Quality Control:** Educational worthiness filtering and duplicate detection

#### **Multi-Provider LLM Integration**
```javascript
// Provider Configuration
const PROVIDERS = {
    openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        models: ['gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o'],
        maxTokens: 300,
        temperature: 0.5
    },
    anthropic: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        models: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022'],
        maxTokens: 300,
        temperature: 0.5
    },
    deepseek: {
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        models: ['deepseek-chat', 'deepseek-coder'],
        maxTokens: 300,
        temperature: 0.5
    }
};
```

### 3.2 Advanced Features

#### **Interview Test Companion Mode**
- **Purpose:** Strategic flashcard generation for job interviews and exams
- **Content Style:** 
  - Quick facts to impress interviewers
  - What to say vs. what NOT to say
  - Key talking points for any topic
  - Test-passing strategies
- **Auto-Configuration:** Automatically adjusts education settings for optimal results
- **Categories:** Interview Tip, Key Facts, What to Say, Avoid This, Quick Win

#### **Education Level Adaptation**
```javascript
// Five-Level Education System
const EDUCATION_LEVELS = {
    userLevel: {
        1: "complete beginner with no prior knowledge",
        2: "basic learner with minimal background", 
        3: "general audience with some education",
        4: "advanced student with good background",
        5: "expert/professional with deep knowledge"
    },
    detailLevel: {
        1: "very brief, one-sentence explanations",
        2: "concise explanations with key points only", 
        3: "moderate detail with context and examples",
        4: "detailed explanations with multiple aspects",
        5: "comprehensive coverage with nuances and edge cases"
    },
    exampleComplexity: {
        1: "everyday analogies and simple comparisons",
        2: "basic real-world examples everyone knows",
        3: "practical examples from common experience", 
        4: "technical examples with some complexity",
        5: "academic examples with precise terminology"
    }
};
```

#### **Real-Time Transcript Processing**
- **Display Strategy:** Three-line rolling transcript with 5-second expiration
- **Text Processing:** Smart sentence segmentation and readability enhancement
- **Language Mixing:** Handles multilingual conversations
- **Cleanup:** Filters out non-educational content (greetings, fillers, incomplete thoughts)

---

## 4. User Interface Specifications

### 4.1 Design System

#### **Glass Morphism Theme**
```css
/* Core Visual Style */
.glass-light {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(31, 41, 55, 0.1);
    border-radius: 16px;
}

.glass-dark {
    background: rgba(31, 41, 55, 0.85);
    backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
}

/* Brand Colors */
:root {
    --primary-orange: #f97316;
    --primary-orange-hover: #ea580c;
    --glass-white: rgba(255, 255, 255, 0.85);
    --glass-dark: rgba(31, 41, 55, 0.85);
}
```

#### **Component Layout**
- **Header:** Logo, language indicator, theme toggle, settings
- **Main Area:** Audio source toggle, start/stop controls, transcript display
- **Card Container:** AI-generated flashcards with real-time updates
- **Footer:** Export controls, usage statistics
- **Settings Modal:** Comprehensive configuration with tabbed interface

#### **Mobile Responsiveness**
- **Breakpoints:** 768px, 1024px, 1200px
- **Mobile Navigation:** Collapsible header with touch-optimized controls
- **Touch Interface:** Large buttons, swipe gestures, mobile-first audio controls

### 4.2 User Experience Flow

#### **Standard Usage Flow**
1. **Landing:** User opens app, sees audio source selection (mic/system)
2. **Permission:** Browser requests microphone/screen share permissions
3. **Configuration:** Optional settings adjustment (education level, interview mode, etc.)
4. **Recording:** Click start → real-time audio visualization begins
5. **Transcription:** Live transcript appears in rolling 3-line display
6. **Card Generation:** AI creates flashcards in real-time (2-5 second delay)
7. **Review:** Cards accumulate in scrollable container with export options

#### **Settings Configuration**
```javascript
// Settings Categories
const SETTINGS_TABS = {
    'API Keys': {
        - OpenAI API Key
        - Anthropic API Key  
        - DeepSeek API Key
        - Auto-fallback toggle
    },
    'Education': {
        - User knowledge level (1-5 slider)
        - Detail preference (1-5 slider)
        - Example complexity (1-5 slider)
        - Interview Test Companion mode toggle
    },
    'Language': {
        - Auto-detection toggle
        - Fixed output language selector
        - 13 language support
    },
    'Advanced': {
        - Model selection per provider
        - Usage statistics display
        - Export format options
        - Debug logging toggle
    }
};
```

---

## 5. Data Management

### 5.1 Settings Storage
```javascript
// LocalStorage Schema
const SETTINGS_SCHEMA = {
    senscript_settings: {
        apiKeys: {
            openai: string,
            anthropic: string,
            deepseek: string
        },
        education: {
            userLevel: number(1-5),
            detailLevel: number(1-5),
            exampleComplexity: number(1-5)
        },
        outputLanguage: {
            auto: boolean,
            fixed: string // language code
        },
        interviewMode: boolean,
        selectedModel: string, // 'auto' or 'provider:model'
        useFallback: boolean,
        theme: string // 'light', 'dark', 'system'
    }
};
```

### 5.2 Session Management
```javascript
// In-Memory Session Data
const SESSION_DATA = {
    sessionId: string, // UUID for each session
    cards: Array<FlashCard>,
    transcript: Array<TranscriptSegment>,
    audioMetrics: {
        inputLevel: number,
        isConnected: boolean,
        deviceInfo: string
    },
    apiUsage: {
        totalCalls: number,
        totalTokens: number,
        provider: string,
        responseTime: number
    }
};
```

### 5.3 Card Data Structure
```javascript
// FlashCard Schema
interface FlashCard {
    id: string,
    category: string, // Based on mode (standard/interview)
    front: string, // Question or concept (max 1 line)
    back: string, // Answer or explanation (max 4 lines)
    source: {
        title: string, // Wikipedia title or search term
        type: 'wikipedia' | 'search'
    },
    language: string, // Language code
    flag: string, // Language flag emoji
    time: string, // Creation timestamp
    confidence: number, // AI confidence (0-100)
    originalTranscript: string // Source text
}
```

---

## 6. API Integration

### 6.1 Server Endpoints
```javascript
// HTTP API Routes
const API_ENDPOINTS = {
    // Card generation
    'POST /api/generate-card': {
        input: { sessionId, transcript, language, languageFlag },
        output: { success, card?: FlashCard, skip?: boolean }
    },
    
    // Settings management
    'POST /api/settings': {
        input: { sessionId, apiKeys, education, outputLanguage, interviewMode },
        output: { success, settings }
    },
    
    // Usage statistics
    'GET /api/usage': {
        query: { sessionId },
        output: { global, session, conversation, providers }
    },
    
    // Available models
    'GET /api/models': {
        output: { openai: Model[], anthropic: Model[], deepseek: Model[] }
    },
    
    // System audio transcription (future)
    'POST /api/transcribe-system-audio': {
        input: FormData, // Audio file
        output: { success, text?, message? }
    }
};
```

### 6.2 LLM Provider Integration
```javascript
// Provider-Specific Implementations
const PROVIDER_CONFIGS = {
    openai: {
        authHeader: 'Authorization: Bearer ${apiKey}',
        requestFormat: 'OpenAI Chat Completions',
        responseField: 'choices[0].message.content'
    },
    anthropic: {
        authHeader: 'x-api-key: ${apiKey}',
        requestFormat: 'Anthropic Messages',
        responseField: 'content[0].text',
        systemPromptSeparate: true
    },
    deepseek: {
        authHeader: 'Authorization: Bearer ${apiKey}',
        requestFormat: 'OpenAI-Compatible',
        responseField: 'choices[0].message.content'
    }
};
```

---

## 7. Performance Optimization

### 7.1 Speed Optimization Settings
```javascript
// Performance-First Configuration
const PERFORMANCE_CONFIG = {
    PRIORITY: "MAXIMUM_CARD_CREATION_SPEED",
    
    // Aggressive splitting for faster processing
    SPLITTING: {
        MIN_LENGTH_FOR_COMMA_SPLIT: 25, // Reduced from 30
        MIN_LENGTH_FOR_CONJUNCTION_SPLIT: 30, // Reduced from 35  
        MAX_LENGTH_BEFORE_FORCE_SPLIT: 40, // Reduced from 45
        ENABLE_REALTIME_SPLITTING: true
    },
    
    // Relaxed worthiness for more cards
    WORTHINESS: {
        MIN_TEXT_LENGTH: 15, // Reduced from 20
        STRICT_MODE: false,
        MIN_EXPLANATION_LENGTH: 25, // Reduced from 40
    },
    
    // Fast API configuration
    API: {
        CARD_GENERATION_TIMEOUT_MS: 8000, // Reduced from 10000
        RETRY_ATTEMPTS: 1, // Reduced from 3
        BATCHING_ENABLED: false // Individual requests faster
    }
};
```

### 7.2 Memory Management
- **Conversation Context:** Limited to last 10 exchanges per session
- **Card Storage:** In-memory with localStorage backup
- **Audio Buffers:** Real-time processing with minimal buffering
- **UI Updates:** Throttled at 100ms intervals for smooth performance

---

## 8. Multi-Platform Rebuild Guidelines

### 8.1 Essential Components for Porting

#### **Must-Have Core Components:**
1. **LLM Conversation Manager** - Absolutely critical, contains all AI logic
2. **Language Detection System** - 13-language support with pattern matching
3. **Audio Processing Pipeline** - Platform-specific audio capture + Web Speech API equivalent
4. **Settings Management** - Education levels, provider configs, user preferences
5. **Card Generation Logic** - Interview mode, standard mode, categorization

#### **Platform-Specific Adaptations:**

**Mobile (React Native / Flutter):**
```javascript
// Audio Capture Adaptations
- Replace getUserMedia() with react-native-audio-recorder
- Replace getDisplayMedia() with screen recording APIs
- Maintain Web Speech API equivalent or use cloud speech services

// Storage Adaptations  
- Replace localStorage with AsyncStorage (React Native) or SharedPreferences (Flutter)
- Maintain same settings schema structure
```

**Desktop (Electron / Tauri):**
```javascript
// System Audio Capture
- Implement system-wide audio routing (like OBS/Loopback)
- Universal app compatibility (not just web browsers)
- Native file system access for better export options

// Enhanced Permissions
- System-level audio permissions
- Background processing capabilities
- Native notifications for card generation
```

**Backend Deployment:**
```javascript
// Production Server Requirements
- Node.js runtime environment
- Environment variables for API keys
- CORS configuration for web app access  
- Rate limiting and API key management
- Usage analytics and monitoring
```

### 8.2 Critical Configuration Files

**Essential Files to Port:**
- `llm-conversation.js` - Core AI conversation management
- `llm-providers.js` - Multi-provider LLM integration
- `settings-config.js` - Performance and feature configuration
- Language detection patterns and scoring algorithms
- Education level prompt templates

**Platform Adaptation Strategy:**
1. **Audio Layer:** Platform-specific audio capture implementation
2. **Storage Layer:** Platform-appropriate persistent storage
3. **UI Layer:** Native UI components following platform guidelines
4. **AI Layer:** Direct port of LLM conversation system (unchanged)
5. **Settings Layer:** Same configuration structure, different persistence method

---

## 9. Deployment and Infrastructure

### 9.1 Current Deployment (Web App)
```bash
# Development
npm run dev:web         # Local development server
node server.js          # Backend API server (port 3002)

# Production
npm run build:extension # Chrome extension build
npm run package:store   # Chrome Web Store package
```

### 9.2 Environment Configuration
```bash
# Required Environment Variables
OPENAI_API_KEY=sk-...           # OpenAI API access
ANTHROPIC_API_KEY=sk-ant-...    # Claude API access  
DEEPSEEK_API_KEY=sk-...         # DeepSeek API access
FALLBACK_OPENAI_KEY=sk-...      # Fallback API key
FALLBACK_ANTHROPIC_KEY=sk-...   # Fallback API key
FALLBACK_DEEPSEEK_KEY=sk-...    # Fallback API key
PORT=3002                       # Server port
```

### 9.3 Chrome Extension Deployment
```json
// manifest.json requirements
{
    "manifest_version": 3,
    "permissions": [
        "activeTab",
        "microphone", 
        "desktopCapture",
        "storage"
    ],
    "background": {
        "service_worker": "background.js"
    },
    "content_scripts": [{
        "matches": ["*://*/*"],
        "js": ["content.js"]
    }]
}
```

---

## 10. Quality Assurance

### 10.1 Testing Requirements
- **Audio Processing:** Test across different microphone types and system configurations
- **Speech Recognition:** Verify accuracy across all 13 supported languages
- **AI Generation:** Validate card quality and educational value
- **Cross-Browser:** Chrome (primary), Firefox, Safari, Edge compatibility
- **Mobile Responsiveness:** Touch interface and mobile audio handling
- **Performance:** Card generation speed under 3 seconds consistently

### 10.2 Success Metrics
- **Primary KPI:** Average card generation time < 3 seconds
- **Quality KPI:** >80% of generated cards provide educational value
- **User Experience:** >90% successful audio capture on first attempt
- **Language Support:** Accurate detection across all 13 languages
- **Interview Mode:** Specialized content relevance >85%

---

## 11. Future Roadmap

### 11.1 Short-term Enhancements (Next 3 months)
- Chrome Web Store publication
- Advanced export formats (Anki, Quizlet, Notion)
- Team collaboration features
- Enhanced audio processing (noise reduction, speaker separation)

### 11.2 Long-term Vision (6-12 months)
- Native mobile applications (iOS, Android)
- Desktop applications (Windows, macOS, Linux)
- API-based integrations with learning platforms
- Advanced analytics and learning insights
- Multi-modal input (video, documents, images)

---

## 12. Conclusion

SenScript represents a breakthrough in real-time learning technology, combining universal audio capture, advanced AI processing, and optimized user experience to create educational content at unprecedented speed. The modular architecture centered around the LLM Conversation Manager enables efficient porting to any platform while maintaining core functionality.

**Key Success Factors:**
1. **Speed-First Architecture** - Every component optimized for fast card generation
2. **Universal Compatibility** - Works with any audio source or application
3. **AI-Powered Intelligence** - Context-aware educational content generation  
4. **Platform Agnostic Design** - Core logic easily portable across platforms
5. **User-Centric Experience** - Intuitive interface with powerful customization

The comprehensive technical documentation and modular design ensure successful implementation across web, mobile, and desktop platforms while maintaining the core mission of maximum-speed educational content generation.

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Production Ready - Web App Complete