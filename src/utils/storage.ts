import { Deck, Flashcard, UserProgress } from '../types';
import { initialCards, initialDeck } from '../data/starterCards';

const STORAGE_KEYS = {
  CARDS: 'eng_flashcards_cards_v1',
  DECKS: 'eng_flashcards_decks_v1',
  PROGRESS: 'eng_flashcards_progress_v1',
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadSavedCards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading cards from storage', e);
  }
  return initialCards;
}

export function saveCards(cards: Flashcard[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error('Error saving cards', e);
  }
}

export function loadSavedDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading decks from storage', e);
  }
  return [initialDeck];
}

export function saveDecks(decks: Deck[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
  } catch (e) {
    console.error('Error saving decks', e);
  }
}

export function loadUserProgress(): UserProgress {
  const today = getTodayDateString();
  const defaultProgress: UserProgress = {
    dailyStreak: 1,
    lastActiveDate: today,
    totalCardsReviewed: 0,
    todayCardsReviewed: 0,
    todayDateStr: today,
    dailyGoal: 6,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (raw) {
      const data: UserProgress = JSON.parse(raw);
      // Check streak and day transition
      if (data.todayDateStr !== today) {
        // New day! Check if yesterday was active
        const lastDate = new Date(data.lastActiveDate);
        const currentDate = new Date(today);
        const diffDays = Math.round(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let streak = data.dailyStreak || 1;
        if (diffDays === 1) {
          // consecutive day
          streak += 1;
        } else if (diffDays > 1) {
          // missed day, reset streak to 1
          streak = 1;
        }

        const updated: UserProgress = {
          ...data,
          dailyStreak: streak,
          lastActiveDate: today,
          todayCardsReviewed: 0,
          todayDateStr: today,
        };
        saveUserProgress(updated);
        return updated;
      }
      return data;
    }
  } catch (e) {
    console.error('Error loading user progress', e);
  }

  saveUserProgress(defaultProgress);
  return defaultProgress;
}

export function saveUserProgress(progress: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving user progress', e);
  }
}
