import { describe, it, expect } from 'vitest'
import { 
  validatePasswordStrength, 
  getPasswordStrengthColor, 
  getPasswordStrengthBg 
} from '../password-validation'

describe('Password Validation Utils', () => {
  describe('validatePasswordStrength', () => {
    it('should return invalid for empty password', () => {
      const result = validatePasswordStrength('')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
      expect(result.score).toBe(0)
    })

    it('should return invalid for weak password', () => {
      const result = validatePasswordStrength('weak')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('weak')
      expect(result.score).toBe(1) // Only lowercase
    })

    it('should return medium strength for partially strong password', () => {
      const result = validatePasswordStrength('WeakPass123')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('medium')
      expect(result.score).toBe(4) // Missing special char
    })

    it('should return valid and strong for strong password', () => {
      const result = validatePasswordStrength('StrongPass123!')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
      expect(result.score).toBe(5)
    })

    it('should correctly identify all requirements', () => {
      const result = validatePasswordStrength('Test123!')
      expect(result.requirements).toHaveLength(5)
      expect(result.requirements.every(req => req.passed)).toBe(true)
    })

    it('should correctly identify failed requirements', () => {
      const result = validatePasswordStrength('weak')
      const failedReqs = result.requirements.filter(req => !req.passed)
      expect(failedReqs).toHaveLength(4) // Missing: length, uppercase, numbers, special chars
    })
  })

  describe('getPasswordStrengthColor', () => {
    it('should return correct colors for each strength level', () => {
      expect(getPasswordStrengthColor('weak')).toBe('text-red-600')
      expect(getPasswordStrengthColor('medium')).toBe('text-yellow-600')
      expect(getPasswordStrengthColor('strong')).toBe('text-green-600')
    })
  })

  describe('getPasswordStrengthBg', () => {
    it('should return correct background colors for each strength level', () => {
      expect(getPasswordStrengthBg('weak')).toBe('bg-red-500')
      expect(getPasswordStrengthBg('medium')).toBe('bg-yellow-500')
      expect(getPasswordStrengthBg('strong')).toBe('bg-green-500')
    })
  })
})