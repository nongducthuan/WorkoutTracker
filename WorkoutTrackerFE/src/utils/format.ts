export type WeightUnit = 'kg' | 'lb';

const KG_TO_LB = 2.20462;

/** Convert a stored (always-kg) weight into the unit the user picked. */
export const toDisplayWeight = (kg: number, unit: WeightUnit) =>
  unit === 'lb' ? kg * KG_TO_LB : kg;

/** Convert a user-entered weight back into kg for storage. */
export const toStorageWeight = (value: number, unit: WeightUnit) =>
  unit === 'lb' ? value / KG_TO_LB : value;

const round = (value: number, digits = 1) => {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
};

/** "62.5 kg" — drops the trailing ".0" so whole numbers stay clean. */
export const formatWeight = (kg: number, unit: WeightUnit = 'kg') => {
  const value = round(toDisplayWeight(kg, unit), 1);
  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${unit}`;
};

/** Total load of one exercise entry: sets × reps × weight. */
export const exerciseVolume = (sets: number, reps: number, weight?: number) =>
  (sets || 0) * (reps || 0) * (weight || 0);

/** kg → tonnes, rounded to one decimal ("4.2"). */
export const toTons = (kg: number) => round(kg / 1000, 1);

/** "1,920" — thousands separators without pulling in Intl edge cases. */
export const formatNumber = (value: number) =>
  Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** "TQ" — two-letter avatar initials from a display name. */
export const initialsOf = (name?: string) => {
  if (!name) return 'PL';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
};
