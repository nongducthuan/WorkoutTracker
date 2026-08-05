import { StyleSheet } from 'react-native';
import { Colors } from './colors';

// Common StyleSheet patterns reused across screens
export const globalStyles = StyleSheet.create({
  // Layout
  flex1: { flex: 1 },
  screen: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },

  // Typography
  textOnSurface: { color: Colors.onSurface },
  textMuted: { color: Colors.mutedGray },
  textElectric: { color: Colors.electric },
  textError: { color: Colors.error },
  textBlack: { color: Colors.black },

  heading: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  subheading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.mutedGray,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.mutedGray,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: Colors.mutedGray,
  },

  // Card
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 20,
  },
  cardSmall: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
  },

  // Input
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.onSurface,
  },
  inputError: {
    borderColor: Colors.error,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: Colors.electric,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimaryText: {
    color: Colors.black,
    fontWeight: '900',
    fontSize: 16,
  },
  btnSecondary: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnSecondaryText: {
    color: Colors.onSurface,
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  btnDanger: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  btnSmall: {
    backgroundColor: Colors.electric,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnSmallText: {
    color: Colors.black,
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 20,
    marginBottom: 20,
  },

  // Tags / badges
  tagElectric: {
    backgroundColor: 'rgba(198,244,50,0.1)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagElectricText: {
    color: Colors.electric,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Divider
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginVertical: 16,
  },

  // Error box
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorBoxText: {
    color: '#FC8181',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
});
