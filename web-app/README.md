# SenScript Chrome Web App - Testing Instructions

## 🧪 Testing the Web App

### 1. Start the Development Server
```bash
npm run dev:web
```

### 2. Open in Chrome
- Navigate to `http://localhost:3000`
- **IMPORTANT**: Must use Chrome (or Chromium-based browser)
- Other browsers may not support Web Speech API

### 3. Grant Permissions
1. Click "Start" button
2. Allow microphone access when prompted
3. Verify status indicators show:
   - Speech: ● (green)
   - AI: ● (green) 
   - Mic: ● (green)

### 4. Test Transcription
1. Speak clearly into your microphone
2. Watch live transcript appear in the subtitle area
3. Observe AI-generated flashcards appearing below
4. Test the export functionality

### 🎯 Expected Behavior

**Recording State:**
- Status dot pulses red when recording
- "Recording..." appears in header
- Stop button shows instead of Start

**Transcript Display:**
- Live text appears in dark subtitle-style box
- Text flows naturally in 2-line format
- Previous line dims as new text appears

**Flashcard Generation:**
- Mock cards appear after ~20 characters of transcript
- Cards show in bottom section with categories
- Export button becomes enabled

### 🚨 Troubleshooting

**No Audio Detected:**
- Check microphone permissions in Chrome settings
- Verify microphone is working in system settings
- Ensure Chrome has microphone access

**Speech Recognition Errors:**
- Check browser console (F12) for detailed error messages
- Verify internet connection (speech service needs network)
- Try refreshing the page and granting permissions again

**Visual Issues:**
- The popup should appear as a transparent overlay
- If styling looks wrong, check browser supports backdrop-filter

### 🔧 Development Notes

This is a **proof of concept** web app that demonstrates:
- ✅ Browser-native speech recognition
- ✅ Real-time transcript display
- ✅ Mock AI card generation
- ✅ Transparent popup UI
- ✅ Status monitoring

**Next Steps:**
1. Convert to Chrome Extension
2. Add real OpenAI API integration
3. Add conferencing service detection
4. Implement advanced card generation