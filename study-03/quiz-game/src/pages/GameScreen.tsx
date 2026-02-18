import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTimer } from '../hooks/useTimer';
import { categoryLabels } from '../data/questions';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import type { Difficulty } from '../types';

const DIFFICULTY_STARS: Record<Difficulty | 'all', string> = {
  easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐', all: '⭐',
};

const CATEGORY_EMOJI: Record<string, string> = {
  all: '🌐', science: '🔬', history: '📜', geography: '🗺️', culture: '🎭',
};

export default function GameScreen() {
  const {
    questions, currentIndex, answers, submitAnswer, nextQuestion,
    settings, isAnswered, lastAnswerCorrect, currentCombo, selectedCategory, selectedDifficulty,
  } = useGameStore();

  const question = questions[currentIndex];
  const startTimeRef = useRef(Date.now());
  const [localAnswer, setLocalAnswer] = useState<number | null>(null);

  // 문제 변경 시 초기화
  useEffect(() => {
    setLocalAnswer(null);
    startTimeRef.current = Date.now();
  }, [currentIndex]);

  // 자동 진행: 정답 1.5초, 오답/타임아웃 3초
  useEffect(() => {
    if (!isAnswered) return;
    const delay = lastAnswerCorrect ? 1500 : 3000;
    const timer = setTimeout(() => nextQuestion(), delay);
    return () => clearTimeout(timer);
  }, [isAnswered, lastAnswerCorrect, nextQuestion]);

  const handleTimeUp = () => {
    if (!isAnswered) {
      setLocalAnswer(-1);
      submitAnswer(-1, settings.timeLimit);
    }
  };

  const timeRemaining = useTimer(handleTimeUp);

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setLocalAnswer(index);
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitAnswer(index, timeSpent);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const runningScore = Math.round((correctCount / questions.length) * 1000);

  if (!question) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* HUD */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 px-4 pt-3 pb-3">
        {/* 진행률 + 점수 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white/50 text-xs font-semibold tabular-nums">
            {currentIndex + 1}/{questions.length}
          </span>
          <div className="flex-1 bg-white/15 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-purple-400 to-indigo-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white font-black text-sm tabular-nums">{runningScore}점</span>
        </div>

        {/* 카테고리 배지 + 난이도 + 콤보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white/70 text-xs font-semibold px-2.5 py-1 rounded-lg">
              {CATEGORY_EMOJI[selectedCategory]} {categoryLabels[selectedCategory]}
            </span>
            <span className="text-white/40 text-xs">
              {DIFFICULTY_STARS[selectedDifficulty]}
            </span>
          </div>

          {/* 콤보 배지: 2연속 이상 */}
          {currentCombo >= 2 && (
            <span key={currentCombo} className="combo-badge bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
              🔥 {currentCombo} COMBO!
            </span>
          )}
        </div>
      </div>

      {/* 메인 게임 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-5 gap-5 max-w-lg mx-auto w-full">
        {/* 타이머 */}
        {settings.timeLimit > 0 && (
          <div className="self-end">
            <Timer timeRemaining={timeRemaining} timeLimit={settings.timeLimit} />
          </div>
        )}

        {/* 문제 카드 */}
        <QuestionCard
          question={question}
          selectedAnswer={localAnswer}
          isAnswered={isAnswered}
          onSelect={handleSelect}
        />

        {/* 다음 문제 버튼 (isAnswered 상태에서 즉시 진행 가능) */}
        {isAnswered && (
          <button
            onClick={nextQuestion}
            className="slide-down w-full max-w-lg py-3.5 rounded-2xl text-sm font-black text-white/80 border-2 border-white/20 hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            {currentIndex + 1 < questions.length ? '다음 문제 →' : '결과 보기 🏆'}
          </button>
        )}

        {/* 키보드 힌트 */}
        {!isAnswered && (
          <p className="text-white/20 text-xs text-center">
            A / B / C / D 키로 선택 가능
          </p>
        )}
      </div>
    </div>
  );
}
