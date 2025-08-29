# Card Creation Product Requirements Document
## SenScript Educational Flashcard Generation System

**Document Version:** 1.0  
**Last Updated:** 2025-08-29  
**Status:** Draft for Implementation  

---

## Executive Summary

This PRD defines the comprehensive requirements for SenScript's card creation system, addressing critical quality issues identified in current implementations and establishing a framework for generating high-quality educational flashcards from transcript content.

**Current Problem:** Cards are being generated but lack educational value - they merely reformulate transcript text as basic Q&A pairs instead of creating meaningful study materials.

**Solution:** Implement a sophisticated card generation system with proper categorization, educational formatting, and content quality standards.

---

## Problem Statement

### Current Issues Identified

1. **Poor Content Quality**: Cards reformulate transcript text rather than extracting educational value
   ```json
   // Current problematic output
   {
     "front": "Why is there a card game happening in this context?",
     "back": "The mention of a 'card game' could be a metaphor for a situation..."
   }
   ```

2. **Generic Categories**: Using vague categories like "CONCEPT" instead of specific educational contexts

3. **Inconsistent Formatting**: Cards lack proper structure for different learning modes (Flash vs CheatCard)

4. **Missing Educational Context**: No consideration of user level, subject matter, or learning objectives

---

## Solution Architecture

### Card Types & Categories

**Primary Categories (Exact Names Required):**
- `MEETING TIP` - Professional meeting strategies and responses
- `PRESENTATION TIP` - Public speaking and presentation advice  
- `INTERVIEW TIP` - Job interview preparation and answers
- `QUICK WIN` - Easy-to-remember facts, formulas, memory tricks
- `KEY FACTS` - Important educational concepts and principles
- `WHAT TO SAY` - Specific phrases, responses, or explanations
- `AVOID THIS` - Common mistakes and what not to do
- `CONCEPT` - Complex ideas requiring deeper understanding
- `FACT` - Straightforward factual information

### Card Modes

**Flash Card Mode:**
- **Format**: Plain text paragraphs without emojis or bullet points
- **Structure**: Complete sentences with detailed explanations
- **Purpose**: Comprehensive learning and understanding
- **Example**: 
  ```
  "back": "Quantum Entanglement is a phenomenon where particles become interconnected and share state information regardless of distance. Einstein referred to this as 'spooky action at a distance,' questioning the instantaneous effect on entangled particles."
  ```

**CheatCard Mode:**
- **Format**: ONLY emojis for structure (🎯, ⚡, 📝) - NO bullet points
- **Structure**: Each line under 15 words, scannable and actionable
- **Purpose**: Quick reference and memorization
- **Example**:
  ```
  "back": "🎯 Main concept with clear action\n⚡ Memory trick or tip\n📝 Quick practical advice"
  ```

---

## Content Quality Standards

### Educational Value Requirements

1. **Must Extract Learning Value**: Transform raw transcript into educational insights
2. **Contextual Relevance**: Match content to appropriate category
3. **Actionable Information**: Provide practical knowledge users can apply
4. **Clear Question Formation**: Front must pose a specific, answerable question

### Content Transformation Examples

**❌ Poor Quality (Current):**
```json
{
  "category": "CONCEPT",
  "front": "Why is there a card game happening in this context?",
  "back": "The mention of a 'card game' could be a metaphor..."
}
```

**✅ High Quality (Target):**
```json
{
  "category": "INTERVIEW TIP", 
  "front": "How should you handle being asked about a technology you've never used in a tech interview?",
  "back": "In a tech interview, if asked about an unfamiliar technology like Kubernetes, acknowledge it honestly but pivot to related experience. Highlight your understanding of similar concepts and express confidence in quickly ramping up on the new technology."
}
```

### Skip Criteria

**Only skip if content contains:**
- Pure filler words (um, ah, okay, yes, no)
- Incomplete sentences with no educational value  
- Repetitive greetings or social pleasantries
- Technical difficulties or audio issues

**Never skip if content has ANY educational potential**

---

## Technical Implementation

### JSON Response Format

```json
{
  "category": "EXACT category name from approved list",
  "front": "Clear question or scenario (what the user needs to know)",
  "back": "[Format based on card mode - structured emojis for cheat, paragraphs for flash]",
  "confidence": 85-95,
  "cardType": "cheat" or "flash",
  "skip": false
}
```

### System Prompt Architecture

The system prompt must include:

1. **Priority Statement**: Generate exactly 1 card per worthy transcript segment
2. **Category List**: Specific, exact category names with clear definitions
3. **Format Requirements**: Mode-specific formatting rules
4. **Quality Standards**: Educational value requirements
5. **Language Instructions**: Match input language
6. **Skip Criteria**: Specific conditions for skipping content

