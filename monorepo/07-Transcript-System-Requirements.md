# SenScript Transcript System - Detailed Requirements & Implementation

## 🎯 Core Objective
**Maximum speed in transcript processing and card generation from speech with sophisticated visual feedback and language handling**

## 📋 Functional Requirements

### 1. Language Handling
```javascript
// Language Detection & Management
{
  inputLanguage: {
    mode: "auto" | "manual",
    defaultLanguage: "en-US", // Standard default
    supportedLanguages: [
      "en-US", "de-DE", "fr-FR", "es-ES", 
      "it-IT", "pt-PT", "nl-NL", "ru-RU",
      "zh-CN", "ja-JP", "ko-KR", "ar-SA", "hi-IN"
    ]
  },
  
  autoDetection: {
    enabled: true, // Only in AUTO mode
    confidence_threshold: 70, // Minimum confidence for language switch
    debounce_time: 500 // ms before language switches
  },
  
  manualMode: {
    fixed_language: "user_selected", // User chooses once
    no_auto_switching: true, // Never changes automatically
    consistent_recognition: true // Maintains language throughout session
  }
}
```

#### Language Behavior:
- **AUTO Mode**: Continuously detects language, switches when confidence > 70%
- **Manual Mode**: User selects language once, system listens only for that language
- **Indicator**: Shows current listening language (🇺🇸 EN, 🇩🇪 DE, 🌐 AUTO)

### 2. Transcript Display Architecture

```
┌─────────────────────────────────────────┐
│ [🌐 AUTO] ← Language Indicator (clickable) │
├─────────────────────────────────────────┤
│ Previous sentences (faded, scrolled up) │ ← Font size: 12px, opacity: 0.5
│ Recent sentence (slightly faded)        │ ← Font size: 14px, opacity: 0.7  
│ → Current final sentence                │ ← Font size: 16px, opacity: 1.0
│ → Interim text (flickering...)         │ ← Font size: 16px, opacity: 0.6
└─────────────────────────────────────────┘
```

#### Visual Hierarchy:
1. **Three Font Sizes**: 12px (old) → 14px (recent) → 16px (current)
2. **Opacity Levels**: 0.5 (old) → 0.7 (recent) → 1.0 (current) → 0.6 (interim)
3. **Scroll Behavior**: New content pushes old content up automatically

### 3. Animation Effects

#### A. Horizontal Flip Animation (Interim Changes)
```css
/* When interim text changes */
.interim-text {
  animation: horizontalFlip 0.2s ease-in-out;
}

@keyframes horizontalFlip {
  0% { transform: scaleX(1); }
  50% { transform: scaleX(0.8); opacity: 0.3; }
  100% { transform: scaleX(1); opacity: 0.6; }
}
```

#### B. Slight Wobble Effect (Final Sentences)
```css
/* When sentence becomes final */
.final-sentence {
  animation: subtleWobble 0.3s ease-out;
}

@keyframes subtleWobble {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}
```

#### C. Fade-In Animation (Session Start)
```css
/* When transcription starts */
.transcript-buffer {
  animation: fadeInTranscript 0.8s ease-in;
}

@keyframes fadeInTranscript {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### 4. Text Processing Pipeline

```
Raw Speech → Speech Recognition → Text Chunks → Sentence Assembly → Language Detection → Card Generation Check → Display Update
```

#### Processing Stages:
1. **Speech Recognition**: Continuous with interim results
2. **Text Assembly**: Combine chunks into sentences 
3. **Language Detection**: Per-sentence analysis (if AUTO mode)
4. **Worthiness Check**: Determine if sentence should generate cards
5. **Card Generation**: Send worthy text to card system
6. **Display Update**: Render with animations and proper formatting

### 5. Card Generation Integration

#### Text Worthiness Criteria:
```javascript
const isWorthyOfCard = (text) => {
  // Length requirements
  if (text.length < 20) return false;
  if (text.split(' ').length < 5) return false;
  
  // Educational signals
  const educationalKeywords = [
    'what', 'how', 'why', 'define', 'explain', 
    'example', 'because', 'means', 'refers to',
    'was', 'wie', 'warum', 'bedeutet', 'beispiel'
  ];
  
  const hasEducationalContent = educationalKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  return hasEducationalContent;
};
```

#### Card Generation Flow:
1. **Text Analysis**: Check worthiness and extract key concepts
2. **Language Context**: Include detected language for proper card language
3. **Context Preservation**: Send surrounding text for better card quality
4. **API Optimization**: Batch similar requests, avoid duplicates

## 🏗️ Technical Implementation

### 1. Core Transcript Module Structure

```javascript
class TranscriptSystem {
  constructor(app) {
    this.app = app;
    this.state = {
      currentMode: 'auto', // 'auto' | 'manual'
      selectedLanguage: 'en-US',
      transcriptBuffer: [],
      interimText: '',
      finalizedSentences: [],
      lastLanguageDetection: null
    };
    
    this.ui = new TranscriptUI();
    this.languageDetector = new LanguageDetector();
    this.animationController = new TranscriptAnimations();
  }
  
  // Main processing entry point
  processIncomingSpeech(speechResult) {
    const { isFinal, transcript, confidence } = speechResult;
    
    if (isFinal) {
      this.handleFinalText(transcript);
    } else {
      this.handleInterimText(transcript);
    }
  }
  
