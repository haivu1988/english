import React from 'react';
import { X } from 'lucide-react';
import { User } from '../lib/firebase';
import { UserProgress, UserPreferences } from '../types';
import { AccountSection } from './AccountSection';

interface CloudAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  cardCount: number;
  deckCount: number;
  progress: UserProgress;
  preferences?: UserPreferences;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  onManualSync: () => Promise<void>;
  onSignOut?: () => Promise<void> | void;
  onOpenPreferences?: () => void;
}

export const CloudAccountModal: React.FC<CloudAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  cardCount,
  deckCount,
  progress,
  preferences,
  isSyncing,
  lastSyncedAt,
  onManualSync,
  onSignOut,
  onOpenPreferences,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#3D3934]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF9F6] rounded-t-3xl sm:rounded-[28px] max-h-[92vh] flex flex-col shadow-2xl border border-[#E0DBCF] overflow-hidden">
        {/* Modal Header Bar */}
        <div className="px-4 py-3 border-b border-[#E0DBCF] flex items-center justify-between bg-[#FAF9F6] shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAEFE8] text-[#4E6746] flex items-center justify-center font-serif font-bold text-xs">
              L
            </div>
            <h3 className="text-xs font-serif font-bold text-[#3D3934]">
              Tài khoản & Lưu trữ đám mây
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8A8479] hover:text-[#3D3934] hover:bg-[#EBE7DF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 pb-4">
          <AccountSection
            user={user}
            cardCount={cardCount}
            deckCount={deckCount}
            progress={progress}
            preferences={preferences}
            isSyncing={isSyncing}
            lastSyncedAt={lastSyncedAt}
            onManualSync={onManualSync}
            onSignOut={onSignOut}
            onOpenPreferences={() => {
              onClose();
              if (onOpenPreferences) onOpenPreferences();
            }}
          />
        </div>
      </div>
    </div>
  );
};
