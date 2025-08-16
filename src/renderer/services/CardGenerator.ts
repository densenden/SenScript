import { Flashcard } from '../../shared/types';

export interface CardGenerationOptions {
  language?: string;
  maxCards?: number;
  cardType?: 'definition' | 'question' | 'keyword' | 'mixed';
}

export class CardGenerator {
  private static instance: CardGenerator;

  static getInstance(): CardGenerator {
    if (!CardGenerator.instance) {
      CardGenerator.instance = new CardGenerator();
    }
    return CardGenerator.instance;
  }

  generateCardsFromText(
    text: string, 
    options: CardGenerationOptions = {}
  ): Flashcard[] {
    const {
      maxCards = 5,
      cardType = 'mixed'
    } = options;

    const sentences = this.extractSentences(text);
    const cards: Flashcard[] = [];

    switch (cardType) {
      case 'definition':
        cards.push(...this.generateDefinitionCards(sentences, maxCards));
        break;
      case 'question':
        cards.push(...this.generateQuestionCards(sentences, maxCards));
        break;
      case 'keyword':
        cards.push(...this.generateKeywordCards(sentences, maxCards));
        break;
      case 'mixed':
      default:
        const perType = Math.ceil(maxCards / 3);
        cards.push(...this.generateDefinitionCards(sentences, perType));
        cards.push(...this.generateQuestionCards(sentences, perType));
        cards.push(...this.generateKeywordCards(sentences, perType));
        break;
    }

    return cards.slice(0, maxCards);
  }

  private extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 10);
  }

  private generateDefinitionCards(sentences: string[], maxCards: number): Flashcard[] {
    const cards: Flashcard[] = [];
    
    for (let i = 0; i < Math.min(sentences.length, maxCards); i++) {
      const sentence = sentences[i];
      const keywords = this.extractKeywords(sentence);
      
      if (keywords.length > 0) {
        const keyword = keywords[0];
        const definition = sentence.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '___');
        
        cards.push({
          id: `def-${Date.now()}-${i}`,
          front: `Was bedeutet: "${keyword}"?`,
          back: sentence,
          tags: ['transcription', 'definition'],
          difficulty: 1
        });
      }
    }
    
    return cards;
  }

  private generateQuestionCards(sentences: string[], maxCards: number): Flashcard[] {
    const cards: Flashcard[] = [];
    
    for (let i = 0; i < Math.min(sentences.length, maxCards); i++) {
      const sentence = sentences[i];
      const question = this.sentenceToQuestion(sentence);
      
      if (question !== sentence) {
        cards.push({
          id: `q-${Date.now()}-${i}`,
          front: question,
          back: sentence,
          tags: ['transcription', 'question'],
          difficulty: 2
        });
      }
    }
    
    return cards;
  }

  private generateKeywordCards(sentences: string[], maxCards: number): Flashcard[] {
    const cards: Flashcard[] = [];
    
    for (let i = 0; i < Math.min(sentences.length, maxCards); i++) {
      const sentence = sentences[i];
      const keywords = this.extractKeywords(sentence);
      
      if (keywords.length > 0) {
        const keyword = keywords[0];
        const context = sentence.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '___');
        
        cards.push({
          id: `kw-${Date.now()}-${i}`,
          front: `Vervollständige: ${context}`,
          back: keyword,
          tags: ['transcription', 'keyword'],
          difficulty: 1
        });
      }
    }
    
    return cards;
  }

  private extractKeywords(sentence: string): string[] {
    const stopWords = new Set([
      'der', 'die', 'das', 'und', 'oder', 'aber', 'wenn', 'dann', 'ist', 'sind',
      'war', 'waren', 'hat', 'haben', 'wird', 'werden', 'kann', 'könnte',
      'soll', 'sollte', 'muss', 'müssen', 'auch', 'noch', 'schon', 'nur',
      'sehr', 'mehr', 'weniger', 'alle', 'einige', 'viele', 'wenige',
      'the', 'and', 'or', 'but', 'if', 'then', 'is', 'are', 'was', 'were',
      'has', 'have', 'will', 'can', 'could', 'should', 'must', 'also',
      'already', 'only', 'very', 'more', 'less', 'all', 'some', 'many', 'few'
    ]);

    return sentence
      .toLowerCase()
      .split(/\W+/)
      .filter(word => 
        word.length > 3 && 
        !stopWords.has(word) &&
        /^[a-zA-ZäöüßÄÖÜ]+$/.test(word)
      )
      .slice(0, 3);
  }

  private sentenceToQuestion(sentence: string): string {
    const lowerSentence = sentence.toLowerCase();
    
    if (lowerSentence.includes(' ist ')) {
      return sentence.replace(/(.+) ist (.+)/, 'Was ist $1?');
    }
    if (lowerSentence.includes(' sind ')) {
      return sentence.replace(/(.+) sind (.+)/, 'Was sind $1?');
    }
    if (lowerSentence.includes(' hat ')) {
      return sentence.replace(/(.+) hat (.+)/, 'Was hat $1?');
    }
    if (lowerSentence.includes(' haben ')) {
      return sentence.replace(/(.+) haben (.+)/, 'Was haben $1?');
    }
    if (lowerSentence.includes(' bedeutet ')) {
      return sentence.replace(/(.+) bedeutet (.+)/, 'Was bedeutet $1?');
    }
    
    return `Erkläre: ${sentence}`;
  }

  generateInstantCard(text: string): Flashcard | null {
    if (text.length < 10) return null;

    const keywords = this.extractKeywords(text);
    if (keywords.length === 0) return null;

    const keyword = keywords[0];
    const hasKeyword = text.toLowerCase().includes(keyword);

    if (hasKeyword) {
      return {
        id: `instant-${Date.now()}`,
        front: `Was wurde über "${keyword}" gesagt?`,
        back: text,
        tags: ['transcription', 'instant'],
        difficulty: 1
      };
    }

    return {
      id: `instant-${Date.now()}`,
      front: 'Was wurde gesagt?',
      back: text,
      tags: ['transcription', 'instant'],
      difficulty: 1
    };
  }
}

export const cardGenerator = CardGenerator.getInstance();