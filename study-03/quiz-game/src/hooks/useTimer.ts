import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useTimer(onTimeUp: () => void) {
  const { phase, timeRemaining, settings } = useGameStore();
  const callbackRef = useRef(onTimeUp);
  callbackRef.current = onTimeUp;

  useEffect(() => {
    if (phase !== 'playing' || settings.timeLimit === 0) return;

    if (timeRemaining <= 0) {
      callbackRef.current();
      return;
    }

    const timer = setInterval(() => {
      const current = useGameStore.getState().timeRemaining;
      if (current <= 1) {
        clearInterval(timer);
        useGameStore.setState({ timeRemaining: 0 });
        callbackRef.current();
      } else {
        useGameStore.setState({ timeRemaining: current - 1 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeRemaining, settings.timeLimit]);

  return timeRemaining;
}
