import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Trash2,
  Flame,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Deck, Flashcard, UserProgress } from '../types';

interface DeckLibrarySectionProps {
  decks: Deck[];
  cards: Flashcard[];
  activeDeckId: string;
  progress: UserProgress;
  onSelectDeck: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const DeckLibrarySection: React.FC<DeckLibrarySectionProps> = ({
  decks,
  cards,
  activeDeckId,
  progress,
  onSelectDeck,
  onDeleteDeck,
}) => {
  const masteredCount = cards.filter((c) => c.masteryLevel === 'mastered').length;
  const learningCount = cards.filter(
    (c) => c.masteryLevel === 'learning' || c.masteryLevel === 'review'
  ).length;
  const newCount = cards.filter((c) => c.masteryLevel === 'new').length;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 space-y-4">
      {/* Learning Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
          <div className="text-xl font-extrabold text-emerald-700">
            {masteredCount}
          </div>
          <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider mt-0.5">
            Đã thuộc
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-center">
          <div className="text-xl font-extrabold text-amber-700">
            {learningCount}
          </div>
          <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider mt-0.5">
            Đang ôn
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-center">
          <div className="text-xl font-extrabold text-indigo-700">
            {cards.length}
          </div>
          <div className="text-[10px] font-semibold text-indigo-800 uppercase tracking-wider mt-0.5">
            Tổng số thẻ
          </div>
        </div>
      </div>

      {/* Streak & Daily Habit Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Chuỗi học liên tục
            </h4>
            <p className="text-xs text-slate-500">
              Bạn đang giữ phong độ <strong className="text-amber-600">{progress.dailyStreak} ngày</strong>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            Mục tiêu {progress.todayCardsReviewed}/{progress.dailyGoal}
          </span>
        </div>
      </div>

      {/* Decks List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Các bộ thẻ từ vựng ({decks.length})
          </h3>
        </div>

        <div className="space-y-2.5">
          {decks.map((deck) => {
            const isActive = deck.id === activeDeckId;
            const deckCards = cards.filter((c) => c.deckId === deck.id);
            const deckMastered = deckCards.filter((c) => c.masteryLevel === 'mastered').length;

            return (
              <div
                key={deck.id}
                onClick={() => onSelectDeck(deck.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {deck.title}
                    </h4>
                    {deck.isDaily && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 shrink-0">
                        Hằng ngày
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {deck.topic} • {deck.level}
                  </p>

                  <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{deckCards.length} thẻ</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{deckMastered} đã thuộc</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {isActive ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-600 text-white">
                      Đang học
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDeck(deck.id);
                      }}
                      className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600"
                    >
                      Chọn
                    </button>
                  )}

                  {decks.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDeck(deck.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Xóa bộ thẻ này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
