import { useGameStore } from '../store/gameStore';

export default function ReviewScreen() {
  const { questions, currentIndex, answers, nextQuestion } = useGameStore();
  const question = questions[currentIndex];
  const answer = answers[answers.length - 1];
  const isCorrect = answer.isCorrect;
  const isTimeout = answer.selectedAnswer === -1;
  const isLast = currentIndex + 1 >= questions.length;

  const bgGradient = isCorrect
    ? 'from-emerald-500 to-green-600'
    : 'from-red-500 to-rose-600';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4`}>
      <div className="w-full max-w-lg">
        {/* 결과 아이콘 */}
        <div className="text-center mb-5 bounce-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-3">
            <span className="text-5xl">
              {isCorrect ? '✅' : isTimeout ? '⏰' : '❌'}
            </span>
          </div>
          <p className="text-2xl font-black text-white">
            {isCorrect ? '정답!' : isTimeout ? '시간 초과' : '오답'}
          </p>
          {!isCorrect && !isTimeout && (
            <p className="text-white/70 text-sm mt-1">아쉽네요, 다시 한번 도전해봐요!</p>
          )}
        </div>

        {/* 답안 카드 */}
        <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden ${!isCorrect ? 'shake' : ''}`}>
          {/* 문제 요약 */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">문제</p>
            <p className="text-gray-800 font-medium text-sm leading-relaxed">{question.question}</p>
          </div>

          {/* 선택지 결과 */}
          <div className="p-4 space-y-2">
            {question.options.map((option, index) => {
              const isCorrectOption = index === question.correctAnswer;
              const isSelected = index === answer.selectedAnswer;

              let wrapClass = 'border-gray-100 bg-gray-50 text-gray-400';
              let badgeClass = 'bg-gray-100 text-gray-400';
              let icon: React.ReactNode = null;

              if (isCorrectOption) {
                wrapClass = 'border-emerald-300 bg-emerald-50 text-emerald-800';
                badgeClass = 'bg-emerald-500 text-white';
                icon = <span className="text-emerald-500 font-bold text-base flex-shrink-0">✓</span>;
              } else if (isSelected) {
                wrapClass = 'border-red-300 bg-red-50 text-red-700';
                badgeClass = 'bg-red-400 text-white';
                icon = <span className="text-red-400 font-bold text-base flex-shrink-0">✗</span>;
              }

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-sm font-medium ${wrapClass}`}
                >
                  <span
                    className={`w-7 h-7 flex-shrink-0 rounded-lg text-xs font-black flex items-center justify-center ${badgeClass}`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 text-left">{option}</span>
                  {icon}
                </div>
              );
            })}
          </div>

          {/* 해설 */}
          <div className="mx-4 mb-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">해설</p>
            <p className="text-sm text-indigo-700 leading-relaxed">{question.explanation}</p>
          </div>

          {/* 다음 버튼 */}
          <div className="px-4 pb-4">
            <button
              onClick={nextQuestion}
              className={`w-full py-4 rounded-2xl text-base font-black transition-all duration-200 active:scale-95 ${
                isCorrect
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              {isLast ? '결과 보기 🏆' : '다음 문제 →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
