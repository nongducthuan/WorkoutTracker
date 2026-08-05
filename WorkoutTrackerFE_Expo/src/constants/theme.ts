// PULSE Mobile Design Tokens (from PULSE Mobile.html)
export const Colors = {
  // Core backgrounds
  background: '#0B0C0E',
  card: '#141518',
  cardHover: '#1C1E22',
  surface: '#1A1C20',

  // Brand
  electric: '#C6F432',
  electricDim: 'rgba(198, 244, 50, 0.15)',
  electricOrange: '#FF6B35',

  // Text
  onSurface: '#F1F3F5',
  mutedGray: '#6B7280',
  borderGray: '#2A2D35',

  // Semantic
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',

  // Transparent
  cardTransparent: 'rgba(20, 21, 24, 0.85)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const Shadow = {
  glow: {
    shadowColor: Colors.electric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;
