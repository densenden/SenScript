export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
  difficulty?: number;
  lastReviewed?: Date;
  nextReview?: Date;
  correctCount?: number;
  incorrectCount?: number;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: Flashcard[];
  createdAt: Date;
  lastModified: Date;
  settings?: DeckSettings;
}

export interface DeckSettings {
  shuffleCards?: boolean;
  reviewInterval?: number;
  cardsPerSession?: number;
}

export interface StudySession {
  deckId: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface AppSettings {
  alwaysOnTop: boolean;
  theme: 'light' | 'dark' | 'auto';
  keyboardShortcuts: {
    flipCard: string;
    nextCard: string;
    previousCard: string;
    markCorrect: string;
    markIncorrect: string;
  };
}