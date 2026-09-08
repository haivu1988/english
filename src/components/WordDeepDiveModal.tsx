import React, { useEffect, useState } from 'react';
import { X, Sparkles, AlertTriangle, MessageSquare, BookOpen, Loader2, Volume2 } from 'lucide-react';
import { Flashcard, WordDeepDiveResult } from '../types';
import { speakEnglish } from '../utils/speech';

interface WordDeepDiveModalProps {
  card: Flashcard | null;
  onClose: () => void;
}

export const WordDeepDiveModal: React.FC<WordDeepDiveModalProps> = ({
  card,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WordDeepDiveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!card) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setData(null);

    fetch('/api/word-deep-dive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: card.word,
        meaning: card.vietnameseMeaning,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải thông tin từ Gemini');
        return res.json();
      })
      .then((resData) => {
        if (isMounted) setData(resData);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Lỗi kết nối');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [card]);

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#3D3934]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF9F6] rounded-t-3xl sm:rounded-[28px] max-h-[90vh] flex flex-col shadow-2xl border border-[#E0DBCF] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#E0DBCF] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAEFE8] text-[#8FA189] flex items-center justify-center border border-[#D6E0D3]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#3D3934]">
                Phân tích sâu từ vựng với AI
              </h3>
              <p className="text-[11px] text-[#8A8479]">
                <strong className="text-[#8FA189] font-serif">{card.word}</strong>{' '}
                <span className="font-mono text-[10px] text-[#8A8479]">{card.phonetic}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8A8479] hover:text-[#3D3934] hover:bg-[#EBE7DF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-7 h-7 text-[#8FA189] animate-spin" />
              <p className="text-xs text-[#5C574F] font-medium text-center max-w-xs">
                Gemini đang phân tích sắc thái ngữ nghĩa & lỗi người học thường gặp...
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63] text-xs">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-3.5">
              {/* Nuances */}
              <div className="p-3.5 rounded-2xl bg-[#EAEFE8] border border-[#D6E0D3]">
                <div className="flex items-center space-x-1.5 text-xs font-serif font-bold text-[#4E6746] mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#8FA189]" />
                  <span>Sắc thái ngữ nghĩa (Nuance):</span>
                </div>
                <p className="text-xs text-[#3D3934] leading-relaxed">
                  {data.nuance}
                </p>
              </div>

              {/* Common Vietnamese Mistake */}
              <div className="p-3.5 rounded-2xl bg-[#FBF2EE] border border-[#F2D7CD]">
                <div className="flex items-center space-x-1.5 text-xs font-serif font-bold text-[#C27D63] mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C27D63]" />
                  <span>Lỗi người Việt hay mắc phải:</span>
                </div>
                <p className="text-xs text-[#5C574F] leading-relaxed">
                  {data.commonMistake}
                </p>
              </div>

              {/* Synonyms & Differences */}
              {data.synonyms && data.synonyms.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#E0DBCF] shadow-xs">
                  <p className="text-xs font-serif font-bold text-[#3D3934] mb-2 uppercase tracking-wider">
                    Từ đồng nghĩa & điểm khác biệt:
                  </p>
                  <div className="space-y-2">
                    {data.synonyms.map((syn, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-serif font-bold text-[#8FA189]">
                          {syn.word}:
                        </span>{' '}
                        <span className="text-[#5C574F]">{syn.difference}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dialogue Context */}
              {data.dialogue && data.dialogue.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#F0EDE6]">
                  <div className="flex items-center space-x-1.5 text-xs font-serif font-bold text-[#3D3934] mb-2 uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5 text-[#8FA189]" />
                    <span>Hội thoại thực tế:</span>
                  </div>
                  <div className="space-y-2.5">
                    {data.dialogue.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-semibold text-[#3D3934]">
                            {item.speaker}: &ldquo;{item.en}&rdquo;
                          </span>
                          <button
                            onClick={() => speakEnglish(item.en)}
                            className="p-1 text-[#8A8479] hover:text-[#8FA189]"
                            title="Nghe hội thoại"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#8A8479] italic mt-0.5">
                          {item.vi}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
