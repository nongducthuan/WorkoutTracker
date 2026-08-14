import i18n from '../i18n';

/**
 * The API stores exercise categories in English ("Chest", "Legs", …) because
 * they double as identifiers. The design shows them in Vietnamese, so labels
 * are translated at render time while the raw value stays the filter key.
 */
const VI_LABELS: Record<string, string> = {
  Chest: 'Ngực',
  Back: 'Lưng',
  Legs: 'Chân',
  Shoulders: 'Vai',
  Arms: 'Tay',
  Core: 'Bụng',
  Cardio: 'Tim mạch',
};

export const categoryLabel = (category?: string) => {
  if (!category) return '';
  const isVietnamese = (i18n.language || 'vi').startsWith('vi');
  return isVietnamese ? VI_LABELS[category] ?? category : category;
};
