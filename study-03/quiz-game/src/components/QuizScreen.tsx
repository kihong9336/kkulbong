import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTimer } from '../hooks/useTimer';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const OPTION_STYLE = [
  'hover:border-blue-400   hover:bg-blue-50   hover:text-blue-800',
  'hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800',
  'hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800',
  'hover:border-orange-400 hover:bg-orange-50 hover:text-orange-800',
];

const BADGE_STYLE = [
  'bg-blue-100   text-blue-600   group-hover:bg-blue-500   group-hover:text-white',
  'bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white',
  'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
  'bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white',
];

export default function QuizScreen() {
  const { questions, currentIndex, submitAnswer, settings } = useGameStore();
  const question = questions[currentIndex];
  const startTimeRef = useRef(Date.now());

  const prevIndexRef = useRef(currentIndex);
  if (prevIndexRef.current !== currentIndex) {
    prevIndexRef.current = currentIndex;
    startTimeRef.current = Date.now();
  }

  const handleTimeUp = () => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitAnswer(-1, timeSpent);
  };

  const timeRemaining = useTimer(handleTimeUp);

  const handleSelect = (index: number) => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitAnswer(index, timeSpent);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const timerRatio = settings.timeLimit > 0 ? timeRemaining / settings.timeLimit : 1;
  const isUrgent = settings.timeLimit > 0 && timerRatio <= 0.25;
  const timerColor = timerRatio > 0.5 ? 'bg-emerald-400' : timerRatio > 0.25 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* 상단 바: 진행률 + 타이머 */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-white/50 text-sm">문제</span>
            <span className="text-white font-black text-lg">{currentIndex + 1}</span>
            <span className="text-white/40 text-sm">/ {questions.length}</span>
          </div>
          {settings.timeLimit > 0 && (
            <div
              className={`flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 ${isUrgent ? 'timer-urgent' : ''}`}
            >
              <span className="text-base">{isUrgent ? '⏰' : '⏱️'}</span>
              <span className={`font-black text-xl ${isUrgent ? 'text-red-300' : 'text-white'}`}>
                {timeRemaining}
              </span>
            </div>
          )}
        </div>

        {/* 진행 바 */}
        <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
          <div
            className="bg-white h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 타이머 바 */}
        {settings.timeLimit > 0 && (
          <div className="w-full bg-white/20 rounded-full h-1 mb-5">
            <div
              className={`${timerColor} h-1 rounded-full transition-all duration-1000 ease-linear`}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>
        )}

        {/* 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 문제 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 px-6 pt-6 pb-5">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
              Q{currentIndex + 1}
            </p>
            <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
              {question.question}
            </h2>
          </div>

          {/* 선택지 */}
          <div className="p-4 space-y-2.5">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-700 font-medium transition-all duration-150 active:scale-[0.97] option-item fade-in-up ${OPTION_STYLE[index]}`}
              >
                <span
                  className={`w-8 h-8 flex-shrink-0 rounded-xl text-sm font-black flex items-center justify-center transition-all duration-150 ${BADGE_STYLE[index]}`}
                >
                  {OPTION_LABELS[index]}
                </span>
                <span className="text-left text-sm leading-snug">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
