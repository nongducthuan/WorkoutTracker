export const Colors = {
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
} as const;

export type ColorKey = keyof typeof Colors;
