import i18n from '../i18n';

/**
 * Locale-aware date helpers.
 *
 * Screens used to call `toLocaleDateString('en-US', …)` directly, which meant
 * dates stayed English even with the app in Vietnamese. Everything goes through
 * these helpers instead so switching language switches the dates too.
 */

const VI_WEEKDAYS_LONG = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

const VI_WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const isVietnamese = () => (i18n.language || 'vi').startsWith('vi');

const locale = () => (isVietnamese() ? 'vi-VN' : 'en-US');

const toDate = (value: Date | string | number) =>
  value instanceof Date ? value : new Date(value);

/** "Thứ Ba, 4 Th8" / "Tuesday, Aug 4" */
export const formatFullDate = (value: Date | string | number) => {
  const d = toDate(value);
  if (isVietnamese()) {
    return `${VI_WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} Th${d.getMonth() + 1}`;
  }
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

/** "4 Th8" / "Aug 4" */
export const formatShortDate = (value: Date | string | number) => {
  const d = toDate(value);
  if (isVietnamese()) {
    return `${d.getDate()} Th${d.getMonth() + 1}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/** "T3 4" / "Tue 4" — used by compact schedule rows */
export const formatWeekdayDate = (value: Date | string | number) => {
  const d = toDate(value);
  if (isVietnamese()) {
    return `${VI_WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()}`;
  }
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
};

/** "Tháng 8, 2026" / "August 2026" */
export const formatMonthYear = (value: Date | string | number) => {
  const d = toDate(value);
  if (isVietnamese()) {
    return `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
  }
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

/** Weekday initials for calendar headers, Sunday first. */
export const weekdayHeadings = () =>
  isVietnamese() ? VI_WEEKDAYS_SHORT : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "18:00" — 24h everywhere, matching the design. */
export const formatTime = (value: Date | string | number) => {
  const d = toDate(value);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** "24:38" or "0:52" — elapsed/remaining timers. */
export const formatDuration = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/** "00:42" — countdown pills that always show two digits. */
export const formatCountdown = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const isSameDay = (a: Date | string | number, b: Date | string | number) =>
  toDate(a).toDateString() === toDate(b).toDateString();

export const startOfDay = (value: Date | string | number) => {
  const d = toDate(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addMonths = (value: Date | string | number, months: number) => {
  const d = toDate(value);
  // Anchor to the 1st first: adding a month to the 31st otherwise lands in the
  // month after next, which would silently widen a query window.
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
};

export const startOfMonth = (value: Date | string | number) => {
  const d = toDate(value);
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
};

/** The last millisecond of the month, so it can be used as an inclusive bound. */
export const endOfMonth = (value: Date | string | number) => {
  const d = toDate(value);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

/** Whole days between two dates, ignoring the time of day. */
export const daysBetween = (a: Date | string | number, b: Date | string | number) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);

/**
 * "2 ngày trước" / "2 days ago". Returns a translated relative label using the
 * `relative.*` i18n namespace so callers never build these strings by hand.
 */
export const formatRelativeDay = (value: Date | string | number) => {
  const diff = daysBetween(value, new Date());
  const t = i18n.t.bind(i18n);
  if (diff <= 0) return t('relative.today');
  if (diff === 1) return t('relative.yesterday');
  if (diff < 7) return t('relative.days_ago', { count: diff });
  const weeks = Math.floor(diff / 7);
  if (weeks === 1) return t('relative.week_ago');
  if (weeks < 5) return t('relative.weeks_ago', { count: weeks });
  const months = Math.floor(diff / 30);
  return t('relative.months_ago', { count: Math.max(1, months) });
};

/** ISO week number — used to bucket volume into "T27, T28…" columns. */
export const isoWeekNumber = (value: Date | string | number) => {
  const d = startOfDay(value);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
