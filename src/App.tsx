import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { FlashcardViewer } from './components/FlashcardViewer';
import { DailyReviewSection } from './components/DailyReviewSection';
import { GenerateDeckSection } from './components/GenerateDeckSection';
import { DeckLibrarySection } from './components/DeckLibrarySection';
import { PracticeSentenceModal } from './components/PracticeSentenceModal';
import { WordDeepDiveModal } from './components/WordDeepDiveModal';
import { CloudAccountModal } from './components/CloudAccountModal';
import { OnboardingModal, TOPIC_OPTIONS } from './components/OnboardingModal';
import { AccountSection } from './components/AccountSection';
import { Deck, Flashcard, MasteryLevel, UserProgress, UserPreferences } from './types';
import {
  loadSavedCards,
  saveCards,
  loadSavedDecks,
  saveDecks,
  loadUserProgress,
  saveUserProgress,
  loadUserPreferences,
  saveUserPreferences,
} from './utils/storage';
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from './lib/firebase';
import {
  loadUserCloudData,
  seedUserCloudData,
  saveAllCardsToCloud,
  saveUserDeckToCloud,
  saveUserProgressToCloud,
  saveUserPreferencesToCloud,
} from './services/cloudSync';
import { BookOpen, Sparkles } from 'lucide-react';

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>(() => loadSavedCards());
  const [decks, setDecks] = useState<Deck[]>(() => loadSavedDecks());
  const [progress, setProgress] = useState<UserProgress>(() => loadUserProgress());
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());
  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    const loadedDecks = loadSavedDecks();
    return loadedDecks[0]?.id || 'deck-daily-today';
  });
  const [activeTab, setActiveTab] = useState<NavTab>('learn');

  // Firebase Auth & Cloud Sync States
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !loadUserPreferences().isOnboarded);
  const [isGeneratingStarterDeck, setIsGeneratingStarterDeck] = useState(false);
  const isInitialSyncDone = useRef(false);

  // Modals
  const [practiceCard, setPracticeCard] = useState<Flashcard | null>(null);
  const [deepDiveCard, setDeepDiveCard] = useState<Flashcard | null>(null);

  // 1. Listen for Auth Changes & initialize session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Sync with Firestore on login
        setIsSyncing(true);
        try {
          const cloudData = await loadUserCloudData(firebaseUser.uid);
          if (cloudData.hasCloudData) {
            if (cloudData.cards.length > 0) setCards(cloudData.cards);
            if (cloudData.decks.length > 0) {
              setDecks(cloudData.decks);
              setActiveDeckId(cloudData.decks[0]?.id || 'deck-daily-today');
            }
            if (cloudData.progress) setProgress(cloudData.progress);
            if (cloudData.preferences) {
              setPreferences(cloudData.preferences);
              saveUserPreferences(cloudData.preferences);
              if (!cloudData.preferences.isOnboarded) {
                setIsOnboardingOpen(true);
              }
            }
          } else {
            // Seed cloud database with initial/local cards, decks and preferences
            await seedUserCloudData(
              firebaseUser.uid,
              cards,
              decks,
              progress,
              preferences
            );
          }
          setLastSyncedAt(new Date());
          isInitialSyncDone.current = true;
        } catch (err) {
          console.warn('Initial cloud sync warning:', err);
        } finally {
          setIsSyncing(false);
        }
      } else {
        // Automatically create anonymous user session for seamless cloud sync
        signInAnonymously(auth).catch((err) => {
          console.warn('Anonymous auth note:', err);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Sync to localStorage
  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  useEffect(() => {
    saveDecks(decks);
  }, [decks]);

  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // 3. Debounced cloud sync when data updates
  useEffect(() => {
    if (!user || !isInitialSyncDone.current) return;
    const timer = setTimeout(async () => {
      try {
        await saveAllCardsToCloud(user.uid, cards);
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Failed to sync cards to cloud:', err);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [cards, user]);

  useEffect(() => {
    if (!user || !isInitialSyncDone.current) return;
    const timer = setTimeout(async () => {
      try {
        await saveUserProgressToCloud(user.uid, progress);
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Failed to sync progress to cloud:', err);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [progress, user]);

  // Manual Force Sync function
  const handleManualSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await saveAllCardsToCloud(user.uid, cards);
      for (const deck of decks) {
        await saveUserDeckToCloud(user.uid, deck);
      }
      await saveUserProgressToCloud(user.uid, progress);
      setLastSyncedAt(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  // Active deck cards
  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const activeDeckCards = cards.filter((c) => c.deckId === activeDeck?.id);

  // Grading handler
  const handleGradeCard = (cardId: string, level: MasteryLevel) => {
    setCards((prevCards) =>
      prevCards.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            masteryLevel: level,
            reviewCount: (c.reviewCount || 0) + 1,
            lastReviewed: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // Update progress
    setProgress((prev) => ({
      ...prev,
      totalCardsReviewed: prev.totalCardsReviewed + 1,
      todayCardsReviewed: prev.todayCardsReviewed + 1,
    }));
  };

  // Handle saving personal preferences & optional starter deck generation
  const handleSavePreferences = async (
    newPrefs: UserPreferences,
    shouldGenerateNewDeck: boolean
  ) => {
    setPreferences(newPrefs);
    saveUserPreferences(newPrefs);

    // Update daily goal
    setProgress((prev) => {
      const updated = { ...prev, dailyGoal: newPrefs.dailyGoal };
      saveUserProgress(updated);
      return updated;
    });

    if (user) {
      await saveUserPreferencesToCloud(user.uid, newPrefs);
    }

    if (shouldGenerateNewDeck) {
      setIsGeneratingStarterDeck(true);
      try {
        const primaryTopicId = newPrefs.topics[0] || 'daily';
        const topicMeta = TOPIC_OPTIONS.find((t) => t.id === primaryTopicId);
        const topicQuery = topicMeta ? topicMeta.query : 'Giao tiếp hằng ngày';

        const response = await fetch('/api/generate-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topicQuery,
            level: newPrefs.level,
            count: newPrefs.dailyGoal || 6,
            existingWords: cards.map((c) => c.word),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const todayStr = new Date().toISOString().split('T')[0];
          const deckId = `deck-${Date.now()}`;

          const newDeck: Deck = {
            id: deckId,
            title: data.topicTitle || `${topicMeta?.label || 'Từ vựng'} (${newPrefs.level})`,
            topic: topicQuery,
            level: newPrefs.level,
            createdAt: new Date().toISOString(),
            cardCount: data.cards?.length || 0,
            isDaily: true,
            dateStr: todayStr,
          };

          const newCards: Flashcard[] = (data.cards || []).map(
            (c: Partial<Flashcard>, index: number) => ({
              id: `card-${deckId}-${index}`,
              word: c.word || '',
              phonetic: c.phonetic || '',
              partOfSpeech: c.partOfSpeech || 'word',
              vietnameseMeaning: c.vietnameseMeaning || '',
              exampleSentence: c.exampleSentence || '',
              exampleTranslation: c.exampleTranslation || '',
              memoryTip: c.memoryTip || '',
              collocations: c.collocations || [],
              deckId,
              dateAdded: todayStr,
              reviewCount: 0,
              masteryLevel: 'new' as const,
            })
          );

          setDecks((prev) => [newDeck, ...prev]);
          setCards((prev) => [...newCards, ...prev]);
          setActiveDeckId(deckId);
          setActiveTab('learn');

          if (user) {
            await saveUserDeckToCloud(user.uid, newDeck);
            await saveAllCardsToCloud(user.uid, [...cards, ...newCards]);
          }
        }
      } catch (err) {
        console.error('Failed to auto-generate personalized deck:', err);
      } finally {
        setIsGeneratingStarterDeck(false);
      }
    }
  };

  // When a new deck is generated by Gemini
  const handleDeckCreated = (newDeck: Deck, newCards: Flashcard[]) => {
    setDecks((prev) => [newDeck, ...prev]);
    setCards((prev) => [...newCards, ...prev]);
    setActiveDeckId(newDeck.id);
    setActiveTab('learn');
  };

  // Select a deck to study
  const handleSelectDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setActiveTab('learn');
  };

  // Delete a deck
  const handleDeleteDeck = (deckId: string) => {
    const remainingDecks = decks.filter((d) => d.id !== deckId);
    if (remainingDecks.length === 0) return;
    setDecks(remainingDecks);
    setCards((prev) => prev.filter((c) => c.deckId !== deckId));
    if (activeDeckId === deckId) {
      setActiveDeckId(remainingDecks[0].id);
    }
  };

  const needsReviewCount = cards.filter(
    (c) => c.masteryLevel === 'learning' || c.masteryLevel === 'review'
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#4A453F] flex justify-center selection:bg-[#EAEFE8] selection:text-[#3D3934]">
      {/* Mobile container constraint: max-w-md matching the phone-native & desktop card frame */}
      <div className="w-full max-w-md min-h-screen bg-[#FAF9F6] border-x border-[#E0DBCF]/70 shadow-2xl flex flex-col relative pb-20">
        {/* Sticky App Header */}
        <Header
          progress={progress}
          activeDeckTitle={activeDeck?.title}
          user={user}
          isSyncing={isSyncing}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
          userLevel={preferences.level}
          onOpenPreferences={() => setIsOnboardingOpen(true)}
        />

        {/* Tab 1: Learn Active Deck */}
        {activeTab === 'learn' && (
          <main className="flex-1 flex flex-col pt-1">
            {/* Active Deck Selector / Header Info */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#E0DBCF]/40 bg-[#FAF9F6]">
              <div className="flex items-center space-x-2 min-w-0">
                <BookOpen className="w-4 h-4 text-[#8FA189] shrink-0" />
                <span className="text-xs font-serif font-bold text-[#3D3934] truncate">
                  {activeDeck?.title || 'Bộ thẻ hôm nay'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBE7DF] text-[#6B655B] border border-[#DED9CE] font-semibold shrink-0">
                  {activeDeck?.level || preferences.level}
                </span>
              </div>

              <button
                onClick={() => setActiveTab('generate')}
                className="text-[11px] font-semibold text-[#8FA189] hover:text-[#7D8F77] flex items-center space-x-1 shrink-0 ml-2 py-1 px-2 rounded-lg hover:bg-[#EAEFE8] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8FA189]" />
                <span>Thêm thẻ</span>
              </button>
            </div>

            <FlashcardViewer
              cards={activeDeckCards.length > 0 ? activeDeckCards : cards}
              onGradeCard={handleGradeCard}
              onOpenPractice={(card) => setPracticeCard(card)}
              onOpenDeepDive={(card) => setDeepDiveCard(card)}
            />
          </main>
        )}

        {/* Tab 2: Daily Review */}
        {activeTab === 'review' && (
          <main className="flex-1 flex flex-col pt-2">
            <DailyReviewSection
              cards={cards}
              onGradeCard={handleGradeCard}
              onSwitchToLearn={() => setActiveTab('learn')}
            />
          </main>
        )}

        {/* Tab 3: Generate Daily Deck with Gemini AI */}
        {activeTab === 'generate' && (
          <main className="flex-1 flex flex-col pt-2">
            <GenerateDeckSection
              existingWords={cards.map((c) => c.word)}
              onDeckCreated={handleDeckCreated}
              userPreferences={preferences}
            />
          </main>
        )}

        {/* Tab 4: Library & Stats */}
        {activeTab === 'library' && (
          <main className="flex-1 flex flex-col pt-2">
            <DeckLibrarySection
              decks={decks}
              cards={cards}
              activeDeckId={activeDeckId}
              progress={progress}
              preferences={preferences}
              onSelectDeck={handleSelectDeck}
              onDeleteDeck={handleDeleteDeck}
              onOpenPreferences={() => setIsOnboardingOpen(true)}
            />
          </main>
        )}

        {/* Tab 5: Account & Authentication Management */}
        {activeTab === 'account' && (
          <main className="flex-1 flex flex-col pt-2">
            <AccountSection
              user={user}
              cardCount={cards.length}
              deckCount={decks.length}
              progress={progress}
              preferences={preferences}
              isSyncing={isSyncing}
              lastSyncedAt={lastSyncedAt}
              onManualSync={handleManualSync}
              onOpenPreferences={() => setIsOnboardingOpen(true)}
            />
          </main>
        )}

        {/* Fixed Mobile Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reviewCount={needsReviewCount}
          userAvatarUrl={user?.photoURL}
        />

        {/* Modals */}
        <PracticeSentenceModal
          card={practiceCard}
          onClose={() => setPracticeCard(null)}
        />

        <WordDeepDiveModal
          card={deepDiveCard}
          onClose={() => setDeepDiveCard(null)}
        />

        <CloudAccountModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
          user={user}
          cardCount={cards.length}
          deckCount={decks.length}
          progress={progress}
          preferences={preferences}
          isSyncing={isSyncing}
          lastSyncedAt={lastSyncedAt}
          onManualSync={handleManualSync}
          onOpenPreferences={() => {
            setIsCloudModalOpen(false);
            setIsOnboardingOpen(true);
          }}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          preferences={preferences}
          onSavePreferences={handleSavePreferences}
          isGeneratingStarterDeck={isGeneratingStarterDeck}
        />
      </div>
    </div>
  );
}
