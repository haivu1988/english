import React, { useState } from 'react';
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Lightbulb,
  Sparkles,
  PenTool,
  Check,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Flashcard, MasteryLevel } from '../types';
import { speakEnglish } from '../utils/speech';

interface FlashcardViewerProps {
  cards: Flashcard[];
  onGradeCard: (cardId: string, level: MasteryLevel) => void;
  onOpenPractice: (card: Flashcard) => void;
  onOpenDeepDive: (card: Flashcard) => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  cards,
  onGradeCard,
  onOpenPractice,
  onOpenDeepDive,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[350px]">
        <div className="w-16 h-16 rounded-2xl bg-[#EAEFE8] flex items-center justify-center text-[#8FA189] mb-4 border border-[#D6E0D3]">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-serif font-bold text-[#3D3934]">
          Chưa có thẻ từ vựng nào
        </h3>
        <p className="text-xs text-[#8A8479] mt-1 max-w-xs leading-relaxed">
          Hãy nhấn vào tab &quot;Tạo thẻ AI&quot; để Gemini tạo cho bạn các thẻ bài học mới nhé!
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, cards.length - 1);
  const currentCard = cards[safeIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentIndex(randomIndex);
  };

  const handleGrade = (level: MasteryLevel) => {
    onGradeCard(currentCard.id, level);
    handleNext();
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    speakEnglish(text);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 flex flex-col items-center">
      {/* Top Controls: Deck Counter & Shuffle */}
      <div className="w-full flex items-center justify-between text-xs text-[#8A8479] mb-3 px-1">
        <span className="font-semibold bg-[#EBE7DF] text-[#5C574F] border border-[#DED9CE] px-3 py-1 rounded-full text-[11px] tracking-wide">
          Thẻ {safeIndex + 1} / {cards.length}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-lg text-[#6B655B] hover:text-[#3D3934] hover:bg-[#EBE7DF] active:scale-95 transition-all flex items-center space-x-1"
            title="Đảo thẻ ngẫu nhiên"
          >
            <Shuffle className="w-4 h-4 text-[#8FA189]" />
            <span className="text-[11px] font-medium">Đảo thẻ</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="w-full h-[400px] perspective-1000 cursor-pointer select-none relative"
        onClick={handleFlipCard}
      >
        {/* Subtle decorative stacked card effect in background */}
        <div className="w-full h-full bg-[#FAF9F6] rounded-[28px] border border-[#E0DBCF] transform rotate-1.5 absolute opacity-40 shadow-md"></div>
        <div className="w-full h-full bg-[#FAF9F6] rounded-[28px] border border-[#E0DBCF] transform -rotate-1 absolute opacity-70 shadow-md"></div>

        <div
          className={`relative z-10 w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white border border-[#E0DBCF] rounded-[28px] shadow-xl p-6 flex flex-col justify-between">
            {/* Front Header */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#F5F2ED] text-[#6B655B] border border-[#E0DBCF]">
                {currentCard.partOfSpeech || 'Word'}
              </span>

              {/* Status pill */}
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  currentCard.masteryLevel === 'mastered'
                    ? 'bg-[#EAEFE8] text-[#4E6746] border-[#D6E0D3]'
                    : currentCard.masteryLevel === 'learning'
                    ? 'bg-[#FBF2EE] text-[#C27D63] border-[#F2D7CD]'
                    : 'bg-[#F5F2ED] text-[#8A8479] border-[#E0DBCF]'
                }`}
              >
                {currentCard.masteryLevel === 'mastered'
                  ? 'Đã thuộc'
                  : currentCard.masteryLevel === 'learning'
                  ? 'Đang học'
                  : 'Từ mới'}
              </span>
            </div>

            {/* Front Center: Word & Pronunciation */}
            <div className="flex flex-col items-center justify-center my-auto text-center px-2">
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#3D3934] tracking-tight leading-tight">
                {currentCard.word}
              </h2>

              <div className="mt-3 flex items-center space-x-2">
                <span className="text-base text-[#8FA189] font-mono">
                  {currentCard.phonetic}
                </span>
                <button
                  onClick={(e) => handleSpeak(e, currentCard.word)}
                  className="p-2 rounded-full bg-[#EAEFE8] text-[#5C6E56] hover:bg-[#DCE7D9] active:scale-95 transition-all border border-[#D6E0D3]"
                  title="Nghe phát âm chuẩn"
                  aria-label="Phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Decorative divider */}
              <div className="h-px w-14 bg-[#E0DBCF] my-4"></div>

              {/* Memory preview or collocation */}
              {currentCard.collocations && currentCard.collocations.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
                  {currentCard.collocations.slice(0, 2).map((col, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] text-[#6B655B] bg-[#F5F2ED] border border-[#E0DBCF] px-2.5 py-0.5 rounded-lg"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Front Footer: Tap Hint */}
            <div className="flex items-center justify-center space-x-1.5 text-[#8A8479] text-xs pt-2 border-t border-[#F0EDE6]">
              <RotateCw className="w-3.5 h-3.5 text-[#8FA189]" />
              <span>Chạm thẻ để xem nghĩa & ví dụ</span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white border border-[#E0DBCF] rounded-[28px] shadow-xl p-5 flex flex-col justify-between overflow-y-auto">
            {/* Back Header */}
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E0DBCF]">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-serif font-bold text-[#3D3934]">
                    {currentCard.word}
                  </span>
                  <span className="text-xs text-[#8FA189] font-mono">
                    {currentCard.phonetic}
                  </span>
                </div>
                <button
                  onClick={(e) => handleSpeak(e, currentCard.word)}
                  className="p-1.5 rounded-full bg-[#EAEFE8] text-[#5C6E56] hover:bg-[#DCE7D9] active:scale-95 transition-all border border-[#D6E0D3]"
                  title="Phát âm"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Meaning */}
              <div className="mt-3">
                <p className="text-base font-serif italic font-semibold text-[#5C574F] leading-snug">
                  ({currentCard.partOfSpeech}) {currentCard.vietnameseMeaning}
                </p>
              </div>

              {/* Example Sentence */}
              <div className="mt-3 p-3 rounded-2xl bg-[#FDFBF7] border border-[#F0EDE6] text-left">
                <div className="flex items-center space-x-1.5 mb-1 text-[10px] uppercase font-bold text-[#8FA189] tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#8FA189]" />
                  <span>Gemini AI Ví dụ</span>
                </div>
                <div className="flex items-start justify-between">
                  <p className="text-xs font-serif text-[#4A453F] leading-relaxed italic">
                    &ldquo;{currentCard.exampleSentence}&rdquo;
                  </p>
                  <button
                    onClick={(e) => handleSpeak(e, currentCard.exampleSentence)}
                    className="shrink-0 ml-1.5 p-1 text-[#8A8479] hover:text-[#8FA189] transition-colors"
                    title="Nghe cả câu ví dụ"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#8A8479] mt-1.5 leading-normal">
                  {currentCard.exampleTranslation}
                </p>
              </div>

              {/* Memory Tip (AI Mẹo nhớ) */}
              {currentCard.memoryTip && (
                <div className="mt-2.5 p-2.5 rounded-2xl bg-[#FBF2EE]/80 border border-[#F2D7CD] flex items-start space-x-2">
                  <Lightbulb className="w-4 h-4 text-[#C27D63] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#5C574F] leading-snug">
                    <span className="font-bold text-[#C27D63]">Mẹo nhớ AI: </span>
                    {currentCard.memoryTip}
                  </p>
                </div>
              )}
            </div>

            {/* Back Footer: Quick Flip Back */}
            <div className="flex items-center justify-center space-x-1 text-[#8A8479] text-[11px] pt-1 border-t border-[#F0EDE6]">
              <RotateCw className="w-3 h-3 text-[#8A8479]" />
              <span>Chạm thẻ để quay lại</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows & Spaced Repetition Grading */}
      <div className="w-full mt-4 flex flex-col space-y-3">
        {/* Navigation & AI Actions row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            className="flex-1 py-2 px-3 rounded-xl bg-[#EBE7DF] hover:bg-[#E0DBCF] text-[#4A453F] font-semibold text-xs flex items-center justify-center space-x-1 border border-[#DED9CE] active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>

          {/* Quick AI Practice */}
          <button
            onClick={() => onOpenPractice(currentCard)}
            className="py-2 px-3 rounded-xl bg-[#EAEFE8] hover:bg-[#DCE7D9] text-[#4E6746] font-semibold text-xs flex items-center justify-center space-x-1 border border-[#D6E0D3] active:scale-95 transition-all"
            title="Luyện đặt câu với Gemini AI"
          >
            <PenTool className="w-3.5 h-3.5 text-[#8FA189]" />
            <span>Đặt câu AI</span>
          </button>

          {/* Quick AI Deep Dive */}
          <button
            onClick={() => onOpenDeepDive(currentCard)}
            className="py-2 px-3 rounded-xl bg-[#FBF2EE] hover:bg-[#F5E5DF] text-[#C27D63] font-semibold text-xs flex items-center justify-center space-x-1 border border-[#F2D7CD] active:scale-95 transition-all"
            title="Hỏi sâu từ này với Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C27D63]" />
            <span>Hỏi sâu</span>
          </button>

          <button
            onClick={handleNext}
            className="flex-1 py-2 px-3 rounded-xl bg-[#EBE7DF] hover:bg-[#E0DBCF] text-[#4A453F] font-semibold text-xs flex items-center justify-center space-x-1 border border-[#DED9CE] active:scale-95 transition-all"
          >
            <span>Sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Spaced Repetition Grading Buttons */}
        <div className="pt-1">
          <p className="text-[11px] text-center text-[#8A8479] font-medium mb-1.5 uppercase tracking-wider">
            Mức độ ghi nhớ:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleGrade('learning')}
              className="py-2.5 px-2 rounded-2xl bg-[#FBF2EE] hover:bg-[#F5E5DF] text-[#C27D63] border border-[#F2D7CD] font-semibold text-xs flex flex-col items-center justify-center active:scale-95 transition-all shadow-xs"
            >
              <HelpCircle className="w-4 h-4 text-[#C27D63] mb-0.5" />
              <span>Chưa nhớ</span>
              <span className="text-[9px] font-normal text-[#C27D63]/80">Ôn lại sớm</span>
            </button>

            <button
              onClick={() => handleGrade('review')}
              className="py-2.5 px-2 rounded-2xl bg-[#F8F5EE] hover:bg-[#EFE9DD] text-[#8C6D3B] border border-[#E2D8C3] font-semibold text-xs flex flex-col items-center justify-center active:scale-95 transition-all shadow-xs"
            >
              <RotateCw className="w-4 h-4 text-[#8C6D3B] mb-0.5" />
              <span>Nhớ vừa</span>
              <span className="text-[9px] font-normal text-[#8C6D3B]/80">Cần ôn thêm</span>
            </button>

            <button
              onClick={() => handleGrade('mastered')}
              className="py-2.5 px-2 rounded-2xl bg-[#EAEFE8] hover:bg-[#DCE7D9] text-[#4E6746] border border-[#D6E0D3] font-semibold text-xs flex flex-col items-center justify-center active:scale-95 transition-all shadow-xs"
            >
              <Check className="w-4 h-4 text-[#8FA189] mb-0.5" />
              <span>Đã thuộc</span>
              <span className="text-[9px] font-normal text-[#4E6746]/80">Nắm vững</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
