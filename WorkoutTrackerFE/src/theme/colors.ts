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

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  errorDim: '#7F1D1D',

  // Aliases for compatibility
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
};

export const lightTheme: typeof darkTheme = {
  // Backgrounds - Off-white warm cream
  background: '#FAF9F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Borders
  border: '#E5E2D9',

  // Text
  onSurface: '#1A1A1A',
  mutedGray: '#787774',

  // Accent - Warm Vibrant Orange from screenshot
  electric: '#E05332',
  electricDim: '#F0785B',
  electricOrange: '#E05332',

  // Status
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  errorDim: '#FEE2E2',

  // Aliases for compatibility
  text: '#1A1A1A',
  primary: '#E05332',
  borderGray: '#E5E2D9',

  // Transparent helpers
  electricBg: 'rgba(224, 83, 50, 0.10)',
  electricBgStrong: 'rgba(224, 83, 50, 0.15)',
  blackOverlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ThemeColors = typeof darkTheme;

// Mutable Colors object initialized with darkTheme defaults
export const Colors: ThemeColors = { ...darkTheme };
