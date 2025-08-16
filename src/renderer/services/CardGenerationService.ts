import { TranscriptChunk } from './TranscriptionService';
import OpenAI from 'openai';

export interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: 'fact' | 'definition' | 'concept' | 'process' | 'example';
  confidence: number;
  source: string;
  timestamp: number;
  tags: string[];
}

export class CardGenerationService {
  private openai: OpenAI | null = null;
  private transcriptBuffer: TranscriptChunk[] = [];
  private cards: FlashCard[] = [];
  private onNewCard?: (card: FlashCard) => void;

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  public addTranscriptChunk(chunk: TranscriptChunk) {
    this.transcriptBuffer.push(chunk);
    
    // Process buffer when we have final transcript or buffer is large enough
    if (chunk.isFinal || this.transcriptBuffer.length >= 5) {
      this.processTranscriptBuffer();
    }
  }

  private async processTranscriptBuffer() {
    if (this.transcriptBuffer.length === 0 || !this.openai) {
      return;
    }

    // Combine transcript chunks into meaningful context
    const context = this.transcriptBuffer
      .map(chunk => chunk.text)
      .join(' ')
      .trim();

    if (context.length < 20) {
      this.transcriptBuffer = [];
      return;
    }

    try {
      const cards = await this.generateCardsFromContext(context);
      cards.forEach(card => {
        this.cards.push(card);
        this.onNewCard?.(card);
      });
    } catch (error) {
      console.error('Error generating cards:', error);
    }

    // Clear processed chunks
    this.transcriptBuffer = [];
  }

  private async generateCardsFromContext(context: string): Promise<FlashCard[]> {
    if (!this.openai) {
      return [];
    }

    const prompt = `
Extract educational flashcards from this transcript context. Create cards for:
- Key facts and definitions
- Important concepts
- Processes or procedures
- Examples or case studies

Context: "${context}"

Return a JSON array of flashcard objects with this structure:
{
  "front": "Question or term (concise)",
  "back": "Answer or definition (clear and educational)", 
  "category": "fact|definition|concept|process|example",
  "confidence": 0.8,
  "tags": ["relevant", "keywords"]
}

Only create cards if the content is educational. Minimum 1, maximum 3 cards.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Extract the most valuable learning points from conversations and create clear, concise flashcards.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      try {
        const rawCards = JSON.parse(content);
        const cards: FlashCard[] = Array.isArray(rawCards) ? rawCards : [rawCards];
        
        return cards.map(card => ({
          id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          front: card.front || '',
          back: card.back || '',
          category: card.category || 'concept',
          confidence: card.confidence || 0.7,
          source: context,
          timestamp: Date.now(),
          tags: Array.isArray(card.tags) ? card.tags : []
        })).filter(card => card.front && card.back);

      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return [];
      }

    } catch (error) {
      console.error('OpenAI API error:', error);
      return [];
    }
  }

  public getCards(): FlashCard[] {
    return [...this.cards];
  }

  public clearCards() {
    this.cards = [];
  }

  public removeCard(cardId: string) {
    this.cards = this.cards.filter(card => card.id !== cardId);
  }

  public onCardGenerated(callback: (card: FlashCard) => void) {
    this.onNewCard = callback;
  }

  public exportCards(format: 'json' | 'csv' | 'anki'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.cards, null, 2);
      
      case 'csv':
        if (this.cards.length === 0) return '';
        const headers = 'Front,Back,Category,Tags,Timestamp\n';
        const rows = this.cards.map(card => 
          `"${card.front}","${card.back}","${card.category}","${card.tags.join(';')}","${new Date(card.timestamp).toISOString()}"`
        ).join('\n');
        return headers + rows;
      
      case 'anki':
        return this.cards.map(card => 
          `${card.front}\t${card.back}\t${card.tags.join(' ')}`
        ).join('\n');
      
      default:
        return JSON.stringify(this.cards, null, 2);
    }
  }
}