import { useGameStore } from '../store/gameStore';
import { questions as allQuestions, categoryLabels, difficultyLabels } from '../data/questions';

export default function ResultScreen() {
  const { questions, answers, results, resetGame } = useGameStore();
  const result = results[0]; // 가장 최근 결과

  if (!result) return null;

  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const grade =
    percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 50 ? 'C' : 'D';
  const gradeColor: Record<string, string> = {
    S: 'text-yellow-500',
    A: 'text-green-500',
    B: 'text-blue-500',
    C: 'text-orange-500',
    D: 'text-red-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">게임 결과</h1>

        {/* 등급 & 점수 */}
        <div className="text-center mb-6">
          <div className={`text-7xl font-black ${gradeColor[grade]}`}>{grade}</div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{result.score}점</p>
          <p className="text-gray-500 mt-1">
            {categoryLabels[result.category]} | {difficultyLabels[result.difficulty]}
          </p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
            <p className="text-xs text-green-500">정답</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{result.totalQuestions - result.correctAnswers}</p>
            <p className="text-xs text-red-500">오답</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{result.timeTaken}초</p>
            <p className="text-xs text-blue-500">소요시간</p>
          </div>
        </div>

        {/* 문제별 결과 */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">문제별 결과</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {answers.map((ans, i) => {
              const q = questions[i] || allQuestions.find((qq) => qq.id === ans.questionId);
              if (!q) return null;
              return (
                <div
                  key={ans.questionId}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    ans.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <span className={`font-bold text-lg ${ans.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {ans.isCorrect ? 'O' : 'X'}
                  </span>
                  <span className="text-gray-700 truncate flex-1">{q.question}</span>
                  <span className="text-gray-400 text-xs whitespace-nowrap">{ans.timeSpent}초</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetGame();
              useGameStore.getState().startGame();
            }}
            className="flex-1 py-3 rounded-xl text-base font-bold bg-purple-500 text-white hover:bg-purple-600 active:scale-95 transition-all"
          >
            다시 하기
          </button>
          <button
            onClick={resetGame}
            className="flex-1 py-3 rounded-xl text-base font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all"
          >
            메뉴로
          </button>
        </div>
      </div>
    </div>
  );
}
