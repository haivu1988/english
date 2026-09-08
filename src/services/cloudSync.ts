import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Deck, Flashcard, UserProgress, UserPreferences } from '../types';

function cleanObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}

export interface CloudUserData {
  cards: Flashcard[];
  decks: Deck[];
  progress: UserProgress | null;
  preferences: UserPreferences | null;
  hasCloudData: boolean;
}

/**
 * Load all user data from Firestore
 */
export async function loadUserCloudData(uid: string): Promise<CloudUserData> {
  try {
    // 1. Fetch Cards
    const cardsSnapshot = await getDocs(collection(db, 'users', uid, 'cards'));
    const cards: Flashcard[] = [];
    cardsSnapshot.forEach((docSnap) => {
      cards.push(docSnap.data() as Flashcard);
    });

    // 2. Fetch Decks
    const decksSnapshot = await getDocs(collection(db, 'users', uid, 'decks'));
    const decks: Deck[] = [];
    decksSnapshot.forEach((docSnap) => {
      decks.push(docSnap.data() as Deck);
    });

    // 3. Fetch Progress
    const progressDoc = await getDoc(doc(db, 'users', uid, 'progress', 'summary'));
    const progress = progressDoc.exists() ? (progressDoc.data() as UserProgress) : null;

    // 4. Fetch Preferences
    const prefDoc = await getDoc(doc(db, 'users', uid, 'preferences', 'settings'));
    const preferences = prefDoc.exists() ? (prefDoc.data() as UserPreferences) : null;

    const hasCloudData =
      cards.length > 0 || decks.length > 0 || progress !== null || preferences !== null;

    return {
      cards,
      decks,
      progress,
      preferences,
      hasCloudData,
    };
  } catch (err) {
    console.error('Failed to load user cloud data from Firestore:', err);
    throw err;
  }
}

/**
 * Seed cloud database with initial cards, decks, progress, and preferences for a newly connected user
 */
export async function seedUserCloudData(
  uid: string,
  initialCards: Flashcard[],
  initialDecks: Deck[],
  initialProgress: UserProgress,
  initialPreferences?: UserPreferences
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Write initial decks
    initialDecks.forEach((deck) => {
      const deckRef = doc(db, 'users', uid, 'decks', deck.id);
      batch.set(deckRef, cleanObject(deck as unknown as Record<string, unknown>));
    });

    // Write initial cards
    initialCards.forEach((card) => {
      const cardRef = doc(db, 'users', uid, 'cards', card.id);
      batch.set(cardRef, cleanObject(card as unknown as Record<string, unknown>));
    });

    // Write progress
    const progressRef = doc(db, 'users', uid, 'progress', 'summary');
    batch.set(progressRef, cleanObject(initialProgress as unknown as Record<string, unknown>));

    // Write preferences if provided
    if (initialPreferences) {
      const prefRef = doc(db, 'users', uid, 'preferences', 'settings');
      batch.set(prefRef, cleanObject(initialPreferences as unknown as Record<string, unknown>));
    }

    await batch.commit();
  } catch (err) {
    console.error('Failed to seed user data to Firestore:', err);
    throw err;
  }
}

/**
 * Save user preferences to Firestore
 */
export async function saveUserPreferencesToCloud(
  uid: string,
  preferences: UserPreferences
): Promise<void> {
  try {
    const prefRef = doc(db, 'users', uid, 'preferences', 'settings');
    await setDoc(prefRef, cleanObject(preferences as unknown as Record<string, unknown>), {
      merge: true,
    });
  } catch (err) {
    console.error('Failed to save user preferences to Firestore:', err);
  }
}

/**
 * Save or update a single flashcard to Firestore
 */
export async function saveUserCardToCloud(uid: string, card: Flashcard): Promise<void> {
  try {
    const cardRef = doc(db, 'users', uid, 'cards', card.id);
    await setDoc(cardRef, cleanObject(card as unknown as Record<string, unknown>), { merge: true });
  } catch (err) {
    console.error(`Failed to save card ${card.id} to Firestore:`, err);
  }
}

/**
 * Save all cards in batch
 */
export async function saveAllCardsToCloud(uid: string, cards: Flashcard[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    cards.forEach((card) => {
      const cardRef = doc(db, 'users', uid, 'cards', card.id);
      batch.set(cardRef, cleanObject(card as unknown as Record<string, unknown>), { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to batch save cards to Firestore:', err);
  }
}

/**
 * Save or update a deck to Firestore
 */
export async function saveUserDeckToCloud(uid: string, deck: Deck): Promise<void> {
  try {
    const deckRef = doc(db, 'users', uid, 'decks', deck.id);
    await setDoc(deckRef, cleanObject(deck as unknown as Record<string, unknown>), { merge: true });
  } catch (err) {
    console.error(`Failed to save deck ${deck.id} to Firestore:`, err);
  }
}

/**
 * Save user learning progress (streak, counters) to Firestore
 */
export async function saveUserProgressToCloud(uid: string, progress: UserProgress): Promise<void> {
  try {
    const progressRef = doc(db, 'users', uid, 'progress', 'summary');
    await setDoc(progressRef, cleanObject(progress as unknown as Record<string, unknown>), { merge: true });
  } catch (err) {
    console.error('Failed to save user progress to Firestore:', err);
  }
}
