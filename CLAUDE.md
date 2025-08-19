# SenScript - Chrome Web App for Universal Conferencing

## Chrome Web App Concept (v3.0)
SenScript is now a Chrome-based application that works seamlessly with any web conferencing service through browser-native speech recognition and transparent overlay UI.

## Why Chrome Instead of Electron?
- **Web Speech API Works Perfectly**: No compatibility issues or permission problems
- **Universal Conferencing Support**: Works with Teams, Zoom, Slack, Meet, WebEx, and any web-based service
- **Better Performance**: Direct browser integration without Electron overhead
- **Easier Deployment**: Chrome Web Store distribution vs complex app packaging
- **Cross-Platform**: Works on any OS that runs Chrome

## Core Architecture

### Extension Mode (Recommended)
```
Chrome Extension
├── Background Script → Manages permissions & storage
├── Content Scripts → Inject into conferencing tabs
├── Popup UI → Compact floating interface
└── Options Page → Settings and preferences
```

### Web App Mode (Development)
```
Standalone Web App
├── Service Worker → Offline functionality
├── Web Speech API → Direct microphone access
├── Transparent Popup → Floating overlay window
└── Local Storage → Card persistence
```

## Interface Design

### Transparent Popup Overlay
```
┌──────────────────────────────┐
│ ● Live Recording             │ ← Minimal header
├──────────────────────────────┤
│ "How does machine learning   │ ← Subtitle-style
│  work in practice?"          │   live transcript
├──────────────────────────────┤
│ [Card 1] [Card 2] [Card 3]   │ ← AI-generated
│ ┌─────────┐ ┌─────────┐      │   flashcards
│ │ML Basics│ │Training │      │
│ └─────────┘ └─────────┘      │
├──────────────────────────────┤
│ ● Speech ● AI ● Export       │ ← Status indicators
└──────────────────────────────┘
```

## Universal Audio Capture Strategy

### Revolutionary Concept: No App-Specific Integrations Needed!
Instead of building integrations for Teams, Zoom, Slack, etc., we use **universal audio capture**:

**Two Audio Sources:**
- **🎤 Microphone Input**: Capture your voice (current implementation)  
- **🔊 System Audio**: Capture computer's audio output (all apps at once)

**Why This Is Game-Changing:**
- ✅ **Works with ANY app**: Teams, Zoom, Slack, Discord, WhatsApp, phone calls
- ✅ **No integrations needed**: Zero development for each platform
- ✅ **Future-proof**: Works with new apps automatically
- ✅ **Desktop & mobile**: Same concept works everywhere
- ✅ **Privacy-first**: No app-specific permissions or API access needed

### Implementation Approaches

**Browser-Based (Current):**
- Web Speech API for microphone input
- Chrome extension with tab audio capture
- Works with web-based conferencing

**Desktop App (Future):**
- System-level audio routing (like OBS or Loopback)
- Capture system audio + microphone simultaneously
- Works with ANY desktop application

### Audio Processing Pipeline
1. **Universal Capture**: System audio OR microphone input
2. **Speech Recognition**: Browser `webkitSpeechRecognition` or Whisper API
3. **Real-time Processing**: Stream transcript to AI analysis
4. **Card Generation**: OpenAI API creates educational flashcards
5. **Export**: Save in Anki, CSV, JSON formats

## Technical Implementation

### Chrome Extension Structure
```
manifest.json           # Extension configuration
background.js           # Service worker for permissions
content/
  ├── teams.js         # Teams integration
  ├── zoom.js          # Zoom integration
  └── universal.js     # Generic conferencing
popup/
  ├── index.html       # Extension popup
  ├── app.js           # React app bundle
  └── styles.css       # Transparent styling
options/
  ├── settings.html    # Options page
  └── config.js        # User preferences
```

