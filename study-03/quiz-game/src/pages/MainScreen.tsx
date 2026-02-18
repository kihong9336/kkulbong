import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { categoryLabels, difficultyLabels } from '../data/questions';

const GRADE_COLOR: Record<string, string> = {
  S: 'bg-yellow-500', A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-orange-500', D: 'bg-red-500',
};

function getGrade(score: number, total: number): string {
  const pct = (score / total) * 100;
  if (pct >= 90) return 'S';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 50) return 'C';
  return 'D';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function MainScreen() {
  const { goToModeSelect, startGame, results, leaderboard, settings, updateSettings } = useGameStore();
  const [panel, setPanel] = useState<'none' | 'leaderboard' | 'settings'>('none');
  const [nameInput, setNameInput] = useState(settings.playerName);
  const [qCount, setQCount] = useState(settings.questionsPerGame);
  const [timeLimit, setTimeLimit] = useState(settings.timeLimit);

  const recentPlays = results.slice(0, 3);
  const bestScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
  const avatarLetter = settings.playerName ? settings.playerName[0].toUpperCase() : '?';
  const hasName = !!settings.playerName;

  const saveSettings = () => {
    updateSettings({ playerName: nameInput.trim(), questionsPerGame: qCount, timeLimit });
    setPanel('none');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            🧠 상식 퀴즈
          </h1>
          <p className="text-white/40 text-sm">지식을 겨루어 보세요</p>
        </div>

        {/* 플레이어 카드 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
              {hasName ? avatarLetter : '?'}
            </div>
            <div className="flex-1 min-w-0">
              {hasName ? (
                <p className="text-white font-bold text-lg truncate">{settings.playerName}</p>
              ) : (
                <p className="text-white/40 text-sm">설정에서 닉네임을 입력하세요</p>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-yellow-400 text-xs font-semibold">🏆 최고</span>
                <span className="text-yellow-400 font-black text-sm">{bestScore.toLocaleString()}점</span>
              </div>
            </div>
          </div>

          {/* 최근 기록 */}
          {recentPlays.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">최근 플레이</p>
              {recentPlays.map((r) => {
                const grade = getGrade(r.correctAnswers, r.totalQuestions);
                return (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/40 text-xs">{formatDate(r.date)}</span>
                    <span className="text-white/60 text-xs">
                      {categoryLabels[r.category]} · {difficultyLabels[r.difficulty]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{r.score}점</span>
                      <span className={`${GRADE_COLOR[grade]} text-white text-xs font-black px-2 py-0.5 rounded-lg`}>
                        {grade}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 버튼 4개 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { useGameStore.setState({ selectedCategory: 'all', selectedDifficulty: 'all' }); startGame(); }}
            className="col-span-2 py-4 rounded-2xl text-lg font-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/30"
          >
            게임 시작 🚀
          </button>
          <button
            onClick={goToModeSelect}
            className="py-3.5 rounded-2xl text-sm font-bold border-2 border-white/20 text-white/80 hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            📂 카테고리 선택
          </button>
          <button
            onClick={() => setPanel('leaderboard')}
            className="py-3.5 rounded-2xl text-sm font-bold border-2 border-white/20 text-white/80 hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            🏅 순위 보기
          </button>
          <button
            onClick={() => { setNameInput(settings.playerName); setQCount(settings.questionsPerGame); setTimeLimit(settings.timeLimit); setPanel('settings'); }}
            className="col-span-2 py-3.5 rounded-2xl text-sm font-bold border-2 border-white/20 text-white/80 hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            ⚙️ 설정
          </button>
        </div>
      </div>

      {/* 리더보드 패널 */}
      {panel === 'leaderboard' && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={() => setPanel('none')}>
          <div className="modal-up bg-slate-900 border border-white/10 rounded-t-3xl p-6 w-full max-w-sm pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-lg">🏅 순위표</h2>
              <button onClick={() => setPanel('none')} className="text-white/40 hover:text-white text-xl">✕</button>
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
                    <span className="text-white/60 text-xs">{categoryLabels[entry.category]}</span>
                    <span className="text-yellow-400 font-black text-sm">{entry.score}점</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 설정 패널 */}
      {panel === 'settings' && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={() => setPanel('none')}>
          <div className="modal-up bg-slate-900 border border-white/10 rounded-t-3xl p-6 w-full max-w-sm pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-lg">⚙️ 설정</h2>
              <button onClick={() => setPanel('none')} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-5">
              {/* 닉네임 */}
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">닉네임</p>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              {/* 문제 수 */}
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">문제 수</p>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button key={n} onClick={() => setQCount(n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${qCount === n ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {/* 제한 시간 */}
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">제한 시간 (문제당)</p>
                <div className="flex gap-2">
                  {[15, 30, 60, 0].map((t) => (
                    <button key={t} onClick={() => setTimeLimit(t)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${timeLimit === t ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                      {t === 0 ? '∞' : `${t}s`}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={saveSettings}
                className="w-full py-3.5 rounded-2xl text-base font-black bg-gradient-to-r from-purple-500 to-indigo-500 text-white active:scale-[0.98] transition-all">
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
