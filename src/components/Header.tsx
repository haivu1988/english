import React from 'react';
import { Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { UserProgress } from '../types';

interface HeaderProps {
  progress: UserProgress;
  activeDeckTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ progress, activeDeckTitle }) => {
  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  }).format(new Date());

  const progressPercent = Math.min(
    100,
    Math.round((progress.todayCardsReviewed / (progress.dailyGoal || 6)) * 100)
  );

  return (
    <header className="bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E0DBCF] sticky top-0 z-30 px-4 py-3 shadow-xs">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#8FA189] flex items-center justify-center text-white shadow-xs font-serif font-bold text-lg">
            L
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-serif font-bold italic text-[#3D3934] tracking-tight leading-none">
                Linguist Flashcards
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EBE7DF] text-[#6B655B] border border-[#DED9CE]">
                Gemini
              </span>
            </div>
            <p className="text-xs text-[#8A8479] capitalize mt-0.5 font-sans">
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* Streak & Today's Goal */}
        <div className="flex items-center space-x-2">
          <div
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63]"
            title="Chuỗi ngày học liên tục"
          >
            <Flame className="w-4 h-4 text-[#C27D63] fill-[#C27D63] animate-pulse" />
            <span className="text-xs font-bold">{progress.dailyStreak} ngày</span>
          </div>

          <div
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#EAEFE8] border border-[#D6E0D3] text-[#4E6746] text-xs font-semibold"
            title="Mục tiêu thẻ học hôm nay"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8FA189]" />
            <span>
              {progress.todayCardsReviewed}/{progress.dailyGoal}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Progress Bar for today */}
      <div className="max-w-md mx-auto mt-2.5">
        <div className="w-full bg-[#E0DBCF] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#8FA189] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
};
