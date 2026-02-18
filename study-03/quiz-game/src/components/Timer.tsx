interface TimerProps {
  timeRemaining: number;
  timeLimit: number;
}

export default function Timer({ timeRemaining, timeLimit }: TimerProps) {
  const SIZE = 80;
  const STROKE = 7;
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = timeLimit > 0 ? Math.max(0, timeRemaining / timeLimit) : 1;
  const offset = circumference * (1 - ratio);

  const isUrgent = timeRemaining <= 5 && timeLimit > 0;
  const isWarning = timeRemaining <= 10 && timeRemaining > 5 && timeLimit > 0;
  const strokeColor = isUrgent ? '#ef4444' : isWarning ? '#f97316' : '#3b82f6';
  const textColor = isUrgent ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-blue-400';

  return (
    <div className={`relative flex-shrink-0 ${isUrgent ? 'timer-urgent' : ''}`}>
      <svg width={SIZE} height={SIZE} className="-rotate-90" style={{ display: 'block' }}>
        {/* 배경 링 */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE}
        />
        {/* 진행 링 */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease' }}
        />
      </svg>
      {/* 숫자 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-black ${textColor}`}>{timeRemaining}</span>
      </div>
    </div>
  );
}
