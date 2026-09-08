import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, BookOpen, AlertCircle, Wand2, Check } from 'lucide-react';
import { Deck, Flashcard, EnglishLevel, UserPreferences } from '../types';

interface GenerateDeckSectionProps {
  existingWords: string[];
  onDeckCreated: (newDeck: Deck, newCards: Flashcard[]) => void;
  userPreferences?: UserPreferences;
}

const TOPIC_PRESETS = [
  { id: 'daily', label: '🗣️ Giao tiếp hàng ngày', topic: 'Giao tiếp đời sống thường nhật & bạn bè' },
  { id: 'work', label: '💼 Tiếng Anh công sở', topic: 'Giao tiếp công sở, email & họp hành' },
  { id: 'travel', label: '✈️ Du lịch & Sân bay', topic: 'Từ vựng và mẫu câu du lịch, sân bay, khách sạn' },
  { id: 'ielts', label: '🎯 IELTS Band 7+', topic: 'Từ vựng học thuật IELTS nâng cao và collocation hay' },
  { id: 'cafe', label: '☕ Nhà hàng & Cafe', topic: 'Gọi món tại quán cà phê, nhà hàng và ẩm thực' },
  { id: 'tech', label: '💻 Công nghệ & IT', topic: 'Thuật ngữ công nghệ, lập trình và phần mềm' },
  { id: 'idioms', label: '💬 Thành ngữ tự nhiên', topic: 'Thành ngữ (idioms) và cụm động từ người bản xứ hay dùng' },
];

