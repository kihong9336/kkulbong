import { useGameStore } from '../store/gameStore';

export default function ReviewScreen() {
  const { questions, currentIndex, answers, nextQuestion } = useGameStore();
  const question = questions[currentIndex];
  const answer = answers[answers.length - 1];
  const isCorrect = answer.isCorrect;
  const isTimeout = answer.selectedAnswer === -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        {/* 정답/오답 표시 */}
        <div className={`text-center mb-6 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          <div className="text-6xl font-bold mb-2">{isCorrect ? 'O' : 'X'}</div>
          <p className="text-lg font-semibold">
            {isCorrect ? '정답입니다!' : isTimeout ? '시간 초과!' : '오답입니다'}
          </p>
        </div>

        {/* 문제 다시 보기 */}
        <div className="bg-gray-50 rounded-xl p-5 mb-4">
          <p className="text-sm text-gray-500 mb-2">문제</p>
          <p className="text-gray-800 font-medium">{question.question}</p>
        </div>

        {/* 선택지 결과 */}
        <div className="space-y-2 mb-4">
          {question.options.map((option, index) => {
            const isCorrectOption = index === question.correctAnswer;
            const isSelected = index === answer.selectedAnswer;
            let style = 'border-gray-200 text-gray-500';
            if (isCorrectOption) style = 'border-green-400 bg-green-50 text-green-700';
            else if (isSelected) style = 'border-red-400 bg-red-50 text-red-700';

            return (
              <div
                key={index}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium ${style}`}
              >
                <span className="mr-2">{index + 1}.</span>
                {option}
                {isCorrectOption && <span className="ml-2">&#10003;</span>}
                {isSelected && !isCorrectOption && <span className="ml-2">&#10007;</span>}
              </div>
            );
          })}
        </div>

        {/* 해설 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-blue-700 mb-1">해설</p>
          <p className="text-sm text-blue-600 leading-relaxed">{question.explanation}</p>
        </div>

        <button
          onClick={nextQuestion}
          className="w-full py-3 rounded-xl text-lg font-bold bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition-all"
        >
          {currentIndex + 1 < questions.length ? '다음 문제' : '결과 보기'}
        </button>
      </div>
    </div>
  );
}
