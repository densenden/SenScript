import { Deck, Flashcard } from '../../shared/types';

class DeckService {
  private decks: Map<string, Deck> = new Map();
  private currentDeckId: string | null = null;

  constructor() {
    this.loadDecks();
    this.createSampleDeck();
  }

  private loadDecks() {
    const stored = localStorage.getItem('decks');
    if (stored) {
      const decksArray = JSON.parse(stored);
      decksArray.forEach((deck: Deck) => {
        this.decks.set(deck.id, deck);
      });
    }
  }

  private saveDecks() {
    const decksArray = Array.from(this.decks.values());
    localStorage.setItem('decks', JSON.stringify(decksArray));
  }

  private createSampleDeck() {
    if (this.decks.size === 0) {
      const sampleDeck: Deck = {
        id: 'sample-deck',
        name: 'Sample Deck',
        description: 'A sample deck to get you started',
        cards: [
          {
            id: '1',
            front: 'What is React?',
            back: 'A JavaScript library for building user interfaces',
            tags: ['javascript', 'frontend'],
            difficulty: 1
          },
          {
            id: '2',
            front: 'What is TypeScript?',
            back: 'A typed superset of JavaScript that compiles to plain JavaScript',
            tags: ['javascript', 'typescript'],
            difficulty: 1
          },
          {
            id: '3',
            front: 'What is Electron?',
            back: 'A framework for building cross-platform desktop apps with web technologies',
            tags: ['electron', 'desktop'],
            difficulty: 2
          }
        ],
        createdAt: new Date(),
        lastModified: new Date(),
        settings: {
          shuffleCards: false,
          cardsPerSession: 10
        }
      };
      this.decks.set(sampleDeck.id, sampleDeck);
      this.currentDeckId = sampleDeck.id;
      this.saveDecks();
    }
  }

  getAllDecks(): Deck[] {
    return Array.from(this.decks.values());
  }

  getDeck(id: string): Deck | undefined {
    return this.decks.get(id);
  }

  getCurrentDeck(): Deck | null {
    if (!this.currentDeckId) {
      const firstDeck = this.getAllDecks()[0];
      if (firstDeck) {
        this.currentDeckId = firstDeck.id;
        return firstDeck;
      }
      return null;
    }
    return this.decks.get(this.currentDeckId) || null;
  }

  setCurrentDeck(id: string) {
    if (this.decks.has(id)) {
      this.currentDeckId = id;
    }
  }

  createDeck(name: string, description?: string): Deck {
    const deck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      description,
      cards: [],
      createdAt: new Date(),
      lastModified: new Date(),
      settings: {
        shuffleCards: false,
        cardsPerSession: 10
      }
    };
    this.decks.set(deck.id, deck);
    this.saveDecks();
    return deck;
  }

  updateDeck(id: string, updates: Partial<Deck>) {
    const deck = this.decks.get(id);
    if (deck) {
      Object.assign(deck, updates, { lastModified: new Date() });
      this.saveDecks();
    }
  }

  deleteDeck(id: string) {
    this.decks.delete(id);
    if (this.currentDeckId === id) {
      const remaining = this.getAllDecks();
      this.currentDeckId = remaining.length > 0 ? remaining[0].id : null;
    }
    this.saveDecks();
  }

  addCard(deckId: string, card: Omit<Flashcard, 'id'>): Flashcard {
    const deck = this.decks.get(deckId);
    if (deck) {
      const newCard: Flashcard = {
        ...card,
        id: `card-${Date.now()}`
      };
      deck.cards.push(newCard);
      deck.lastModified = new Date();
      this.saveDecks();
      return newCard;
    }
    throw new Error('Deck not found');
  }

  updateCard(deckId: string, cardId: string, updates: Partial<Flashcard>) {
    const deck = this.decks.get(deckId);
    if (deck) {
      const cardIndex = deck.cards.findIndex(c => c.id === cardId);
      if (cardIndex !== -1) {
        Object.assign(deck.cards[cardIndex], updates);
        deck.lastModified = new Date();
        this.saveDecks();
      }
    }
  }

  deleteCard(deckId: string, cardId: string) {
    const deck = this.decks.get(deckId);
    if (deck) {
      deck.cards = deck.cards.filter(c => c.id !== cardId);
      deck.lastModified = new Date();
      this.saveDecks();
    }
  }

  createTranscriptionDeck(): Deck {
    const existingDeck = Array.from(this.decks.values())
      .find(deck => deck.name === 'Voice Transcriptions');
    
    if (existingDeck) {
      return existingDeck;
    }

    const deck: Deck = {
      id: 'transcription-deck',
      name: 'Voice Transcriptions',
      description: 'Cards generated from voice recordings',
      cards: [],
      createdAt: new Date(),
      lastModified: new Date(),
      settings: {
        shuffleCards: false,
        cardsPerSession: 20
      }
    };
    
    this.decks.set(deck.id, deck);
    this.saveDecks();
    return deck;
  }

  addTranscriptionCards(cards: Flashcard[]) {
    const transcriptionDeck = this.createTranscriptionDeck();
    transcriptionDeck.cards.push(...cards);
    transcriptionDeck.lastModified = new Date();
    this.saveDecks();
    
    // Switch to transcription deck if it's not current
    if (this.currentDeckId !== transcriptionDeck.id) {
      this.setCurrentDeck(transcriptionDeck.id);
    }
    
    return transcriptionDeck;
  }

  getTranscriptionDeck(): Deck | null {
    return Array.from(this.decks.values())
      .find(deck => deck.name === 'Voice Transcriptions') || null;
  }
}

export const deckService = new DeckService();