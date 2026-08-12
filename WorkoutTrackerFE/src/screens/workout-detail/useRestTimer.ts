import { useEffect, useState } from 'react';

const REST_SECONDS = 60;

/**
 * Countdown timer used for the rest period between sets.
 * Call `start()` after a set is marked complete.
 */
export function useRestTimer() {
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            setIsTimerActive(false);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  const playBeep = async () => {
    // Basic beep simulation - expo-av removed for React Native CLI compatibility
  };

  const start = () => {
    setTimerSeconds(REST_SECONDS);
    setIsTimerActive(true);
  };

  const stop = () => setIsTimerActive(false);

  return { timerSeconds, isTimerActive, start, stop };
}
