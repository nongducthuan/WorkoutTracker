import { StyleSheet } from 'react-native';
import { Colors, ThemeColors } from './colors';
export { Colors };

export const createGlobalStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Layout
    flex1: { flex: 1 },
    screen: { flex: 1, backgroundColor: colors.background },
    centered: { alignItems: 'center', justifyContent: 'center' },
    row: { flexDirection: 'row', alignItems: 'center' },

    // Typography
    textOnSurface: { color: colors.onSurface },
    textMuted: { color: colors.mutedGray },
    textElectric: { color: colors.electric },
    textError: { color: colors.error },
    textBlack: { color: colors.black },

    heading: {
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: 1.5,
      color: colors.onSurface,
      textTransform: 'uppercase',
    },
    subheading: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      color: colors.mutedGray,
      textTransform: 'uppercase',
    },
    label: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.5,
      color: colors.mutedGray,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    bodyText: {
      fontSize: 14,
      color: colors.mutedGray,
    },

    // Card
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 20,
    },
    cardSmall: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
    },

    // Input
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.onSurface,
    },
    inputError: {
      borderColor: colors.error,
    },

    // Buttons
    btnPrimary: {
      backgroundColor: colors.electric,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    btnPrimaryText: {
      color: colors.black,
      fontWeight: '900',
      fontSize: 16,
    },
    btnSecondary: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnSecondaryText: {
      color: colors.onSurface,
      fontWeight: '700',
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    btnDanger: {
      backgroundColor: colors.error,
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    btnSmall: {
      backgroundColor: colors.electric,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    btnSmallText: {
      color: colors.black,
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
      borderBottomColor: colors.border,
      paddingBottom: 20,
      marginBottom: 20,
    },

    // Tags / badges
    tagElectric: {
      backgroundColor: colors.electricBg,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    tagElectricText: {
      color: colors.electric,
      fontSize: 10,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    // Divider
    divider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
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

export let globalStyles = createGlobalStyles(Colors);

export const updateGlobalStyles = (colors: ThemeColors) => {
  globalStyles = createGlobalStyles(colors);
};
