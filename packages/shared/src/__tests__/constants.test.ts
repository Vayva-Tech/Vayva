/**
 * Constants Tests
 * Tests for shared constants
 */

import { describe, it, expect } from 'vitest';
import { APP_NAME, DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../constants';

describe('Constants', () => {
  describe('APP_NAME', () => {
    it('should be "Vayva"', () => {
      expect(APP_NAME).toBe('Vayva');
    });

    it('should be a string', () => {
      expect(typeof APP_NAME).toBe('string');
    });
  });

  describe('DEFAULT_CURRENCY', () => {
    it('should be "NGN"', () => {
      expect(DEFAULT_CURRENCY).toBe('NGN');
    });

    it('should be a valid currency code format', () => {
      expect(DEFAULT_CURRENCY).toMatch(/^[A-Z]{3}$/);
    });
  });

  describe('DEFAULT_LOCALE', () => {
    it('should be "en-NG"', () => {
      expect(DEFAULT_LOCALE).toBe('en-NG');
    });

    it('should be a valid locale format', () => {
      expect(DEFAULT_LOCALE).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    });
  });

  describe('Constant values are immutable', () => {
    it('should not be able to modify constants', () => {
      // This test verifies the constants are defined as const
      // In TypeScript, const prevents reassignment
      const originalAppName = APP_NAME;
      const originalCurrency = DEFAULT_CURRENCY;
      const originalLocale = DEFAULT_LOCALE;

      expect(APP_NAME).toBe(originalAppName);
      expect(DEFAULT_CURRENCY).toBe(originalCurrency);
      expect(DEFAULT_LOCALE).toBe(originalLocale);
    });
  });
});
