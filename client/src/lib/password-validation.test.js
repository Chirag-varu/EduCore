import { describe, it, expect } from 'vitest';
import { validatePasswordStrength } from './password-validation';

describe('validatePasswordStrength', () => {
  it('returns strong and isValid for a fully compliant password', () => {
    const pwd = 'StrongP@ss1';
    const res = validatePasswordStrength(pwd);
    expect(res.isValid).toBe(true);
    expect(res.strength).toBe('strong');
    expect(res.score).toBe(5);
  });

  it('returns weak for a too-short password', () => {
    const pwd = 'Ab1!';
    const res = validatePasswordStrength(pwd);
    expect(res.isValid).toBe(false);
    expect(res.strength).toBe('weak');
  });

  it('returns strong strength string but isValid false when missing special char', () => {
    const pwd = 'Abcd1234';
    const res = validatePasswordStrength(pwd);
    // has upper, lower, numbers, length -> 4 checks -> strength 'strong' by util
    expect(res.strength).toBe('strong');
    expect(res.isValid).toBe(false);
    expect(res.score).toBe(4);
  });
});
