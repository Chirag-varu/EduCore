/**
 * Client-side password validation utilities
 * Provides real-time password strength validation
 */

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with strength indicators
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const isValid = passedChecks === 5;

  // Determine strength with sensible gating rules:
  // - If too short, always 'weak' regardless of other checks
  // - 'strong' only when all requirements are met
  // - 'medium' when 3-4 checks pass (but not all)
  let strength = 'weak';
  if (!checks.minLength) {
    strength = 'weak';
  } else if (isValid) {
    strength = 'strong';
  } else if (passedChecks >= 3) {
    strength = 'medium';
  }

  return {
    isValid,
    strength,
    checks,
    score: passedChecks,
    maxScore: 5,
    requirements: [
      { key: 'minLength', label: 'At least 8 characters', passed: checks.minLength },
      { key: 'hasUpperCase', label: 'One uppercase letter', passed: checks.hasUpperCase },
      { key: 'hasLowerCase', label: 'One lowercase letter', passed: checks.hasLowerCase },
      { key: 'hasNumbers', label: 'One number', passed: checks.hasNumbers },
      { key: 'hasSpecialChar', label: 'One special character', passed: checks.hasSpecialChar },
    ]
  };
};

/**
 * Get password strength color
 * @param {string} strength - The password strength level
 * @returns {string} - Tailwind color class
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'strong': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    default: return 'text-red-600';
  }
};

/**
 * Get password strength progress color
 * @param {string} strength - The password strength level
 * @returns {string} - Tailwind background color class
 */
export const getPasswordStrengthBg = (strength) => {
  switch (strength) {
    case 'strong': return 'bg-green-500';
    case 'medium': return 'bg-yellow-500';
    default: return 'bg-red-500';
  }
};