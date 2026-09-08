import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, AlertCircle, Volume2, Loader2 } from 'lucide-react';
import { Flashcard, SentenceCheckResult } from '../types';
import { speakEnglish } from '../utils/speech';

interface PracticeSentenceModalProps {
  card: Flashcard | null;
  onClose: () => void;
}

export const PracticeSentenceModal: React.FC<PracticeSentenceModalProps> = ({
  card,
  onClose,
}) => {
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentenceCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!card) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentence.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/check-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: card.word,
          userSentence: sentence.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Lỗi kiểm tra câu từ Gemini');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Không thể kết nối với Gemini');
    } finally {
      setLoading(false);
    }
  };

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
                Luyện đặt câu với AI Gemini
              </h3>
              <p className="text-[11px] text-[#8A8479]">
                Từ khóa: <strong className="text-[#8FA189] font-serif">{card.word}</strong> ({card.vietnameseMeaning})
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

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-serif font-bold text-[#5C574F] mb-1 uppercase tracking-wider">
                Hãy viết một câu tiếng Anh sử dụng &quot;{card.word}&quot;:
              </label>
              <textarea
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder={`Ví dụ: When I feel overwhelmed, I like to...`}
                rows={3}
                className="w-full text-sm p-3 rounded-xl border border-[#E0DBCF] focus:outline-none focus:ring-2 focus:ring-[#8FA189]/20 focus:border-[#8FA189] bg-white text-[#3D3934] placeholder:text-[#8A8479] transition-all resize-none"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !sentence.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#8FA189] hover:bg-[#7D8F77] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-[#8FA189]/20 active:scale-98 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini đang chấm điểm & nhận xét...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Chấm câu với Gemini AI</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-[#FBF2EE] border border-[#F2D7CD] text-[#C27D63] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-2xl bg-white border border-[#E0DBCF] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {result.isCorrect ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAEFE8] text-[#4E6746] border border-[#D6E0D3] text-xs font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#8FA189]" />
                      <span>Câu đúng & tự nhiên</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FBF2EE] text-[#C27D63] border border-[#F2D7CD] text-xs font-bold flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 text-[#C27D63]" />
                      <span>Cần chỉnh sửa</span>
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F5F2ED] text-[#5C574F] border border-[#E0DBCF]">
                  Điểm: {result.score}/10
                </div>
              </div>

              {/* Correction */}
              <div>
                <p className="text-[11px] font-serif font-bold text-[#8A8479] uppercase tracking-wider">
                  Câu chuẩn:
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs font-serif font-bold text-[#3D3934] italic">
                    &ldquo;{result.correction}&rdquo;
                  </p>
                  <button
                    onClick={() => speakEnglish(result.correction)}
                    className="p-1 text-[#8FA189] hover:text-[#7D8F77]"
                    title="Nghe câu chuẩn"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Explanation in Vietnamese */}
              <div>
                <p className="text-[11px] font-serif font-bold text-[#8A8479] uppercase tracking-wider">
                  Nhận xét của Gemini:
                </p>
                <p className="text-xs text-[#5C574F] mt-0.5 leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Better alternative */}
              {result.betterAlternative && (
                <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#F0EDE6]">
                  <p className="text-[11px] font-semibold text-[#8FA189] flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-[#8FA189]" />
                    <span>Cách nói tự nhiên hơn của người bản xứ:</span>
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-serif text-[#4A453F] italic">
                      &ldquo;{result.betterAlternative}&rdquo;
                    </p>
                    <button
                      onClick={() => speakEnglish(result.betterAlternative)}
                      className="p-1 text-[#8A8479] hover:text-[#8FA189]"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
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
