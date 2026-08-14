/**
 * Two palettes, matching the two theme sections of the design file:
 * "DARK · Volt Night" and "LIGHT · Coral Daylight".
 *
 * There is no mutable shared palette any more — screens read colors from
 * `useTheme()` so a theme switch re-renders them instead of leaving stale
 * StyleSheets behind.
 */
export const darkTheme = {
  // Backgrounds
  background: '#0B0C0E',
  surface: '#141518',
  card: '#1A1D22',

  // Borders
  border: '#2A2D35',

  // Text
  onSurface: '#F1F3F5',
  mutedGray: '#6B7280',

  // Accent
  electric: '#C6F432',
  electricDim: '#8BB300',
  electricOrange: '#FF6B35',
  /** Foreground to use on top of `electric` fills. */
  onElectric: '#0B0C0E',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  errorDim: '#7F1D1D',

  // Aliases kept for compatibility with older screens
  text: '#F1F3F5',
  primary: '#C6F432',
  borderGray: '#2A2D35',

  // Transparent helpers
  electricBg: 'rgba(198, 244, 50, 0.10)',
  electricBgStrong: 'rgba(198, 244, 50, 0.15)',
  blackOverlay: 'rgba(0,0,0,0.7)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  /** Muscle map fills — the highlighter needs concrete hex values. */
  bodyFill: '#1F1F24',
  bodyBorder: '#3A3A45',
};

export const lightTheme: typeof darkTheme = {
  // Backgrounds — warm off-white cream
  background: '#FAF9F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Borders
  border: '#E5E2D9',

  // Text
  onSurface: '#1A1A1A',
  mutedGray: '#787774',

  // Accent — coral
  electric: '#E05332',
  electricDim: '#F0785B',
  electricOrange: '#E05332',
  onElectric: '#FFFFFF',

  // Status
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  errorDim: '#FEE2E2',

  // Aliases kept for compatibility with older screens
  text: '#1A1A1A',
  primary: '#E05332',
  borderGray: '#E5E2D9',

  // Transparent helpers
  electricBg: 'rgba(224, 83, 50, 0.10)',
  electricBgStrong: 'rgba(224, 83, 50, 0.15)',
  blackOverlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  /** On light backgrounds "black" is the on-accent foreground, i.e. white. */
  black: '#FFFFFF',
  transparent: 'transparent',

  bodyFill: '#EFECE4',
  bodyBorder: '#D8D4C8',
};

export type ThemeColors = typeof darkTheme;

export const themes = { dark: darkTheme, light: lightTheme } as const;
