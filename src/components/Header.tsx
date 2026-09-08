import React from 'react';
import { Sparkles, Flame, CheckCircle2, Cloud, RefreshCw, User as UserIcon } from 'lucide-react';
import { UserProgress } from '../types';
import { User } from '../lib/firebase';

interface HeaderProps {
  progress: UserProgress;
  activeDeckTitle?: string;
  user: User | null;
  isSyncing: boolean;
  onOpenCloudModal: () => void;
  userLevel?: string;
  onOpenPreferences?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  activeDeckTitle,
  user,
  isSyncing,
  onOpenCloudModal,
  userLevel = 'B1-B2',
  onOpenPreferences,
}) => {
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
    <header className="bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E0DBCF] sticky top-0 z-30 px-4 py-2.5 shadow-xs">
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
              {onOpenPreferences && (
                <button
                  onClick={onOpenPreferences}
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAEFE8] text-[#4E6746] border border-[#D6E0D3] hover:bg-[#DCE6D9] transition-colors flex items-center space-x-1"
                  title="Bấm để đổi Trình độ & Chủ đề học"
                >
                  <span>{userLevel}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#8A8479] capitalize mt-0.5 font-sans">
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* Cloud Sync, Streak & Today's Goal */}
        <div className="flex items-center space-x-1.5">
          {/* Cloud Sync Status Indicator */}
          <button
            onClick={onOpenCloudModal}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all border ${
              isSyncing
                ? 'bg-[#FAF9F6] border-[#8FA189] text-[#8FA189]'
                : user && !user.isAnonymous
                ? 'bg-[#EAEFE8] border-[#D6E0D3] text-[#4E6746]'
                : 'bg-white border-[#E0DBCF] text-[#5C574F] hover:bg-[#FAF9F6]'
            }`}
            title="Đồng bộ đám mây (Firestore)"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8FA189]" />
            ) : user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-[#8FA189]" />
            )}
            <span className="text-[11px] font-medium hidden sm:inline">
              {isSyncing ? 'Đang lưu' : 'Đám mây'}
            </span>
          </button>

          <div
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63]"
            title="Chuỗi ngày học liên tục"
          >
            <Flame className="w-3.5 h-3.5 text-[#C27D63] fill-[#C27D63] animate-pulse" />
            <span className="text-xs font-bold">{progress.dailyStreak}</span>
          </div>

          <div
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-[#EAEFE8] border border-[#D6E0D3] text-[#4E6746] text-xs font-semibold"
            title="Mục tiêu thẻ học hôm nay"
          >
            <CheckCircle2 className="w-3 h-3 text-[#8FA189]" />
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
