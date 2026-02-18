import { useGameStore } from '../store/gameStore';
import { questions as allQuestions, categoryLabels, difficultyLabels } from '../data/questions';

const GRADE_CONFIG = {
  S: { color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', label: '완벽해요!', emoji: '🏆' },
  A: { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: '훌륭해요!', emoji: '⭐' },
  B: { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: '잘했어요!', emoji: '🎯' },
  C: { color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', label: '조금 더 노력해요', emoji: '💪' },
  D: { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: '다시 도전해봐요', emoji: '🔥' },
} as const;

export default function ResultScreen() {
  const { questions, answers, results, resetGame } = useGameStore();
  const result = results[0];

  if (!result) return null;

  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const grade =
    percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 50 ? 'C' : 'D';
  const gc = GRADE_CONFIG[grade];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="text-center mb-5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">게임 결과</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 등급 & 점수 */}
          <div className={`${gc.bg} border-b ${gc.border} px-6 py-6 text-center`}>
            <div className="text-5xl mb-1 grade-pop inline-block">{gc.emoji}</div>
            <div
              className={`text-8xl font-black grade-pop ${gc.color}`}
              style={{ animationDelay: '0.1s' }}
            >
              {grade}
            </div>
            <p className="text-gray-400 text-sm font-semibold mt-1">{gc.label}</p>
            <p className="text-4xl font-black text-gray-800 score-reveal mt-2">{result.score}점</p>
            <p className="text-xs text-gray-400 mt-1">
              {categoryLabels[result.category]} · {difficultyLabels[result.difficulty]}
            </p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
            <div className="py-4 text-center">
              <p className="text-2xl font-black text-emerald-500">{result.correctAnswers}</p>
              <p className="text-xs text-gray-400 mt-0.5">정답</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-2xl font-black text-red-400">
                {result.totalQuestions - result.correctAnswers}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">오답</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-2xl font-black text-blue-500">{result.timeTaken}s</p>
              <p className="text-xs text-gray-400 mt-0.5">소요시간</p>
            </div>
          </div>

          {/* 정답률 바 */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">정답률</span>
              <span className="text-sm font-black text-gray-800">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* 문제별 결과 목록 */}
          <div className="px-4 py-3 max-h-52 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">문제별 결과</p>
            <div className="space-y-1.5">
              {answers.map((ans, i) => {
                const q = questions[i] || allQuestions.find((qq) => qq.id === ans.questionId);
                if (!q) return null;
                return (
                  <div
                    key={ans.questionId}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                      ans.isCorrect ? 'bg-emerald-50' : 'bg-red-50'
                    }`}
                  >
                    <span
                      className={`text-lg font-black flex-shrink-0 ${
                        ans.isCorrect ? 'text-emerald-500' : 'text-red-400'
                      }`}
                    >
                      {ans.isCorrect ? '○' : '×'}
                    </span>
                    <span className="text-gray-700 truncate flex-1 text-xs">{q.question}</span>
                    <span className="text-gray-400 text-xs whitespace-nowrap">{ans.timeSpent}s</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 버튼 */}
          <div className="p-4 flex gap-3 border-t border-gray-100">
            <button
              onClick={() => {
                resetGame();
                useGameStore.getState().startGame();
              }}
              className="flex-1 py-3.5 rounded-2xl text-sm font-black bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition-all"
            >
              다시 하기 🔄
            </button>
            <button
              onClick={resetGame}
              className="flex-1 py-3.5 rounded-2xl text-sm font-black bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
            >
              메뉴로 🏠
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
