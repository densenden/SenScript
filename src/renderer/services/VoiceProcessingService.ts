export interface ProcessedSentence {
  text: string;
  isQuestion: boolean;
  questionType: 'what' | 'how' | 'when' | 'where' | 'why' | 'who' | 'other' | null;
  confidence: number;
}

export interface VoiceInsight {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  confidence: number;
}

export class VoiceProcessingService {
  private static instance: VoiceProcessingService;
  private insights: VoiceInsight[] = [];

  static getInstance(): VoiceProcessingService {
    if (!VoiceProcessingService.instance) {
      VoiceProcessingService.instance = new VoiceProcessingService();
    }
    return VoiceProcessingService.instance;
  }

  /**
   * Split transcript into sentences and process each one
   */
  processTranscript(transcript: string): ProcessedSentence[] {
    if (!transcript.trim()) return [];

    // Split into sentences using multiple delimiters
    const sentences = this.splitIntoSentences(transcript);
    
    return sentences
      .map(sentence => this.analyzeSentence(sentence))
      .filter(sentence => sentence.text.length > 3); // Filter out very short fragments
  }

  /**
   * Split text into sentences using punctuation and natural breaks
   */
  private splitIntoSentences(text: string): string[] {
    // Clean and normalize the text
    const cleaned = text
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .trim();

    // Split on sentence endings, but be smart about abbreviations
    const sentences = cleaned
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return sentences;
  }

  /**
   * Analyze a single sentence for question patterns
   */
  private analyzeSentence(sentence: string): ProcessedSentence {
    const cleanSentence = sentence.trim().toLowerCase();
    
    // Question word patterns for German and English
    const questionPatterns = {
      what: /\b(what|was)\b/i,
      how: /\b(how|wie)\b/i,
      when: /\b(when|wann)\b/i,
      where: /\b(where|wo)\b/i,
      why: /\b(why|warum|weshalb)\b/i,
      who: /\b(who|wer)\b/i
    };

    // Check for question words
    let questionType: ProcessedSentence['questionType'] = null;
    let isQuestion = false;
    let confidence = 0;

    // Detect question words
    for (const [type, pattern] of Object.entries(questionPatterns)) {
      if (pattern.test(cleanSentence)) {
        questionType = type as ProcessedSentence['questionType'];
        isQuestion = true;
        confidence += 0.7;
        break;
      }
    }

    // Additional question indicators
    if (cleanSentence.includes('?')) {
      isQuestion = true;
      confidence += 0.3;
    }

    // Question-like phrases
    const questionPhrases = [
      'can you', 'could you', 'would you', 'will you',
      'do you', 'did you', 'have you', 'are you',
      'is it', 'does it', 'kannst du', 'könntest du',
      'tell me', 'explain', 'erkläre'
    ];

    for (const phrase of questionPhrases) {
      if (cleanSentence.includes(phrase)) {
        isQuestion = true;
        confidence += 0.4;
        if (!questionType) questionType = 'other';
        break;
      }
    }

    // Normalize confidence to 0-1
    confidence = Math.min(confidence, 1);

    return {
      text: sentence.trim(),
      isQuestion,
      questionType,
      confidence
    };
  }

  /**
   * Process questions and get AI insights
   */
  async processQuestions(
    sentences: ProcessedSentence[], 
    getAIResponse: (question: string, context: string) => Promise<string>
  ): Promise<VoiceInsight[]> {
    const questions = sentences.filter(s => s.isQuestion && s.confidence > 0.5);
    const insights: VoiceInsight[] = [];

    // Get context from recent conversation
    const context = this.getRecentContext();

    for (const question of questions) {
      try {
        console.log(`Processing question: "${question.text}"`);
        
        const answer = await getAIResponse(question.text, context);
        
        const insight: VoiceInsight = {
          id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          question: question.text,
          answer: answer,
          timestamp: Date.now(),
          confidence: question.confidence
        };

        insights.push(insight);
        this.insights.push(insight);

        // Keep only last 10 insights
        if (this.insights.length > 10) {
          this.insights = this.insights.slice(-10);
        }

      } catch (error) {
        console.error('Error processing question:', error);
        // Create fallback insight
        insights.push({
          id: `insight-error-${Date.now()}`,
          question: question.text,
          answer: "I couldn't process that question right now. Please try again.",
          timestamp: Date.now(),
          confidence: 0.1
        });
      }
    }

    return insights;
  }

  /**
   * Get recent conversation context for better AI responses
   */
  private getRecentContext(): string {
    const recentInsights = this.insights.slice(-3);
    return recentInsights
      .map(insight => `Q: ${insight.question}\nA: ${insight.answer}`)
      .join('\n\n');
  }

  /**
   * Get all insights
   */
  getInsights(): VoiceInsight[] {
    return [...this.insights];
  }

  /**
   * Clear all insights
   */
  clearInsights(): void {
    this.insights = [];
  }

  /**
   * Remove a specific insight
   */
  removeInsight(id: string): void {
    this.insights = this.insights.filter(insight => insight.id !== id);
  }
}

export const voiceProcessingService = VoiceProcessingService.getInstance();