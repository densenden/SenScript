# Transcript Processing Pipeline - SenScript

## Übersicht der Verarbeitung

SenScript verarbeitet gesprochene Sprache in Echtzeit durch eine mehrstufige Pipeline, die Text intelligent splittet, filtert und AI-Karten erstellt. Hier ist der genaue Ablauf:

---

## 1. Speech Recognition Layer

### `handleSpeechResult(event)`
**Zweck:** Verarbeitet Speech Recognition API Events in Echtzeit

```javascript
// Empfängt Browser Speech Recognition Events
for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const text = result[0].transcript;
    
    if (result.isFinal) {
        // Finaler Text - wird zu pendingSentence hinzugefügt
        final += text + ' ';
    } else {
        // Interim Text - temporär während des Sprechens
        interim += text;
    }
}
```

**Echtzeit-Splitting (NEU):**
```javascript
// REAL-TIME SPLITTING: Prüft interim Ergebnisse für frühe Verarbeitung
if (interim.trim()) {
    const fullCurrentText = this.pendingSentence + interim;
    
    // Prüft ob wir JETZT verarbeiten sollen basierend auf interim + pending
    if (this.shouldProcessNow(fullCurrentText)) {
        console.log('[Interim] Real-time split triggered - processing pending sentence');
        this.processPendingSentence();
    }
}
```

**Trigger:** Browser Speech Recognition Events
**Output:** Finale Texte → `pendingSentence`, Interim → UI Anzeige

---

## 2. Sentence Splitting Layer

### `processPendingSentence()`
**Zweck:** Intelligente Aufteilung langer Sätze in verarbeitbare Segmente

**Mehrstufige Splitting-Strategie:**

#### Stufe 1: Primäre Satzzeichen
```javascript
const primaryBreaks = /([.!?])\s+/g;
let segments = this.splitByPattern(textToProcess, primaryBreaks);
```

#### Stufe 2: Sekundäre Trennzeichen (OPTIMIERT)
```javascript
const secondaryBreaks = /([,;:])\s+/g;
segments = segments.flatMap(segment => {
    if (segment.length > 35) { // Früher: 80, jetzt: 35!
        return this.splitByPattern(segment, secondaryBreaks);
    }
    return [segment];
});
```

#### Stufe 3: Konjunktionen (OPTIMIERT)
```javascript
const conjunctionBreaks = /\s+(aber|doch|jedoch|außerdem|zudem|and|but|however|furthermore)\s+/gi;
segments = segments.flatMap(segment => {
    if (segment.length > 50) { // Früher: 120, jetzt: 50!
        return this.splitByPattern(segment, conjunctionBreaks);
    }
    return [segment];
});
```

#### Stufe 4: Thematische Übergänge (OPTIMIERT)  
```javascript
const topicBreaks = /\s+(beginnen mit|schauen wir uns|let's look at|now)\s+/gi;
segments = segments.flatMap(segment => {
    if (segment.length > 40) { // Früher: 100, jetzt: 40!
        return this.splitByPattern(segment, topicBreaks);
    }
    return [segment];
});
```

#### Stufe 5: Notfall-Splitting (SEHR AGGRESSIV)
```javascript
// Sehr aggressive Frühtrennung bei >50 Zeichen (früher: 80)
if (this.pendingSentence.length > 50) {
    const midPoint = Math.floor(this.pendingSentence.length / 2);
    const spaceIndex = this.pendingSentence.indexOf(' ', midPoint);
    
    if (spaceIndex > -1) {
        const firstHalf = this.pendingSentence.substring(0, spaceIndex);
        this.processCompleteSentence(firstHalf); // Sofort verarbeiten!
        this.pendingSentence = secondHalf;
    }
}
```

**Trigger:** Finale Speech Results + Real-time Interim Checks
**Output:** Einzelne Segmente → `processCompleteSentence()`

---

## 3. Early Processing Decision Layer