  handleFinalText(text) {
    // 1. Add to finalized sentences
    this.state.finalizedSentences.push({
      text,
      timestamp: Date.now(),
      language: this.detectLanguage(text)
    });
    
    // 2. Check for card generation
    if (this.isWorthyOfCard(text)) {
      this.sendToCardGeneration(text);
    }
    
    // 3. Update display with wobble animation
    this.ui.addFinalSentence(text);
    this.animationController.triggerWobble();
  }
  
  handleInterimText(text) {
    // 1. Update interim state
    this.state.interimText = text;
    
    // 2. Update display with flip animation
    this.ui.updateInterimText(text);
    this.animationController.triggerFlip();
  }
}
```

### 2. Language Management

```javascript
class LanguageManager {
  constructor() {
    this.currentMode = 'auto';
    this.selectedLanguage = 'en-US';
    this.supportedLanguages = {
      'en-US': { flag: '🇺🇸', name: 'English', code: 'EN' },
      'de-DE': { flag: '🇩🇪', name: 'Deutsch', code: 'DE' },
      'fr-FR': { flag: '🇫🇷', name: 'Français', code: 'FR' },
      'es-ES': { flag: '🇪🇸', name: 'Español', code: 'ES' }
    };
  }
  
  setMode(mode) {
    this.currentMode = mode;
    if (mode === 'manual') {
      // Disable automatic language switching
      this.updateSpeechRecognitionLanguage(this.selectedLanguage);
    }
    this.updateUI();
  }
  
  selectLanguage(langCode) {
    this.selectedLanguage = langCode;
    if (this.currentMode === 'manual') {
      this.updateSpeechRecognitionLanguage(langCode);
    }
    this.updateUI();
  }
  
  updateUI() {
    const indicator = document.getElementById('languageIndicator');
    if (this.currentMode === 'auto') {
      indicator.innerHTML = '🌐 AUTO';
    } else {
      const lang = this.supportedLanguages[this.selectedLanguage];
      indicator.innerHTML = `${lang.flag} ${lang.code}`;
    }
  }
}
```

### 3. UI Animation Controller

```javascript
class TranscriptAnimations {
  triggerFlip() {
    const interimElement = document.querySelector('.interim-text');
    if (interimElement) {
      interimElement.classList.remove('flip-animation');
      // Force reflow
      interimElement.offsetHeight;
      interimElement.classList.add('flip-animation');
    }
  }
  
  triggerWobble() {
    const lastSentence = document.querySelector('.transcript-sentence:last-child');
    if (lastSentence) {
      lastSentence.classList.add('wobble-animation');
      setTimeout(() => {
        lastSentence.classList.remove('wobble-animation');
      }, 300);
    }
  }
  
  fadeInTranscript() {
    const transcriptContainer = document.querySelector('.transcript-container');
    transcriptContainer.classList.add('fade-in-animation');
  }
}
```

### 4. Performance Optimizations

#### API Call Management:
- **Debouncing**: Wait 500ms after final text before card generation
- **Deduplication**: Cache recent texts to avoid duplicate API calls  
- **Batching**: Group similar requests within 2-second windows
- **Quality Filtering**: Only send high-confidence, educational content

#### Memory Management:
- **Text Buffer Limit**: Keep only last 50 sentences in memory
- **Animation Cleanup**: Remove animation classes after completion
- **Event Debouncing**: Limit DOM updates to 60fps maximum

## 📊 User Experience Flow

### Session Start:
1. User clicks "Start" 
2. Transcript buffer fades in immediately
3. Language indicator shows current mode (🌐 AUTO or 🇺🇸 EN)
4. "Listening..." placeholder appears

### During Transcription:
1. Interim text appears at bottom with subtle opacity
2. Interim changes trigger horizontal flip animation
3. When text finalizes, wobble animation plays
4. Finalized text moves up, new interim text appears below
5. Old sentences fade and shrink as they scroll up

### Language Detection (AUTO mode only):
1. Each sentence analyzed for language
2. If confidence > 70% and different from current, switch language
3. Language indicator updates with new flag/code
4. Speech recognition language changes for next input

### Card Generation:
1. Final sentences checked for educational content
2. Worthy text sent to card generation system
3. Cards appear with proper language context
4. Original transcript text preserved for reference

## ⚡ Performance Targets

- **Transcript Latency**: < 100ms from speech recognition to display
- **Animation Performance**: Smooth 60fps animations
- **Memory Usage**: < 10MB for transcript buffer
- **API Efficiency**: < 5 duplicate requests per session
- **Language Switch Time**: < 500ms response time

## 🔧 Integration Points

### With Card System:
- Send worthy text with language context
- Include surrounding sentences for better context
- Avoid sending duplicate or low-quality content

### With Audio System:
- Receive speech recognition results
- Handle interim and final text separately
- Manage language switching for recognition

### With UI System:
- Update language indicators
- Handle mode switching (auto/manual)
- Manage dropdown interactions

## 🚀 Implementation Priority

1. **Phase 1**: Core transcript processing and display
2. **Phase 2**: Language detection and switching
3. **Phase 3**: Animation effects and visual polish  
4. **Phase 4**: Performance optimization and API efficiency
5. **Phase 5**: Advanced features and edge case handling

---

This document serves as the complete specification for the SenScript transcript system, focusing on maximum speed, sophisticated visuals, and intelligent language handling.