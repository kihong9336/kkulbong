import { useGameStore } from '../store/gameStore';
import { questions as allQuestions, categoryLabels, difficultyLabels } from '../data/questions';
import type { Category, Difficulty } from '../types';

const categoryEmojis: Record<Category | 'all', string> = {
  all: '🌐',
  science: '🔬',
  history: '📜',
  geography: '🗺️',
  culture: '🎭',
};

const categories: (Category | 'all')[] = ['all', 'science', 'history', 'geography', 'culture'];
const difficulties: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];

export default function MenuScreen() {
  const { selectedCategory, selectedDifficulty, setCategory, setDifficulty, startGame, settings } = useGameStore();

  const filteredCount = allQuestions.filter((q) => {
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  }).length;

  const playCount = Math.min(settings.questionsPerGame, filteredCount);
  const canStart = filteredCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 w-full max-w-md border border-white/20">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-3xl font-black text-white tracking-tight">상식 퀴즈</h1>
          <p className="text-white/60 mt-1 text-sm">
            안녕하세요,{' '}
            <span className="font-bold text-white">{settings.playerName}</span>님!
          </p>
        </div>

        {/* 카테고리 */}
        <div className="mb-5">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">카테고리</p>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-lg shadow-white/20'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <span className="text-xl">{categoryEmojis[cat]}</span>
                  <span>{categoryLabels[cat]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 난이도 */}
        <div className="mb-6">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">난이도</p>
          <div className="flex gap-2">
            {difficulties.map((diff) => {
              const isActive = selectedDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {difficultyLabels[diff]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 게임 정보 */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <span className="text-white/50 text-xs">문제</span>
            <span className="text-white font-black">{playCount}개</span>
          </div>
          {settings.timeLimit > 0 && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <span className="text-white/50 text-xs">제한시간</span>
              <span className="text-white font-black">{settings.timeLimit}초</span>
            </div>
          )}
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={startGame}
          disabled={!canStart}
          className={`w-full py-4 rounded-2xl text-lg font-black tracking-wide transition-all duration-200 ${
            canStart
              ? 'bg-white text-indigo-600 hover:bg-indigo-50 active:scale-95 shadow-lg shadow-white/20'
              : 'bg-white/20 text-white/40 cursor-not-allowed'
          }`}
        >
          {canStart ? '게임 시작 🚀' : '문제가 없습니다'}
        </button>
      </div>
    </div>
  );
}