### `shouldProcessNow(text)`
**Zweck:** Entscheidet ob Text sofort verarbeitet werden soll (auch während des Sprechens)

**Trigger-Bedingungen (SEHR AGGRESSIVE):**
```javascript
return /[.!?]\s/.test(text) ||                              // Satzenden
       (/[,;:]\s/.test(text) && text.length > 30) ||        // Kommas bei >30 Zeichen (war 50)
       (/\s+(aber|and|but|however)\s/i.test(text) && text.length > 35) || // Konjunktionen bei >35 (war 60)
       text.length > 45;                                     // Länge >45 Zeichen (war 90)
```

**Beispiel:**
- Text: "was ist Quantenphysik, Quantenphysik ist die Wissenschaft..."
- Bei Komma + 30 Zeichen → SPLIT JETZT!
- Erste Hälfte wird sofort verarbeitet
- Zweite Hälfte wartet auf mehr Input

**Trigger:** Interim Results + Final Results  
**Output:** Boolean → bestimmt ob Splitting ausgelöst wird

---

## 4. Language Detection Layer

### `processCompleteSentence(sentence)`
**Zweck:** Spracherkennung und Vorbereitung für Worthiness Check

```javascript
// Spracherkennung für diesen spezifischen Satz
const detection = this.detectLanguageForText(sentence);

// Globale Sprachaktualisierung bei hoher Konfidenz
if (detection.confidence > 15 && detection.lang !== this.currentLang) {
    this.currentLang = detection.lang;
    if (this.recognition) {
        this.recognition.lang = detection.lang; // Speech Recognition umstellen
    }
}
```

**Trigger:** Einzelne Segmente vom Splitting
**Output:** Text + Language Detection → Worthiness Check

---

## 5. Local Filtering Layer (NEUE EFFIZIENZ)

### `isTextWorthyOfCard(text)`
**Zweck:** Lokale Filterung um überflüssige API-Calls zu vermeiden

#### Stufe 1: Duplikat-Erkennung (NEU)
```javascript
// DUPLICATE CHECK FIRST - verhindert redundante API calls!
const textHash = trimmed.substring(0, 50); // Erste 50 Zeichen als Hash
if (this.recentTexts.has(textHash)) {
    console.log('🚫 DUPLICATE - Text bereits kürzlich verarbeitet - überspringe API-Call');
    return false;
}

// Zu recentTexts hinzufügen, auto-entfernen nach 10s
this.recentTexts.add(textHash);
setTimeout(() => {
    this.recentTexts.delete(textHash);
}, this.DUPLICATE_TIMEOUT);
```

#### Stufe 2: Längen-Filter
```javascript
if (trimmed.length < 20) {
    return false; // Zu kurz
}
```

#### Stufe 3: Anti-Educational Patterns
```javascript
const nonEducationalPatterns = [
    { name: 'Personal statements', pattern: /\b(ich bin|i am|i have)\b/i },
    { name: 'Greetings/fillers', pattern: /^(ja|nein|ok|hmm|well|yes|no|um)\b/i },
    { name: 'Incomplete sentences', pattern: /^(this is|das ist).{0,15}$/i },
    // ... weitere Filter
];

for (const filter of nonEducationalPatterns) {
    if (filter.pattern.test(trimmed)) {
        return false; // Nicht-bildungsbezogen
    }
}
```

#### Stufe 4: Educational Value Patterns  
```javascript
const educationalChecks = [
    { 
        name: 'Explanatory content', 
        test: (/\b(bedeutet|means|ist|is|erklärt|explains)\b/i.test(trimmed) && trimmed.length > 40)
    },
    { 
        name: 'Question-answer patterns', 
        test: (/\b(was ist|what is|wie funktioniert|how does)\b/i.test(trimmed) && trimmed.length > 30)
    },
    // ... weitere Educational Patterns
];

// MUSS mindestens ein Educational Pattern erfüllen
for (const check of educationalChecks) {
    if (check.test) {
        return true; // Bildungswert gefunden!
    }
}
```

