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
  Compass,
  Sliders,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { Deck, Flashcard, UserProgress, UserPreferences } from '../types';
import { TOPIC_OPTIONS, LEVEL_OPTIONS } from './OnboardingModal';

interface DeckLibrarySectionProps {
  decks: Deck[];
  cards: Flashcard[];
  activeDeckId: string;
  progress: UserProgress;
  preferences?: UserPreferences;
  onSelectDeck: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onOpenPreferences?: () => void;
}

export const DeckLibrarySection: React.FC<DeckLibrarySectionProps> = ({
  decks,
  cards,
  activeDeckId,
  progress,
  preferences,
  onSelectDeck,
  onDeleteDeck,
  onOpenPreferences,
}) => {
  const masteredCount = cards.filter((c) => c.masteryLevel === 'mastered').length;
  const learningCount = cards.filter(
    (c) => c.masteryLevel === 'learning' || c.masteryLevel === 'review'
  ).length;

  const currentLevelInfo = LEVEL_OPTIONS.find((l) => l.id === preferences?.level);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 space-y-4">
      {/* Learning Path & Level Focus Card */}
      {preferences && (
        <div className="p-3.5 rounded-2xl bg-[#EAEFE8] border border-[#D6E0D3] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-[#8FA189] text-white flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-[#3D3934]">
                  Lộ trình & Năng lực hiện tại
                </h4>
                <p className="text-[10px] text-[#5C574F]">
                  {currentLevelInfo?.title || preferences.level}
                </p>
              </div>
            </div>

            {onOpenPreferences && (
              <button
                onClick={onOpenPreferences}
                className="text-[11px] font-serif font-bold px-2.5 py-1 rounded-xl bg-white border border-[#D6E0D3] text-[#4E6746] hover:bg-[#FAF9F6] transition-colors flex items-center space-x-1 shadow-2xs"
              >
                <Sliders className="w-3 h-3" />
                <span>Thay đổi</span>
              </button>
            )}
          </div>

          {/* Topics badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#8FA189] text-white">
              Cấp độ {preferences.level}
            </span>
            {preferences.topics?.map((topicId) => {
              const topicMeta = TOPIC_OPTIONS.find((t) => t.id === topicId);
              return (
                <span
                  key={topicId}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#D6E0D3] text-[#5C574F] font-medium"
                >
                  {topicMeta?.icon} {topicMeta?.label || topicId}
                </span>
              );
            })}
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#D6E0D3] text-[#C27D63] font-bold">
              🎯 {preferences.dailyGoal} từ/ngày
            </span>
          </div>
        </div>
      )}

      {/* Learning Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-[#EAEFE8] border border-[#D6E0D3] text-center">
          <div className="text-xl font-serif font-bold text-[#4E6746]">
            {masteredCount}
          </div>
          <div className="text-[10px] font-bold text-[#5C574F] uppercase tracking-wider mt-0.5">
            Đã thuộc
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#FBF2EE] border border-[#F2D7CD] text-center">
          <div className="text-xl font-serif font-bold text-[#C27D63]">
            {learningCount}
          </div>
          <div className="text-[10px] font-bold text-[#8A8479] uppercase tracking-wider mt-0.5">
            Đang ôn
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-[#E0DBCF] text-center">
          <div className="text-xl font-serif font-bold text-[#3D3934]">
            {cards.length}
          </div>
          <div className="text-[10px] font-bold text-[#8A8479] uppercase tracking-wider mt-0.5">
            Tổng số thẻ
          </div>
        </div>
      </div>

      {/* Streak & Daily Habit Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#E0DBCF] shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#FBF2EE] text-[#C27D63] flex items-center justify-center">
            <Flame className="w-5 h-5 fill-[#C27D63]" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-[#3D3934]">
              Chuỗi học liên tục
            </h4>
            <p className="text-xs text-[#8A8479]">
              Bạn đang giữ phong độ <strong className="text-[#C27D63]">{progress.dailyStreak} ngày</strong>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-[#4E6746] bg-[#EAEFE8] border border-[#D6E0D3] px-2.5 py-1 rounded-full">
            Mục tiêu {progress.todayCardsReviewed}/{progress.dailyGoal}
          </span>
        </div>
      </div>

      {/* Decks List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-serif font-bold text-[#5C574F] uppercase tracking-wider">
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
                    ? 'border-[#8FA189] bg-[#EAEFE8]/50 shadow-xs ring-1 ring-[#8FA189]/40'
                    : 'border-[#E0DBCF] bg-white hover:border-[#D6E0D3]'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-serif font-bold text-[#3D3934] truncate">
                      {deck.title}
                    </h4>
                    {deck.isDaily && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#EAEFE8] text-[#4E6746] shrink-0 border border-[#D6E0D3]">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#8A8479] truncate mt-0.5">
                    {deck.topic} • <span className="font-semibold text-[#5C574F]">{deck.level}</span>
                  </p>

                  <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-[#8A8479]">
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-[#8A8479]" />
                      <span>{deckCards.length} thẻ</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#4E6746] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{deckMastered} đã thuộc</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {isActive ? (
                    <span className="text-[10px] font-serif font-bold px-2.5 py-1 rounded-lg bg-[#8FA189] text-white">
                      Đang học
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDeck(deck.id);
                      }}
                      className="text-[10px] font-serif font-semibold px-2.5 py-1 rounded-lg bg-[#F5F2ED] hover:bg-[#EAEFE8] hover:text-[#4E6746] text-[#5C574F]"
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
                      className="p-1.5 rounded-lg text-[#8A8479] hover:text-[#C27D63] hover:bg-[#FBF2EE]"
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
