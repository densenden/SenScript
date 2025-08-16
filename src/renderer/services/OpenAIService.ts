import OpenAI from 'openai';
import { Flashcard } from '../../shared/types';

export class OpenAIService {
  private openai: OpenAI;
  private static instance: OpenAIService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async generateFlashcardsFromTranscript(transcript: string): Promise<Flashcard[]> {
    try {
      const prompt = this.createFlashcardPrompt(transcript);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating educational flashcards. Create concise, clear, and useful flashcards from the given text. Return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const flashcards = this.parseFlashcardResponse(response);
      return flashcards;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to local generation
      return this.fallbackGeneration(transcript);
    }
  }

  private createFlashcardPrompt(transcript: string): string {
    return `
Create 3-5 flashcards from this transcript. Each card should test understanding of key concepts.

Transcript: "${transcript}"

Return a JSON array with this exact structure:
[
  {
    "front": "Question or prompt",
    "back": "Answer or explanation",
    "difficulty": 1,
    "tags": ["transcription", "keyword"]
  }
]

Types of cards to create:
1. Definition cards: "What is X?" → "X is..."
2. Fill-in-the-blank: "Complete: ___ is important because..." → "answer"
3. Explanation cards: "Explain why..." → "detailed explanation"
4. Application cards: "How would you use..." → "practical example"

Keep questions concise and answers clear. Use the original language (German/English) from the transcript.
Return only valid JSON, no additional text.
`;
  }

  private parseFlashcardResponse(response: string): Flashcard[] {
    try {
      // Clean the response to extract JSON
      let jsonStr = response.trim();
      
      // Remove any markdown code blocks
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON array in the response
      const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      return parsed.map((card: any, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        front: card.front || 'Generated question',
        back: card.back || 'Generated answer',
        tags: Array.isArray(card.tags) ? card.tags : ['transcription', 'ai'],
        difficulty: typeof card.difficulty === 'number' ? card.difficulty : 1,
        lastReviewed: undefined,
        nextReview: undefined,
        correctCount: 0,
        incorrectCount: 0
      }));
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return this.fallbackGeneration(response);
    }
  }

  private fallbackGeneration(text: string): Flashcard[] {
    // Simple fallback when OpenAI fails
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length === 0) return [];

    const firstSentence = sentences[0].trim();
    
    return [{
      id: `fallback-${Date.now()}`,
      front: 'Was wurde hier gesagt?',
      back: firstSentence,
      tags: ['transcription', 'fallback'],
      difficulty: 1,
      lastReviewed: undefined,
      nextReview: undefined,
      correctCount: 0,
      incorrectCount: 0
    }];
  }

  async enhanceCard(front: string, back: string): Promise<{ front: string; back: string }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Improve flashcard clarity and educational value. Keep the same language and core meaning."
          },
          {
            role: "user",
            content: `Improve this flashcard:
Front: ${front}
Back: ${back}

Return improved version in JSON format:
{"front": "improved front", "back": "improved back"}`
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const improved = JSON.parse(response);
        return {
          front: improved.front || front,
          back: improved.back || back
        };
      }
    } catch (error) {
      console.error('Card enhancement error:', error);
    }
    
    return { front, back };
  }

  async getConversationInsight(question: string, context: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful conversation assistant. Provide concise, relevant answers to questions based on the conversation context. Keep responses under 100 words and focus on practical, actionable information. Respond in the same language as the question."
          },
          {
            role: "user",
            content: `Context from recent conversation: "${context}"

Question: "${question}"

Provide a helpful, concise answer that considers the conversation context.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const response = completion.choices[0]?.message?.content;
      return response || "I don't have enough context to provide a specific answer to that question.";
    } catch (error) {
      console.error('Conversation insight error:', error);
      throw error;
    }
  }
}

export const openAIService = OpenAIService.getInstance();