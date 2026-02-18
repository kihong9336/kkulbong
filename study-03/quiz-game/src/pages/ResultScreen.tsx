import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { categoryLabels } from '../data/questions';
import type { Category } from '../types';

const GRADE_CONFIG = {
  S: { label: '완벽해요!', emoji: '🏆', textClass: 'shimmer', bgClass: 'bg-yellow-500/10 border-yellow-500/30' },
  A: { label: '훌륭해요!', emoji: '⭐', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/30' },
  B: { label: '잘했어요!', emoji: '🎯', textClass: 'text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/30' },
  C: { label: '조금 더!', emoji: '💪', textClass: 'text-orange-400', bgClass: 'bg-orange-500/10 border-orange-500/30' },
  D: { label: '다시 도전!', emoji: '🔥', textClass: 'text-red-400', bgClass: 'bg-red-500/10 border-red-500/30' },
} as const;

const CAT_COLOR: Record<Category, string> = {
  science:   'bg-blue-500',
  history:   'bg-red-500',
  geography: 'bg-emerald-500',
  culture:   'bg-orange-500',
};
const CAT_EMOJI: Record<Category, string> = {
  science: '🔬', history: '📜', geography: '🗺️', culture: '🎭',
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

export default function ResultScreen() {
  const { questions, answers, results, leaderboard, resetGame, goToModeSelect } = useGameStore();
  const result = results[0];

  const [displayScore, setDisplayScore] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // 점수 카운트업 애니메이션
  useEffect(() => {
    if (!result) return;
    const target = result.score;
    const duration = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [result?.score]);

  // 막대 그래프 애니메이션 트리거
  useEffect(() => {
    const timer = setTimeout(() => setBarsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!result) return null;

  const pct = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const grade = pct >= 90 ? 'S' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 50 ? 'C' : 'D';
  const gc = GRADE_CONFIG[grade];

  // 카테고리별 정답률
  const categoryStats = (['science', 'history', 'geography', 'culture'] as Category[]).map((cat) => {
    const catQs = questions.filter((q) => q.category === cat);
    const catAnswers = answers.filter((a) => {
      const q = questions.find((qq) => qq.id === a.questionId);
      return q?.category === cat;
    });
    return {
      cat,
      total: catQs.length,
      correct: catAnswers.filter((a) => a.isCorrect).length,
    };
  }).filter((s) => s.total > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm py-6">
        {/* 등급 배지 */}
        <div className={`border rounded-3xl p-6 text-center mb-4 ${gc.bgClass}`}>
          <div className="text-5xl mb-2 grade-pop inline-block">{gc.emoji}</div>
          <div className={`text-8xl font-black grade-pop ${gc.textClass}`} style={{ animationDelay: '0.1s' }}>
            {grade}
          </div>
          <p className="text-white/50 text-sm font-semibold mt-1">{gc.label}</p>

          {/* 점수 카운트업 */}
          <p className="text-5xl font-black text-white score-reveal mt-3 tabular-nums">
            {displayScore.toLocaleString()}
            <span className="text-2xl text-white/50 ml-1">점</span>
          </p>

          {/* 점수 breakdown */}
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/40">
            <span>기본 <span className="text-white/60 font-bold">{result.score - Math.round(result.speedBonus ?? 0) - (result.comboBonus ?? 0)}</span></span>
            <span>⚡ 스피드 <span className="text-white/60 font-bold">+{Math.round(result.speedBonus ?? 0)}</span></span>
            <span>🔥 콤보 <span className="text-white/60 font-bold">+{result.comboBonus ?? 0}</span></span>
          </div>
        </div>

        {/* 통계 3개 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
            <p className="text-2xl font-black text-emerald-400">{result.correctAnswers}</p>
            <p className="text-white/40 text-xs mt-0.5">정답</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
            <p className="text-2xl font-black text-red-400">{result.totalQuestions - result.correctAnswers}</p>
            <p className="text-white/40 text-xs mt-0.5">오답</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
            <p className="text-2xl font-black text-blue-400">{pct}%</p>
            <p className="text-white/40 text-xs mt-0.5">정답률</p>
          </div>
        </div>

        {/* 카테고리별 정답률 차트 */}
        {categoryStats.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">카테고리별 정답률</p>
            <div className="space-y-3">
              {categoryStats.map(({ cat, total, correct }) => {
                const catPct = total > 0 ? Math.round((correct / total) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/70 text-sm">
                        {CAT_EMOJI[cat]} {categoryLabels[cat]}
                      </span>
                      <span className="text-white/50 text-xs">{correct}/{total} 정답</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`${CAT_COLOR[cat]} h-2 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: barsVisible ? `${catPct}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 부가 정보 */}
        <div className="flex items-center justify-around bg-white/5 border border-white/10 rounded-2xl py-3 px-2 mb-5 text-center">
          <div>
            <p className="text-white/40 text-xs mb-0.5">소요시간</p>
            <p className="text-white font-bold text-sm">⏱ {formatTime(result.timeTaken)}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white/40 text-xs mb-0.5">최고 콤보</p>
            <p className="text-white font-bold text-sm">🔥 {result.maxCombo ?? 0} COMBO</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-white/40 text-xs mb-0.5">스피드</p>
            <p className="text-white font-bold text-sm">⚡ +{Math.round(result.speedBonus ?? 0)}점</p>
          </div>
        </div>

        {/* 버튼 3개 */}
        <div className="space-y-2.5">
          <button
            onClick={() => { useGameStore.getState().resetGame(); useGameStore.getState().startGame(); }}
            className="w-full py-4 rounded-2xl text-base font-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white active:scale-[0.98] transition-all shadow-lg"
          >
            다시 도전 🔄
          </button>
          <div className="flex gap-2.5">
            <button
              onClick={goToModeSelect}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold border-2 border-white/20 text-white/70 hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              다른 카테고리
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex-1 py-3.5 rounded-2xl text-sm font-bold border-2 border-white/20 text-white/70 hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              🏅 순위 보기
            </button>
          </div>
        </div>
      </div>

      {/* 리더보드 모달 */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={() => setShowLeaderboard(false)}>
          <div className="modal-up bg-slate-900 border border-white/10 rounded-t-3xl p-6 w-full max-w-sm pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-lg">🏅 순위표</h2>
              <button onClick={() => setShowLeaderboard(false)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-white/40 text-center py-8">아직 기록이 없어요</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {leaderboard.slice(0, 10).map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/50'}`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 text-white text-sm font-semibold truncate">{entry.playerName}</span>
                    <span className="text-yellow-400 font-black text-sm">{entry.score}점</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={resetGame} className="w-full mt-4 py-3 rounded-2xl text-sm font-bold bg-white/10 text-white/70 hover:bg-white/20 active:scale-[0.98] transition-all">
              메인으로 🏠
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
