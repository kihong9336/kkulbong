import { useGameStore } from '../store/gameStore';
import { questions as allQuestions } from '../data/questions';
import type { Category } from '../types';

interface CategoryConfig {
  key: Category;
  label: string;
  emoji: string;
  from: string;
  to: string;
  border: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'history',   label: '한국사',   emoji: '📜', from: 'from-red-700',    to: 'to-red-900',    border: 'border-red-500/40' },
  { key: 'science',   label: '과학',     emoji: '🔬', from: 'from-blue-700',   to: 'to-blue-900',   border: 'border-blue-500/40' },
  { key: 'geography', label: '지리',     emoji: '🗺️', from: 'from-green-700',  to: 'to-green-900',  border: 'border-green-500/40' },
  { key: 'culture',   label: '일반상식', emoji: '🎭', from: 'from-orange-700', to: 'to-orange-900', border: 'border-orange-500/40' },
];

export default function ModeSelectScreen() {
  const { goToMain, setCategory, setDifficulty, startGame, settings } = useGameStore();

  const handleSelect = (category: Category | 'all') => {
    setCategory(category);
    setDifficulty('all');
    startGame();
  };

  const totalCount = allQuestions.length;
  const playCount = Math.min(settings.questionsPerGame, totalCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* 상단 */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <button
          onClick={goToMain}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 text-lg transition-all active:scale-95"
        >
          ←
        </button>
        <div>
          <h1 className="text-white font-black text-xl">카테고리 선택</h1>
          <p className="text-white/40 text-xs">플레이할 카테고리를 선택하세요</p>
        </div>
      </div>

      <div className="max-w-sm mx-auto space-y-3">
        {/* 전체 도전 카드 */}
        <button
          onClick={() => handleSelect('all')}
          className="group w-full relative overflow-hidden rounded-3xl p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 active:scale-[0.98] transition-all duration-200"
        >
          <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-[22px] px-6 py-5 flex items-center justify-between hover:from-purple-700 hover:to-indigo-800 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌐</span>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-black text-xl">전체 도전</span>
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-black px-2 py-0.5 rounded-lg">
                    전체
                  </span>
                </div>
                <p className="text-white/50 text-sm">{playCount}문제 · 모든 카테고리</p>
              </div>
            </div>
            <span className="text-white/30 group-hover:text-white/60 text-2xl transition-all">→</span>
          </div>
        </button>

        {/* 카테고리별 카드 (2×2 그리드) */}
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const catCount = allQuestions.filter((q) => q.category === cat.key).length;
            const playable = Math.min(settings.questionsPerGame, catCount);
            return (
              <button
                key={cat.key}
                onClick={() => handleSelect(cat.key)}
                className={`group relative overflow-hidden bg-gradient-to-br ${cat.from} ${cat.to} border ${cat.border} rounded-2xl p-4 text-left transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-[0.97]`}
              >
                <span className="text-3xl mb-2 block">{cat.emoji}</span>
                <p className="text-white font-black text-base leading-tight">{cat.label}</p>
                <p className="text-white/50 text-xs mt-1">{playable}문제</p>
                <span className="absolute bottom-3 right-3 text-white/20 group-hover:text-white/40 text-xl transition-all">→</span>
              </button>
            );
          })}
        </div>

        {/* 설정 안내 */}
        <p className="text-center text-white/30 text-xs pt-2">
          현재 설정: {settings.questionsPerGame}문제 ·{' '}
          {settings.timeLimit === 0 ? '시간 무제한' : `${settings.timeLimit}초`}
        </p>
      </div>
    </div>
  );
}
