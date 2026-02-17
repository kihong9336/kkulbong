import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTimer } from '../hooks/useTimer';

export default function QuizScreen() {
  const { questions, currentIndex, submitAnswer, settings } = useGameStore();
  const question = questions[currentIndex];
  const startTimeRef = useRef(Date.now());

  // 문제가 바뀔 때 시작 시간 갱신
  const prevIndexRef = useRef(currentIndex);
  if (prevIndexRef.current !== currentIndex) {
    prevIndexRef.current = currentIndex;
    startTimeRef.current = Date.now();
  }

  const handleTimeUp = () => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitAnswer(-1, timeSpent); // -1 = 시간 초과 (오답 처리)
  };

  const timeRemaining = useTimer(handleTimeUp);

  const handleSelect = (index: number) => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitAnswer(index, timeSpent);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const timerRatio = settings.timeLimit > 0 ? timeRemaining / settings.timeLimit : 1;
  const timerColor = timerRatio > 0.5 ? 'bg-green-500' : timerRatio > 0.25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        {/* 상단: 진행 상황 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-500">
            {currentIndex + 1} / {questions.length}
          </span>
          {settings.timeLimit > 0 && (
            <span className={`text-sm font-bold ${timerRatio <= 0.25 ? 'text-red-500' : 'text-gray-600'}`}>
              {timeRemaining}초
            </span>
          )}
        </div>

        {/* 진행 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 타이머 바 */}
        {settings.timeLimit > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
            <div
              className={`${timerColor} h-1.5 rounded-full transition-all duration-1000 ease-linear`}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>
        )}

        {/* 문제 */}
        <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">{question.question}</h2>

        {/* 선택지 */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-indigo-400 hover:bg-indigo-50 active:scale-[0.98] transition-all"
            >
              <span className="inline-block w-8 h-8 rounded-full bg-gray-100 text-center leading-8 text-sm font-bold text-gray-500 mr-3">
                {index + 1}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
