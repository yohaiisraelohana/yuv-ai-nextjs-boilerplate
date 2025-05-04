export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username: string): boolean => {
  // Username should be 3-20 characters and can only contain alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic phone number validation - can be enhanced for specific country formats
  const phoneRegex = /^\+?[\d\s()-]{7,20}$/;
  return phoneRegex.test(phoneNumber);
};

export const isStrongPassword = (password: string): {
  isValid: boolean;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let isValid = true;

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
    isValid = false;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password should contain at least one uppercase letter');
    isValid = false;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password should contain at least one lowercase letter');
    isValid = false;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Password should contain at least one number');
    isValid = false;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Password should contain at least one special character');
    isValid = false;
  }

  return { isValid, feedback };
}; 