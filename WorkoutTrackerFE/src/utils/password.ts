/**
 * Password strength on a 0–3 scale, matching the three-segment meter used by
 * designs 01b (Đăng ký) and 08e (Đổi mật khẩu).
 *
 * The rule mirrors the copy shown to the user: at least 8 characters with
 * upper case, lower case and a digit.
 */
export const passwordStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  // Symbols do not add a level of their own, but they rescue an otherwise
  // short-but-complex password from scoring 0.
  if (score === 0 && /[^A-Za-z0-9]/.test(password)) score = 1;
  return score;
};

export const isPasswordValid = (password: string) => passwordStrength(password) >= 3;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmailValid = (email: string) => EMAIL_PATTERN.test(email.trim());
