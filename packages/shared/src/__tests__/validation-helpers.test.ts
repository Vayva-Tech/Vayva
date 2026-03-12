import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isEmpty,
  isValidDate,
  isValidCreditCard,
  validatePassword,
  hasRequiredKeys,
  isInRange,
  isUnique,
} from '../utils/validation-helpers';

describe('validation-helpers utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    it('should accept formatted phone', () => {
      expect(isValidPhone('(123) 456-7890')).toBe(true);
    });

    it('should reject invalid phone', () => {
      expect(isValidPhone('invalid')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URL', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(isValidUrl('invalid')).toBe(false);
      expect(isValidUrl('not-a-url')).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate correct date', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2023-12-25'))).toBe(true);
    });

    it('should reject invalid date', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('not a date')).toBe(false);
    });
  });

  describe('isValidCreditCard', () => {
    it('should validate correct credit card', () => {
      // Valid Visa number (using Luhn algorithm)
      expect(isValidCreditCard('4532015112830366')).toBe(true);
    });

    it('should reject invalid credit card', () => {
      expect(isValidCreditCard('1234567890123456')).toBe(false);
      expect(isValidCreditCard('invalid')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('hasRequiredKeys', () => {
    it('should check required keys exist', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(hasRequiredKeys(obj, ['a', 'b'])).toBe(true);
    });

    it('should fail when required keys missing', () => {
      const obj = { a: 1, b: 2 };
      expect(hasRequiredKeys(obj, ['a', 'c'])).toBe(false);
    });

    it('should fail when required keys are null', () => {
      const obj = { a: 1, b: null };
      expect(hasRequiredKeys(obj, ['a', 'b'])).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should validate value in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
    });

    it('should reject value outside range', () => {
      expect(isInRange(15, 1, 10)).toBe(false);
      expect(isInRange(0, 1, 10)).toBe(false);
    });
  });

  describe('isUnique', () => {
    it('should check array uniqueness', () => {
      expect(isUnique([1, 2, 3, 4])).toBe(true);
      expect(isUnique([1, 2, 2, 3])).toBe(false);
    });

    it('should check uniqueness by key function', () => {
      const array = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Charlie' },
      ];
      expect(isUnique(array, item => item.id.toString())).toBe(false);
      expect(isUnique(array, item => item.name)).toBe(true);
    });
  });
});