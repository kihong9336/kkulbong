import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useTimer(onTimeUp: () => void) {
  const { phase, timeRemaining, settings, isAnswered } = useGameStore();
  const callbackRef = useRef(onTimeUp);
  callbackRef.current = onTimeUp;

  useEffect(() => {
    // 플레이 중이 아니거나, 시간 제한 없거나, 이미 답변한 경우 타이머 중지
    if (phase !== 'playing' || settings.timeLimit === 0 || isAnswered) return;

    if (timeRemaining <= 0) {
      callbackRef.current();
      return;
    }

    const timer = setInterval(() => {
      const state = useGameStore.getState();
      // 상태가 변경됐으면 interval 중지
      if (state.isAnswered || state.phase !== 'playing') {
        clearInterval(timer);
        return;
      }
      const current = state.timeRemaining;
      if (current <= 1) {
        clearInterval(timer);
        useGameStore.setState({ timeRemaining: 0 });
        callbackRef.current();
      } else {
        useGameStore.setState({ timeRemaining: current - 1 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeRemaining, settings.timeLimit, isAnswered]);

  return timeRemaining;
}
