// CheatCard API Integration
import { CheatCardCategory, SupportedLanguage, InterviewType } from './constants';

export interface CheatCard {
  id: string;
  category: CheatCardCategory;
  front: string;
  back: string;
  flag?: string;
  language?: SupportedLanguage;
  timestamp?: string;
  originalText?: string;
  source?: string;
  provider?: string;
  interviewType?: InterviewType;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  confidence?: number;
}

export interface CheatCardRequest {
  transcript: string;
  language: SupportedLanguage;
  mode: 'standard' | 'interview';
  sessionId?: string;
  interviewType?: InterviewType;
  educationLevel?: {
    userLevel: number;
    detailLevel: number;
    exampleComplexity: number;
  };
}

export interface CheatCardResponse {
  success: boolean;
  card?: CheatCard;
  skip?: boolean;
  message?: string;
  processingTime?: number;
}

class CheatCardAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.SENSCRIPT_API_URL || 'http://localhost:3002';
    this.apiKey = process.env.SENSCRIPT_API_KEY;
  }

  async generateCard(request: CheatCardRequest): Promise<CheatCardResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          sessionId: request.sessionId || `demo_${Date.now()}`,
          transcript: request.transcript,
          language: request.language,
          languageFlag: this.getLanguageFlag(request.language),
          outputLanguage: {
            auto: true,
            fixed: request.language
          },
          interviewMode: request.mode === 'interview',
          education: request.educationLevel || {
            userLevel: 3,
            detailLevel: 3,
            exampleComplexity: 3
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        card: data.card ? this.transformCard(data.card) : undefined,
        skip: data.skip,
        message: data.message,
        processingTime: data.processingTime
      };
    } catch (error) {
      console.error('CheatCard API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateDemoCard(scenario: string, mode: 'standard' | 'interview' = 'standard'): Promise<CheatCardResponse> {
    // For demo purposes, we can also use a mock response
    if (process.env.NODE_ENV === 'development' && !this.baseUrl.includes('localhost')) {
      return this.generateMockCard(scenario, mode);
    }

    return this.generateCard({
      transcript: scenario,
      language: 'en-US',
      mode,
      sessionId: `demo_${Date.now()}`
    });
  }

  private transformCard(apiCard: any): CheatCard {
    return {
      id: apiCard.id || `card_${Date.now()}`,
      category: apiCard.category as CheatCardCategory,
      front: apiCard.front,
      back: apiCard.back,
      flag: apiCard.flag,
      language: apiCard.language as SupportedLanguage,
      timestamp: apiCard.timestamp,
      originalText: apiCard.originalText,
      source: apiCard.source,
      provider: apiCard.provider,
      confidence: apiCard.confidence
    };
  }

  private getLanguageFlag(language: SupportedLanguage): string {
    const flags = {
      'de-DE': '🇩🇪',
      'en-US': '🇺🇸',
      'fr-FR': '🇫🇷',
      'es-ES': '🇪🇸',
      'it-IT': '🇮🇹',
      'pt-PT': '🇵🇹',
      'nl-NL': '🇳🇱',
      'ru-RU': '🇷🇺',
      'zh-CN': '🇨🇳',
      'ja-JP': '🇯🇵',
      'ko-KR': '🇰🇷',
      'ar-SA': '🇸🇦',
      'el-GR': '🇬🇷'
    };
    return flags[language] || '🌐';
  }

  private async generateMockCard(scenario: string, mode: 'standard' | 'interview'): Promise<CheatCardResponse> {
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockCards: { [key: string]: CheatCard } = {
      quantum: {
        id: 'demo_quantum',
        category: 'CONCEPT',
        front: 'What is quantum superposition and its significance in quantum mechanics?',
        back: 'Quantum superposition allows particles to exist in multiple states simultaneously until measured. This principle, along with the Heisenberg uncertainty principle, forms the foundation of quantum mechanics by showing that certain pairs of properties cannot be simultaneously known with perfect precision.',
        flag: '🇺🇸',
        language: 'en-US',
        source: 'demo',
        confidence: 0.92
      },
      interview_technical: {
        id: 'demo_interview',
        category: 'INTERVIEW TIP',
        front: 'How to differentiate between REST and GraphQL in a technical interview?',
        back: 'Explain that REST uses fixed endpoints for resources while GraphQL allows flexible queries. Choose REST for simple CRUD operations and caching benefits. Choose GraphQL for complex data requirements and when you need to minimize over-fetching. Mention practical experience with both approaches.',
        flag: '🇺🇸',
        language: 'en-US',
        source: 'demo',
        interviewType: 'technical',
        confidence: 0.88
      },
      startup_funding: {
        id: 'demo_funding',
        category: 'KEY FACTS',
        front: 'What metrics should you prepare when discussing startup funding and burn rate?',
        back: 'Prepare concrete data on customer acquisition cost, growth plans, competitive advantages, financial sustainability, and profitability projections. Include your current burn rate, funding runway, and clear path to profitability. Investors value transparent financial metrics and realistic growth projections.',
        flag: '🇺🇸',
        language: 'en-US',
        source: 'demo',
        interviewType: 'industry',
        confidence: 0.85
      }
    };

    // Select appropriate mock card based on scenario content
    let selectedCard: CheatCard;
    if (scenario.includes('quantum')) {
      selectedCard = mockCards.quantum;
    } else if (scenario.includes('REST') || scenario.includes('GraphQL')) {
      selectedCard = mockCards.interview_technical;
    } else if (scenario.includes('funding') || scenario.includes('burn rate')) {
      selectedCard = mockCards.startup_funding;
    } else {
      // Default card
      selectedCard = {
        id: 'demo_default',
        category: mode === 'interview' ? 'INTERVIEW TIP' : 'CONCEPT',
        front: 'What key insight can be extracted from this content?',
        back: 'This content provides valuable information that can be used for learning and preparation. The AI has identified key concepts and structured them into an actionable format for study and review.',
        flag: '🇺🇸',
        language: 'en-US',
        source: 'demo',
        confidence: 0.75
      };
    }

    return {
      success: true,
      card: selectedCard,
      processingTime: 2000
    };
  }
}

export const cheatCardAPI = new CheatCardAPI();