export const GenerateDeckSection: React.FC<GenerateDeckSectionProps> = ({
  existingWords,
  onDeckCreated,
  userPreferences,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    if (userPreferences?.topics && userPreferences.topics.length > 0) {
      const match = TOPIC_PRESETS.find((p) => userPreferences.topics.includes(p.id));
      if (match) return match.id;
    }
    return 'daily';
  });
  const [customTopic, setCustomTopic] = useState('');
  const [level, setLevel] = useState<EnglishLevel | string>(userPreferences?.level || 'B1-B2');
  const [cardCount, setCardCount] = useState<number>(userPreferences?.dailyGoal || 6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state if user preferences change
  useEffect(() => {
    if (userPreferences?.level) {
      setLevel(userPreferences.level);
    }
    if (userPreferences?.dailyGoal) {
      setCardCount(userPreferences.dailyGoal);
    }
  }, [userPreferences]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const activeTopic =
      customTopic.trim() ||
      TOPIC_PRESETS.find((p) => p.id === selectedPreset)?.topic ||
      'Giao tiếp hàng ngày';

    try {
      const response = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          level,
          count: cardCount,
          existingWords,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Lỗi khi gọi Gemini tạo thẻ');
      }

      const data = await response.json();
      const todayStr = new Date().toISOString().split('T')[0];
      const deckId = `deck-${Date.now()}`;

      const newDeck: Deck = {
        id: deckId,
        title: data.topicTitle || activeTopic,
        topic: activeTopic,
        level: data.level || level,
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

      onDeckCreated(newDeck, newCards);
      if (data.isCuratedFallback) {
        setSuccessMsg(`Đã tạo bộ ${newCards.length} thẻ từ chất lượng cao (từ thư viện chuẩn trong khi AI đang tải)!`);
      } else {
        setSuccessMsg(`Đã tạo thành công ${newCards.length} thẻ từ mới với Gemini!`);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Hệ thống AI đang tiếp nhận lượng truy cập cao, vui lòng thử lại sau ít giây.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 space-y-4">
      {/* Title Card */}
      <div className="p-5 rounded-[28px] bg-[#5C574F] text-[#F5F2ED] shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#8FA189] text-white text-[11px] font-semibold mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Gemini Trợ Giảng</span>
          </div>
          <h2 className="text-lg font-serif italic font-bold tracking-tight text-white">
            Tạo thẻ bài học tiếng Anh mỗi ngày
          </h2>
          <p className="text-xs text-[#F5F2ED]/85 mt-1.5 leading-relaxed">
            Gemini sẽ biên soạn bộ thẻ kèm phiên âm IPA, giải nghĩa chuẩn, ví dụ thực tế và mẹo ghi nhớ nhanh theo tông giọng tự nhiên.
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-[#8FA189]/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Preset Topics */}
      <div className="space-y-2">
        <label className="block text-xs font-serif font-bold text-[#5C574F] uppercase tracking-wider">
          1. Chọn chủ đề gợi ý:
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TOPIC_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id && !customTopic.trim();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset.id);
                  setCustomTopic('');
                }}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#8FA189] bg-[#EAEFE8] text-[#3D3934] shadow-xs ring-1 ring-[#8FA189]/30'
                    : 'border-[#E0DBCF] bg-white text-[#5C574F] hover:border-[#8FA189]/60 hover:bg-[#FAF9F6]'
                }`}
              >
                <span className="truncate">{preset.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#8FA189] shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Topic Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-serif font-bold text-[#5C574F] uppercase tracking-wider">
          Hoặc tự nhập chủ đề theo sở thích của bạn:
        </label>
        <div className="relative">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Ví dụ: Phỏng vấn xin visa, Đi siêu thị sắm Tết, Nấu ăn..."
            className="w-full text-xs p-3 rounded-xl border border-[#E0DBCF] focus:outline-none focus:ring-2 focus:ring-[#8FA189]/20 focus:border-[#8FA189] bg-white text-[#3D3934] placeholder:text-[#8A8479]"
          />
        </div>
      </div>

      {/* Level Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-serif font-bold text-[#5C574F] uppercase tracking-wider">
          2. Trình độ mong muốn:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'A1-A2', title: 'A1-A2', sub: 'Cơ bản' },
              { id: 'B1-B2', title: 'B1-B2', sub: 'Trung cấp' },
              { id: 'C1-C2', title: 'C1-C2', sub: 'Nâng cao' },
              { id: 'IELTS', title: 'IELTS', sub: 'Band 7+' },
              { id: 'TOEIC', title: 'TOEIC', sub: '750-900' },
              { id: 'Business', title: 'Business', sub: 'Đi làm' },
            ] as const
          ).map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setLevel(lvl.id)}
              className={`p-2 rounded-xl border text-center transition-all ${
                level === lvl.id
                  ? 'border-[#8FA189] bg-[#8FA189] text-white font-bold shadow-xs'
                  : 'border-[#E0DBCF] bg-white text-[#5C574F] hover:border-[#8FA189]/50'
              }`}
            >
              <div className="text-xs">{lvl.title}</div>
              <div className={`text-[10px] font-normal ${level === lvl.id ? 'text-[#FAF9F6]/80' : 'text-[#8A8479]'}`}>
                {lvl.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Card Count */}
      <div className="space-y-1.5">
        <label className="block text-xs font-serif font-bold text-[#5C574F] uppercase tracking-wider">
          3. Số lượng thẻ muốn học hôm nay:
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[4, 6, 8, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setCardCount(num)}
              className={`py-2 rounded-xl border text-center text-xs font-bold transition-all ${
                cardCount === num
                  ? 'border-[#8FA189] bg-[#8FA189] text-white shadow-xs'
                  : 'border-[#E0DBCF] bg-white text-[#5C574F] hover:border-[#8FA189]/50'
              }`}
            >
              {num} thẻ
            </button>
          ))}
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="p-3 rounded-xl bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-[#EAEFE8] border border-[#D6E0D3] text-[#4E6746] text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0 text-[#8FA189]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Generate Action Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleGenerate}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#8FA189] hover:bg-[#7D8F77] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#8FA189]/25 active:scale-98 transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gemini AI đang soạn thẻ bài học...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            <span>Tạo bộ thẻ với Gemini AI</span>
          </>
        )}
      </button>
    </div>
  );
};
