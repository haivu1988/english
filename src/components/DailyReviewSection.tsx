import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Play,
  Volume2,
  Trophy,
  ArrowRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Flashcard, MasteryLevel } from '../types';
import { speakEnglish } from '../utils/speech';

interface DailyReviewSectionProps {
  cards: Flashcard[];
  onGradeCard: (cardId: string, level: MasteryLevel) => void;
  onSwitchToLearn: (cardId?: string) => void;
}

export const DailyReviewSection: React.FC<DailyReviewSectionProps> = ({
  cards,
  onGradeCard,
  onSwitchToLearn,
}) => {
  const [activeTab, setActiveTab] = useState<'review-cards' | 'quiz' | 'all'>('review-cards');
  const [searchQuery, setSearchQuery] = useState('');

  // Cards that need review (learning or review status, or cards with reviewCount < 2)
  const needsReviewCards = cards.filter(
    (c) => c.masteryLevel === 'learning' || c.masteryLevel === 'review' || c.masteryLevel === 'new'
  );

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Prepare a random quiz question from available cards
  const quizCards = cards.length >= 4 ? cards : [];
  const currentQuizCard = quizCards[quizIndex];

  // Generate 4 options (1 correct + 3 random distractors)
  const getOptions = (correctCard: Flashcard) => {
    const distractors = cards
      .filter((c) => c.id !== correctCard.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((c) => c.vietnameseMeaning);

    const all = [correctCard.vietnameseMeaning, ...distractors].sort(
      () => 0.5 - Math.random()
    );
    return all;
  };

  const [currentOptions, setCurrentOptions] = useState<string[]>(() => {
    if (currentQuizCard) return getOptions(currentQuizCard);
    return [];
  });

  const handleSelectQuizOption = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    if (option === currentQuizCard.vietnameseMeaning) {
      setQuizScore((prev) => prev + 1);
      onGradeCard(currentQuizCard.id, 'mastered');
    } else {
      onGradeCard(currentQuizCard.id, 'learning');
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex + 1 < quizCards.length) {
      const nextIdx = quizIndex + 1;
      setQuizIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setCurrentOptions(getOptions(quizCards[nextIdx]));
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setQuizFinished(false);
    if (quizCards.length > 0) {
      setCurrentOptions(getOptions(quizCards[0]));
    }
  };

  const filteredAllCards = cards.filter(
    (c) =>
      c.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vietnameseMeaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 space-y-4">
      {/* Sub-tab Switcher */}
      <div className="flex rounded-2xl bg-[#EBE7DF] p-1 text-xs font-semibold border border-[#DED9CE]">
        <button
          onClick={() => setActiveTab('review-cards')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'review-cards'
              ? 'bg-white text-[#3D3934] shadow-xs font-serif font-bold'
              : 'text-[#6B655B] hover:text-[#3D3934]'
          }`}
        >
          Cần ôn ({needsReviewCards.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('quiz');
            if (!currentOptions.length && quizCards.length > 0) {
              setCurrentOptions(getOptions(quizCards[0]));
            }
          }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'quiz'
              ? 'bg-white text-[#3D3934] shadow-xs font-serif font-bold'
              : 'text-[#6B655B] hover:text-[#3D3934]'
          }`}
        >
          Trắc nghiệm nhanh
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-white text-[#3D3934] shadow-xs font-serif font-bold'
              : 'text-[#6B655B] hover:text-[#3D3934]'
          }`}
        >
          Tất cả ({cards.length})
        </button>
      </div>

      {/* TAB 1: REVIEW CARDS QUEUE */}
      {activeTab === 'review-cards' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-serif font-bold text-[#5C574F] uppercase tracking-wider">
              Danh sách từ cần củng cố hôm nay
            </h3>
            {needsReviewCards.length > 0 && (
              <button
                onClick={() => onSwitchToLearn(needsReviewCards[0]?.id)}
                className="text-xs font-bold text-[#8FA189] flex items-center space-x-1 hover:text-[#7D8F77]"
              >
                <Play className="w-3 h-3 fill-[#8FA189]" />
                <span>Học ngay</span>
              </button>
            )}
          </div>

          {needsReviewCards.length === 0 ? (
            <div className="p-8 rounded-[28px] bg-[#EAEFE8]/80 border border-[#D6E0D3] text-center flex flex-col items-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#8FA189]" />
              <h4 className="text-sm font-serif font-bold text-[#3D3934]">
                Tuyệt vời! Bạn đã ôn hết các từ hôm nay
              </h4>
              <p className="text-xs text-[#5C574F] max-w-xs leading-relaxed">
                Tất cả từ vựng đều đang ở mức nhớ tốt. Bạn có thể làm trắc nghiệm nhanh hoặc tạo thêm thẻ bài mới!
              </p>
              <button
                onClick={() => setActiveTab('quiz')}
                className="mt-2 py-2 px-4 rounded-xl bg-[#8FA189] hover:bg-[#7D8F77] text-white text-xs font-semibold shadow-md shadow-[#8FA189]/20 transition-colors"
              >
                Làm trắc nghiệm ôn tập
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {needsReviewCards.map((card) => (
                <div
                  key={card.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E0DBCF] shadow-xs flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-serif font-bold text-[#3D3934] truncate">
                        {card.word}
                      </span>
                      <span className="text-[10px] font-mono text-[#8FA189]">
                        {card.phonetic}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#F5F2ED] text-[#6B655B] border border-[#E0DBCF] font-semibold uppercase">
                        {card.partOfSpeech}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C574F] font-medium truncate mt-0.5">
                      {card.vietnameseMeaning}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => speakEnglish(card.word)}
                      className="p-2 rounded-xl text-[#8A8479] hover:text-[#8FA189] hover:bg-[#EAEFE8] transition-colors"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onGradeCard(card.id, 'mastered')}
                      className="p-2 rounded-xl text-[#8FA189] hover:bg-[#EAEFE8] transition-colors"
                      title="Đánh dấu đã thuộc"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MINI QUIZ */}
      {activeTab === 'quiz' && (
        <div className="space-y-3">
          {quizCards.length < 4 ? (
            <div className="p-6 rounded-2xl bg-[#F5F2ED] border border-[#E0DBCF] text-center">
              <HelpCircle className="w-8 h-8 text-[#8A8479] mx-auto mb-2" />
              <p className="text-xs text-[#5C574F] font-medium">
                Cần tối thiểu 4 từ vựng để tạo bài trắc nghiệm nhanh. Hãy tạo thêm thẻ bài nhé!
              </p>
            </div>
          ) : quizFinished ? (
            <div className="p-6 rounded-[28px] bg-white border border-[#E0DBCF] text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#FBF2EE] text-[#C27D63] flex items-center justify-center mx-auto border border-[#F2D7CD]">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-[#3D3934]">
                  Hoàn thành trắc nghiệm!
                </h4>
                <p className="text-xs text-[#6B655B] mt-1">
                  Bạn trả lời đúng{' '}
                  <span className="font-bold text-[#8FA189] text-sm">
                    {quizScore}/{quizCards.length}
                  </span>{' '}
                  câu hỏi.
                </p>
              </div>
              <button
                onClick={handleRestartQuiz}
                className="w-full py-2.5 rounded-xl bg-[#8FA189] hover:bg-[#7D8F77] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-[#8FA189]/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm lại bài trắc nghiệm</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-[28px] bg-white border border-[#E0DBCF] shadow-sm space-y-4">
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs text-[#8A8479]">
                <span className="font-semibold text-[#8FA189]">
                  Câu hỏi {quizIndex + 1} / {quizCards.length}
                </span>
                <span className="bg-[#F5F2ED] border border-[#E0DBCF] text-[#5C574F] px-2.5 py-0.5 rounded-full font-medium">
                  Điểm: {quizScore}
                </span>
              </div>

              {/* Target Word */}
              <div className="py-4 text-center bg-[#FDFBF7] rounded-2xl border border-[#F0EDE6]">
                <p className="text-[10px] text-[#8A8479] font-bold uppercase tracking-widest mb-1">
                  Nghĩa của từ này là gì?
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <h3 className="text-2xl font-serif font-bold text-[#3D3934]">
                    {currentQuizCard.word}
                  </h3>
                  <button
                    onClick={() => speakEnglish(currentQuizCard.word)}
                    className="p-1.5 rounded-full text-[#8FA189] hover:bg-[#EAEFE8]"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs font-mono text-[#8FA189]">
                  {currentQuizCard.phonetic}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentOptions.map((option, idx) => {
                  const isCorrect = option === currentQuizCard.vietnameseMeaning;
                  const isChosen = selectedOption === option;

                  let btnStyle = 'bg-[#FAF9F6] border-[#E0DBCF] text-[#4A453F] hover:bg-[#F5F2ED]';

                  if (isAnswerChecked) {
                    if (isCorrect) {
                      btnStyle = 'bg-[#EAEFE8] border-[#8FA189] text-[#3D3934] font-bold';
                    } else if (isChosen && !isCorrect) {
                      btnStyle = 'bg-[#FBF2EE] border-[#C27D63] text-[#C27D63] font-medium';
                    } else {
                      btnStyle = 'bg-[#FAF9F6]/50 border-[#F0EDE6] text-[#8A8479] opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(option)}
                      disabled={isAnswerChecked}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between active:scale-98 ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswerChecked && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-[#8FA189] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Question Button */}
              {isAnswerChecked && (
                <button
                  onClick={handleNextQuiz}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#8FA189] hover:bg-[#7D8F77] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-[#8FA189]/20 transition-colors"
                >
                  <span>
                    {quizIndex + 1 === quizCards.length ? 'Xem kết quả' : 'Câu tiếp theo'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL CARDS LIST WITH SEARCH */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A8479] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E0DBCF] focus:outline-none focus:ring-2 focus:ring-[#8FA189]/20 focus:border-[#8FA189] bg-white text-[#3D3934] placeholder:text-[#8A8479]"
            />
          </div>

          <div className="space-y-2">
            {filteredAllCards.map((card) => (
              <div
                key={card.id}
                className="p-3 rounded-2xl bg-white border border-[#E0DBCF] shadow-xs flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-serif font-bold text-[#3D3934]">
                      {card.word}
                    </span>
                    <span className="text-[10px] font-mono text-[#8FA189]">
                      {card.phonetic}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B655B] font-medium truncate mt-0.5">
                    {card.vietnameseMeaning}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => speakEnglish(card.word)}
                    className="p-1.5 rounded-lg text-[#8A8479] hover:text-[#8FA189] hover:bg-[#EAEFE8]"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      card.masteryLevel === 'mastered'
                        ? 'bg-[#EAEFE8] text-[#4E6746] border-[#D6E0D3]'
                        : card.masteryLevel === 'learning'
                        ? 'bg-[#FBF2EE] text-[#C27D63] border-[#F2D7CD]'
                        : 'bg-[#F5F2ED] text-[#8A8479] border-[#E0DBCF]'
                    }`}
                  >
                    {card.masteryLevel === 'mastered'
                      ? 'Đã thuộc'
                      : card.masteryLevel === 'learning'
                      ? 'Đang học'
                      : 'Mới'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
