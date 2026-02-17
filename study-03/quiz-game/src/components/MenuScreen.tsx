import { useGameStore } from '../store/gameStore';
import { questions as allQuestions, categoryLabels, difficultyLabels } from '../data/questions';
import type { Category, Difficulty } from '../types';

const categories: (Category | 'all')[] = ['all', 'science', 'history', 'geography', 'culture'];
const difficulties: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];

export default function MenuScreen() {
  const { selectedCategory, selectedDifficulty, setCategory, setDifficulty, startGame, settings } = useGameStore();

  const filteredCount = allQuestions.filter((q) => {
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  }).length;

  const canStart = filteredCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">상식 퀴즈 게임</h1>
        <p className="text-center text-gray-500 mb-8">안녕하세요, {settings.playerName}님!</p>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">카테고리</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-2">난이도</h2>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {difficultyLabels[diff]}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mb-6">
          문제 수: <span className="font-bold text-gray-700">{filteredCount}문제</span> 중{' '}
          <span className="font-bold text-gray-700">{Math.min(settings.questionsPerGame, filteredCount)}문제</span> 출제
          {settings.timeLimit > 0 && (
            <span> | 제한시간: <span className="font-bold text-gray-700">{settings.timeLimit}초</span></span>
          )}
        </div>

        <button
          onClick={startGame}
          disabled={!canStart}
          className={`w-full py-3 rounded-xl text-lg font-bold transition-all ${
            canStart
              ? 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          게임 시작
        </button>
      </div>
    </div>
  );
}
