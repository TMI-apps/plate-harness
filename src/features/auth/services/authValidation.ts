const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Email is required.";
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): string | null => {
  const passwordError = validatePassword(password);
  if (passwordError) {
    return passwordError;
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
};