### Web Speech API Configuration
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';
recognition.maxAlternatives = 1;
```

## Development Workflow

### Phase 1: Basic Web App
1. Create transparent popup with mic input
2. Implement Web Speech API transcription
3. Test in Chrome browser with localhost
4. Verify audio processing works reliably

### Phase 2: Chrome Extension
1. Convert web app to extension popup
2. Add content scripts for conferencing sites
3. Implement cross-tab communication
4. Add extension permissions and manifest

### Phase 3: Conferencing Integration
1. Detect when user joins meetings
2. Auto-activate recording with permission
3. Integrate with conferencing controls
4. Add meeting-specific features

## Key Advantages

- **Zero Installation Friction**: Just add to Chrome
- **Perfect Audio**: Native browser speech recognition
- **Universal Compatibility**: Works with any web conference
- **Privacy First**: All processing in browser
- **Easy Updates**: Chrome Web Store auto-updates
- **Cross-Platform**: Works on Windows, Mac, Linux

## Dev Commands (Updated)
- `npm run dev:web` - Development web app
- `npm run dev:extension` - Development extension  
- `npm run build:extension` - Build for Chrome
- `npm run package:store` - Package for Web Store

## Environment Variables
```
OPENAI_API_KEY=sk-...           # For AI card generation
CHROME_EXTENSION_ID=abc123...   # For extension development
```

⸻

## Legacy Documentation (v1.0)
Previous concept focused on meeting cards and transcript processing:

Non-goals (MVP):
	•	No video recording/streaming
	•	No team knowledge base; only local archive
	•	No mobile app

⸻

2) User Stories (MVP)
	1.	As a participant, I open SenScript, pin a slim strip (horizontal header bar or vertical sidebar) on my screen or another desktop space.
	2.	While the meeting runs, SenScript listens to LTT/transcript events and generates cards:
	•	Fakt (Fact) — concrete data points
	•	To-Do (Action Item) — owner + due (if detected)
	•	Zitat (Quote) — direct short quote w/ timestamp
	•	Definition/Kontext (Definition/Context) — background info
	3.	I glance at the 2-line teaser; click to expand for a compact summary + source quote + link to timestamp (if supported by provider).
	4.	After the meeting, I search/filter local cards, export selected cards to Clipboard/Markdown (Phase 1.5).
	5.	Optionally, SenScript backfills/enriches cards from Fireflies (if same meeting is found).

⸻

3) UI / UX Spec

3.1 Strip Layout
	•	Modes: horizontal (dock to top/bottom) and vertical (dock left/right)
	•	Always-on-top: yes (toggle)
	•	Resizable & draggable: yes
	•	Density: compact by default (cards collapsed)

┌──────────────────────────────────────────────────────────┐
│  [logo.svg] SenScript       • Live   • EN/DE   • ⌘K      │  ← horizontal strip
│  ───────────────────────────────────────────────────────  │
│  [Fact]  Title…  teaser line 1 …                         │
│  [To-Do] Title…  teaser line 1 …                         │  ← cards stack upward
│  [Quote] Title…  teaser line 1 …                         │
└──────────────────────────────────────────────────────────┘

	•	Card preview (collapsed):
	•	Badge (type icon + color)
	•	Title (concise)
	•	Teaser (2 lines, ellipsized)
	•	Card expanded:
	•	Title + type + timestamp
	•	Summary (3–6 bullet lines or short paragraph)
	•	Source snippet (≤ 180 chars) with speaker + T
	•	Actions: Copy, Star, Tag, Open Source (if provider link), Delete

3.2 Tailwind & Branding
	•	Tailwind already configured. Use neutral/stone palette + minimal accent.
	•	logo.svg: 16–20px height, placed left in the strip; SenScript name right to it.
	•	Type badges (default palette suggestions):
	•	Fact: bg-blue-100 text-blue-700
	•	To-Do: bg-rose-100 text-rose-700
	•	Quote: bg-gray-100 text-gray-700
	•	Definition/Context: bg-emerald-100 text-emerald-700

⸻

4) Architecture
	•	Electron (main): window management, deep-link, always-on-top, system perms
	•	Renderer (React + Tailwind): strip UI, card feed, controls
	•	Background worker: transcript ingestion, card engine (LLM prompts), de-dupe
	•	Local DB: SQLite (via better-sqlite3) for cards, meetings, settings
	•	Providers:
	•	Zoom Video SDK LTT: subscribe to live transcript events (preferred)
	•	Fireflies API/Webhook: resolve meeting by calendar/title/time → pull transcript or accept webhook → enrichment/backfill

4.1 Data Flow (Live)
	1.	Meeting starts → Zoom LTT events stream text chunks (+ speaker/time).
	2.	Chunk buffer (2–5 s) → normalization (punctuation, diarization label) → Card Engine.
	3.	Card Engine classifies & emits 0..n cards (w/ dedup & merge rules).
	4.	Renderer subscribes → shows collapsed cards → stack grows bottom→up.
	5.	Optional: Fireflies availability → enrich with post-meeting improvements.

⸻

5) Data Model (TypeScript)

export type CardType = "fact" | "todo" | "quote" | "definition" | "context";

export interface TranscriptChunk {
  provider: "zoomLTT" | "fireflies";
  meetingId: string;
  startMs: number;
  endMs: number;
  speaker?: string;
  text: string;
  lang?: string; // e.g., "en", "de"
}

export interface Card {
  id: string;
  meetingId: string;
  type: CardType;
  title: string;          // short, crisp
  teaser: string;         // 2 lines max (~140–180 chars)
  summary?: string;       // expanded view content
  quote?: {
    text: string;         // ≤180 chars
    speaker?: string;
    tsMs?: number;
  };
  tags?: string[];
  confidence?: number;    // 0..1
  createdAt: number;
  sourceRefs: { provider: string; chunkIds: string[] }[];
  starred?: boolean;
}

Indexes: meetingId, createdAt DESC, type

⸻

6) AI: Prompting & Rules

System prompt (card engine):
	•	You transform streaming transcript chunks into concise, useful cards for live consumption.
	•	Categories: fact, todo, quote, definition, context.
	•	Always propose a short title and a 2-line teaser.
	•	quote must be short, verbatim (trim filler).
	•	todo must include owner (if inferable) and due (if explicit).
	•	Avoid duplicates; merge if a newer chunk clarifies the same item.
	•	Prefer precision over length; no speculation.

Extraction prompt (per chunk/window):

You will receive a transcript window with speaker attributions and timestamps.
Return 0..n JSON cards following this schema:
{ type, title, teaser, summary?, quote?, tags?, confidence }

Rules:
- teaser <= 2 lines; make it scannable.
- Include a short quote ONLY if it clarifies attribution.
- If the chunk is trivial (“hello”, “next slide”), return [].
- If an earlier card exists for the same topic, produce an updated card and mark `confidence`.
Language: keep the meeting language (en or de).

Merging heuristic (pseudo):
	•	Key = normalized(title) + type
	•	If edit distance < threshold OR high overlap in named entities → update card (bump summary/quote)

⸻

7) Providers

7.1 Zoom Video SDK LTT (MVP live)
	•	Subscribe to LTT events (JSON) → feed TranscriptChunk
	•	Map language, speaker, timestamps
	•	Handle reconnect / meeting id correlation
	•	Settings:
	•	Toggle: Use Zoom LTT
	•	Language auto / force DE / force EN

7.2 Fireflies (enrichment & fallback)
	•	Resolve meeting by calendar/time/title
	•	Pull transcript (post-meeting) or accept webhook
	•	Compare coverage vs. LTT; add missing snippets as context/quote cards
	•	Settings:
	•	Toggle: Use Fireflies enrichment
	•	API key

.env (example):

Z00M_SDK_KEY=...
Z00M_SDK_SECRET=...
FIREFLIES_API_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...


⸻

8) Electron / React scaffolding (outline)

Electron main (outline):

// main.ts
createWindow({
  width: 420, height: 720,
  alwaysOnTop: true, frame: false, transparent: true,
});
ipcMain.handle("set-dock-mode", (_e, mode: "vertical"|"horizontal") => {/* resize, snap */});

Renderer entry:

// App.tsx
<StripShell mode={mode}>
  <BrandBar>
    <img src="logo.svg" className="h-4 w-auto" />
    <span className="ml-2 font-medium tracking-wide">SenScript</span>
    <LivePill /> <LangSwitch /> <SearchHotkey />
  </BrandBar>

  <CardFeed cards={cards} onExpand={...} onStar={...} />
</StripShell>

Tailwind hints:

<div className="bg-white/85 dark:bg-neutral-900/85 backdrop-blur
                 shadow-xl ring-1 ring-black/5 rounded-2xl
                 w-[380px] h-[680px] p-2 select-none">


⸻

9) Settings & Controls
	•	Mode: horizontal / vertical
	•	Pin: always on top (toggle)
	•	Opacity: 70–100%
	•	Language: auto / en / de
	•	Providers: Zoom LTT on/off; Fireflies on/off
	•	Privacy: local-only storage toggle; retention (e.g., 30/90 days)

⸻

10) Privacy / Security
	•	Local-first: All cards stored locally (SQLite).
	•	No raw audio capture in MVP; only text from providers.
	•	Configurable retention; one-click purge.
	•	Do not call external LLMs with PII unless user enables it (setting + redaction in future).

⸻

11) Error Handling & Edge Cases
	•	No transcript incoming: show subtle banner “Waiting for live transcript…”
	•	Rapid speaker switches / overlaps: throttle windows (2–5 s) before cardization
	•	Duplicate facts: merge strategy + confidence bump
	•	Network hiccups: exponential backoff, offline toast
	•	Language switches EN/DE: keep card language consistent with chunk language

⸻

12) Acceptance Criteria (MVP)
	•	SenScript strip opens on macOS, draggable, resizable, always-on-top
	•	Logo visible small; SenScript brand text visible in brand bar
	•	Connects to Zoom LTT, shows incoming transcript (dev console)
	•	Card Engine generates at least 4 types: fact, todo, quote, definition/context
	•	Cards stack bottom→top; expand reveals summary + quote + timestamp
	•	Toggle vertical/horizontal modes works
	•	Local DB persists cards; search by keyword/type works
	•	Optional: Fireflies enrichment can import post-meeting transcript and produce new/updated cards

⸻

13) Dev Plan / Tasks

Sprint 1 – Shell & Streams
	•	Electron shell + strip modes + branding
	•	Provider adapters: Zoom LTT → TranscriptChunk
	•	Minimal renderer feed (raw text list)

Sprint 2 – Card Engine
	•	Prompt templates & LLM client
	•	Classification & 2-line teaser generation
	•	Merge/dedupe + confidence logic
	•	UI: collapsed/expanded card, type badges

Sprint 3 – Persist & Enrich
	•	SQLite models & repository
	•	Search/filter UI
	•	Fireflies adapter (pull or webhook)
	•	Export selected cards (Clipboard/Markdown)

Sprint 4 – Polish
	•	Settings panel (providers, language, retention)
	•	Perf: batch chunking, debounce
	•	QA: edge cases, language mix
	•	Packaging: notarized mac build

⸻

14) Example Prompts

Cardization (per window):

{
  "role": "system",
  "content": "You create precise, scannable cards from live meeting transcripts..."
}

{
  "role": "user",
  "content": "TRANSCRIPT WINDOW:\n[00:12:03][Anna] Budget is 25k for Q4; let's ship v1 by Oct 15...\n\nINSTRUCTIONS:\n- Return JSON array of 0..n cards {type,title,teaser,summary?,quote?,tags?,confidence}\n- teaser <= 2 lines, no fluff; keep language.\n"
}

Output (example):

[
  {
    "type":"fact",
    "title":"Q4 budget: 25k",
    "teaser":"Budget clarified for Q4: 25k. Applies to v1 scope and media spend.",
    "summary":"Budget for Q4 confirmed at 25k; covers MVP scope and basic media.",
    "quote":{"text":"Budget is 25k for Q4","speaker":"Anna","tsMs":723000},
    "tags":["budget","q4"],
    "confidence":0.88
  },
  {
    "type":"todo",
    "title":"Ship v1 by Oct 15",
    "teaser":"Target date set for v1: Oct 15. Owner to confirm.",
    "summary":"Initial target for v1 release is Oct 15; owner TBD.",
    "tags":["milestone","release"],
    "confidence":0.74
  }
]


⸻

15) File Structure (suggested)

/app
  /electron
    main.ts
    preload.ts
  /renderer
    index.html
    index.tsx
    /components
      BrandBar.tsx
      CardItem.tsx
      CardFeed.tsx
      StripShell.tsx
      SettingsPanel.tsx
    /styles
      tailwind.css
  /core
    card-engine/
      classify.ts
      prompts.ts
      merge.ts
    providers/
      zoomLtt.ts
      fireflies.ts
    db/
      sqlite.ts
      models.ts
    types.ts
  /assets
    logo.svg
.env.example
package.json


⸻

16) Config & ENV
	•	Z00M_SDK_KEY, Z00M_SDK_SECRET
	•	FIREFLIES_API_KEY
	•	OPENAI_API_KEY or ANTHROPIC_API_KEY
	•	SENSCRIPT_RETENTION_DAYS (default 90)

⸻

17) Roadmap (post-MVP)
	•	Multi-window layouts; virtual desktop awareness
	•	Smart clustering: merge related cards into threads
	•	Redaction layer for PII before LLM calls
	•	Export to Notion/Slack/Jira
	•	Team mode (shared cards via secure workspace)

⸻

Repo One-liner

SenScript — Real-time “cheat cards” for macOS. Turns Zoom Video SDK LTT & Fireflies transcripts into stacked fact tiles, action items, quotes, and context while you’re still in the call.
