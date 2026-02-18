import { useEffect } from 'react';
import type { Question } from '../types';

interface Props {
  question: Question;
  selectedAnswer: number | null; // null=미선택, -1=타임아웃
  isAnswered: boolean;
  onSelect: (index: number) => void;
}

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({ question, selectedAnswer, isAnswered, onSelect }: Props) {
  // 키보드 단축키: A/B/C/D
  useEffect(() => {
    if (isAnswered) return;
    const handler = (e: KeyboardEvent) => {
      // 입력 필드에서는 무시
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx !== undefined && idx < question.options.length) {
        onSelect(idx);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAnswered, question.options.length, onSelect]);

  const getWrapClass = (index: number) => {
    if (!isAnswered) {
      return 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 active:scale-[0.98] cursor-pointer';
    }
    if (index === question.correctAnswer) return 'bg-emerald-500/25 border-emerald-400 text-white';
    if (index === selectedAnswer) return 'bg-red-500/25 border-red-400 text-white';
    return 'bg-white/5 border-white/10 text-white/30 cursor-default';
  };

  const getBadgeClass = (index: number) => {
    if (!isAnswered) return 'bg-white/20 text-white/80';
    if (index === question.correctAnswer) return 'bg-emerald-500 text-white';
    if (index === selectedAnswer) return 'bg-red-500 text-white';
    return 'bg-white/10 text-white/30';
  };

  const getIcon = (index: number) => {
    if (!isAnswered) return null;
    if (index === question.correctAnswer)
      return <span className="text-emerald-400 text-lg font-black flex-shrink-0">✓</span>;
    if (index === selectedAnswer)
      return <span className="text-red-400 text-lg font-black flex-shrink-0">✗</span>;
    return null;
  };

  const showExplanation = isAnswered && selectedAnswer !== question.correctAnswer;

  return (
    <div className="w-full">
      {/* 문제 카드 */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl px-6 py-5 mb-4">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">문제</p>
        <p className="text-white text-lg font-bold leading-relaxed" style={{ WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {question.question}
        </p>
      </div>

      {/* 보기 */}
      <div className="space-y-2.5">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !isAnswered && onSelect(index)}
            disabled={isAnswered}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 text-left option-item fade-in-up ${getWrapClass(index)}`}
          >
            <span
              className={`w-8 h-8 flex-shrink-0 rounded-xl text-sm font-black flex items-center justify-center transition-all duration-200 ${getBadgeClass(index)}`}
            >
              {LABELS[index]}
            </span>
            <span className="flex-1 text-sm font-medium leading-snug">{option}</span>
            {getIcon(index)}
          </button>
        ))}
      </div>

      {/* 오답/타임아웃 시 해설 슬라이드 다운 */}
      {showExplanation && (
        <div className="slide-down mt-4 bg-indigo-900/50 border border-indigo-400/30 rounded-2xl p-4">
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1">해설</p>
          <p className="text-sm text-indigo-100 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
