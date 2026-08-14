import { Vibration } from 'react-native';

/**
 * Vibration is best-effort: a device that denies the VIBRATE permission (or an
 * emulator without a vibrator) must never take the workout screen down with it,
 * which is exactly what an unguarded `Vibration.vibrate` did.
 */
export const haptic = (pattern: number | number[] = 30) => {
  try {
    Vibration.vibrate(pattern as any);
  } catch {
    // no vibrator available — silently continue
  }
};
