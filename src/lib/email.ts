const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