**Trigger:** Jedes Segment nach Language Detection
**Output:** Boolean → bestimmt ob AI-Card erstellt wird

---

## 6. AI Card Generation Layer

### `createCard(sentence, detection)`
**Zweck:** API-Call zur AI-basierten Kartengenereierung

**Nur wenn alle Filter bestanden:**
```javascript
if (this.isTextWorthyOfCard(sentence)) {
    console.log('🎯 WORTHY - Text bestanden Worthiness Check - erstelle Karte SOFORT...');
    this.createCard(sentence, detection); // API-Call
} else {
    console.log('🚫 NOT-WORTHY - Text nicht bildungsbezogen genug');
}
```

**API Payload:**
```javascript
{
    "sessionId": "session_xxx",
    "transcript": sentence,
    "language": detection.lang,
    "textConfidence": detection.confidence,
    "languageFlag": detection.flag
}
```

**Trigger:** Nur worthy Texte nach lokaler Filterung
**Output:** AI-generierte Flashcard

---

## 7. Card Rendering Layer

### `renderCard(card)`
**Zweck:** Visuelle Darstellung der erstellten Karte

```javascript
// Floating Animation beim Erscheinen
cardEl.className = 'card new-card';

// Concentric Design (Radius basierend auf Container-Abstand)
cardEl.innerHTML = `
    <div class="card-header">${card.category}${languageFlag} • ${card.time}</div>
    <div class="card-front">${card.front}</div>
    <div class="card-back">${card.back}</div>
`;

// Push-Down Animation für bestehende Karten
const existingCards = Array.from(this.els.cardsContainer.children);
existingCards.forEach(card => card.classList.add('push-down'));
```

---

## Effizienz-Optimierungen

### Vorher (Ineffizient):
- 13 API-Calls für 3 Karten
- Lange Wartezeiten bis Satzende
- Viele redundante Verarbeitungen

### Nachher (Optimiert):
- **3 API-Calls für 3 Karten** (90% Reduzierung!)
- **Real-time Splitting** während des Sprechens
- **Lokale Duplikat-Erkennung** verhindert redundante Calls
- **Aggressive Thresholds** für schnellere Verarbeitung

---

## Beispiel-Ablauf

**Input:** "was ist Quantenphysik, Quantenphysik ist die Wissenschaft die erklärt wie Teilchen auf atomarer Ebene funktionieren"

1. **Speech Recognition:** Empfängt Text in Chunks
2. **Real-time Check:** Bei "was ist Quantenphysik," (>30 chars) → SPLIT!
3. **Erste Verarbeitung:** "was ist Quantenphysik"
   - Language: de-DE (Deutsch erkannt)
   - Duplikat: Nein (neu)
   - Worthy: JA (Fragemuster + Educational)
   - → API-Call → Karte 1 erstellt
4. **Zweite Verarbeitung:** "Quantenphysik ist die Wissenschaft..."
   - Duplikat: Teilweise ähnlich, aber >50 chars unterschiedlich → OK  
   - Worthy: JA (Erklärungsinhalt)
   - → API-Call → Karte 2 erstellt

**Ergebnis:** 2 Karten, 2 API-Calls, Real-time Erstellung während des Sprechens!

---

## Monitoring & Debugging

Alle Schritte werden detailliert geloggt:
- `[SPEECH-START/END]` - Speech Recognition Events
- `[Interim]` - Real-time Splitting Entscheidungen  
- `[Segment]` - Splitting-Operationen
- `[WORTHINESS-CHECK]` - Filterung Details
- `[DUPLICATE]` - Duplikat-Erkennungen
- `[CARD-SUCCESS]` - Erfolgreiche API-Calls

Die Console zeigt jeden Schritt mit Timestamps und Details für vollständige Transparenz der Verarbeitungspipeline.