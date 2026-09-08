import React from 'react';
import { Layers, RotateCcw, Sparkles, BookMarked, User } from 'lucide-react';

export type NavTab = 'learn' | 'review' | 'generate' | 'library' | 'account';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  reviewCount: number;
  userAvatarUrl?: string | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  reviewCount,
  userAvatarUrl,
}) => {
  const tabs = [
    {
      id: 'learn' as NavTab,
      label: 'Học thẻ',
      icon: Layers,
    },
    {
      id: 'review' as NavTab,
      label: 'Ôn tập',
      icon: RotateCcw,
      badge: reviewCount > 0 ? reviewCount : undefined,
    },
    {
      id: 'generate' as NavTab,
      label: 'Tạo thẻ AI',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'library' as NavTab,
      label: 'Sổ từ',
      icon: BookMarked,
    },
    {
      id: 'account' as NavTab,
      label: 'Tài khoản',
      icon: User,
      avatar: userAvatarUrl,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-lg border-t border-[#E0DBCF] safe-bottom shadow-lg">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#8FA189] font-semibold'
                  : 'text-[#8A8479] hover:text-[#5C574F]'
              }`}
            >
              <div className="relative">
                {tab.avatar ? (
                  <img
                    src={tab.avatar}
                    alt="User Avatar"
                    className={`w-5 h-5 rounded-full object-cover transition-transform duration-200 ${
                      isActive ? 'scale-115 ring-2 ring-[#8FA189]' : 'opacity-80'
                    }`}
                  />
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                    }`}
                  />
                )}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C27D63] text-[10px] text-white font-bold flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && !isActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#C27D63] animate-ping" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#8FA189] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