### Content Processing Pipeline

```
Transcript Segment
    ↓
Educational Value Assessment
    ↓
Category Classification
    ↓
Question Formation (Front)
    ↓
Answer Generation (Back)
    ↓
Format Application (Mode-specific)
    ↓
Quality Validation
    ↓
Card Output
```

---

## User Experience Requirements

### Card Display Standards

**Birth Animation Sequence:**
1. Create 12px empty container
2. Breeding animation (preparation shake)
3. Height expansion to full size
4. Content fade-in with proper formatting
5. Auto-scroll to show new card

**Visual Hierarchy:**
```html
<div class="card-header">
  <div class="card-type">[CATEGORY]</div>
  <div class="metadata">[Source] [Language Flag] [Timestamp]</div>
</div>
<div class="card-title">[Front Question]</div>
<div class="card-content">
  <strong>Answer:</strong>
  [Back Content - Formatted by Mode]
</div>
<div class="card-source">[Provider • Source • Original Text Preview]</div>
```

### Quality Indicators

**Confidence Scoring:**
- 90-95: High educational value, clear categorization
- 85-89: Good educational value, appropriate content
- 80-84: Moderate value, may need refinement
- <80: Consider for improvement or skip

**Visual Indicators:**
- Source indicator circle (AI/Human generated)
- Language flag matching detected language
- Timestamp for context reference

---

## Content Examples by Category

### MEETING TIP
```json
{
  "category": "MEETING TIP",
  "front": "How can you address being behind schedule in a project during a meeting effectively?",
  "back": "When facing delays in a project during a meeting, explain the reasons for the delay and present a concrete plan to catch up. Focus on solutions rather than excuses and propose measures like improved task management to prevent future delays."
}
```

### QUICK WIN
```json
{
  "category": "QUICK WIN", 
  "front": "What is the concept of rubber duck debugging in programming?",
  "back": "🎯 Explain code to rubber duck to find bugs\n⚡ Verbalizing slows thinking, processes differently\n📝 Often faster than traditional code reviews"
}
```

### KEY FACTS
```json
{
  "category": "KEY FACTS",
  "front": "What is notable about the Finnish education system regarding reading and standardized tests?",
  "back": "Finnish students start reading at 7 but excel in PISA tests. The system emphasizes play, creativity, and critical thinking over standardized tests in early education, contributing to high international rankings."
}
```

---

## Quality Assurance

### Testing Criteria

1. **Educational Value Test**: Does the card teach something useful?
2. **Category Accuracy Test**: Is the category appropriate for the content?
3. **Format Compliance Test**: Does formatting match the specified mode?
4. **Question Quality Test**: Is the front question clear and specific?
5. **Answer Completeness Test**: Does the back provide adequate information?

### Success Metrics

- **Card Generation Rate**: >80% of educational transcript segments generate cards
- **Category Distribution**: Balanced use of appropriate categories
- **User Engagement**: Cards are saved/exported at higher rates
- **Educational Effectiveness**: Users report improved learning outcomes

---

## Implementation Priority

### Phase 1: Core System
- [ ] Update system prompts with new standards
- [ ] Implement category validation
- [ ] Add content quality scoring

### Phase 2: Format Enhancement  
- [ ] Improve CheatCard emoji formatting
- [ ] Enhance FlashCard paragraph structure
- [ ] Add visual quality indicators

### Phase 3: Quality Optimization
- [ ] Implement A/B testing for prompt variations
- [ ] Add user feedback mechanisms
- [ ] Optimize based on usage patterns

---

## Risk Assessment

**High Risk:**
- System prompt changes may affect generation reliability
- Category restrictions might reduce card volume

**Medium Risk:**
- Format changes require UI updates
- Quality standards need consistent enforcement

**Mitigation:**
- Gradual rollout with testing
- Fallback to previous prompts if quality degrades
- Regular quality audits and adjustments

---

## Success Criteria

**Launch Requirements:**
1. All cards use approved categories exclusively
2. Format compliance reaches 95%+ accuracy
3. Educational value assessment shows improvement over baseline
4. No reduction in successful card generation rate

**Long-term Goals:**
1. User satisfaction scores >4.0/5.0 for card quality
2. 50%+ reduction in skipped/deleted cards
3. Increased average session duration
4. Higher export rates for generated cards

---

*This PRD serves as the definitive guide for implementing SenScript's next-generation card creation system, prioritizing educational value and user experience over raw generation volume.*