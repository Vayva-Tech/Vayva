/**
 * Format Utilities Tests
 * Tests for formatting functions
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatPercent,
} from '../utils/format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format number as NGN currency by default', () => {
      expect(formatCurrency(1000)).toBe('₦1,000');
      expect(formatCurrency(1500.5)).toBe('₦1,500.5');
    });

    it('should format with different currencies', () => {
      // Using en-NG locale, USD may display as US$ instead of $
      const usd = formatCurrency(1000, 'USD');
      expect(usd).toMatch(/\$1,000/);
      
      const eur = formatCurrency(1000, 'EUR');
      expect(eur).toMatch(/€1,000/);
      
      const gbp = formatCurrency(1000, 'GBP');
      expect(gbp).toMatch(/£1,000/);
    });

    it('should handle string numbers', () => {
      expect(formatCurrency('1000')).toBe('₦1,000');
      expect(formatCurrency('1500.50')).toBe('₦1,500.5');
    });

    it('should return em dash for null/undefined', () => {
      expect(formatCurrency(null)).toBe('—');
      expect(formatCurrency(undefined)).toBe('—');
    });

    it('should return em dash for NaN', () => {
      expect(formatCurrency('not-a-number')).toBe('—');
      expect(formatCurrency(NaN)).toBe('—');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₦0');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('-₦1,000');
    });
  });

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toContain('Mar');
      expect(formatDate(date)).toContain('2024');
    });

    it('should format date string', () => {
      expect(formatDate('2024-03-15')).toContain('Mar');
      expect(formatDate('2024-03-15')).toContain('2024');
    });

    it('should format timestamp', () => {
      const timestamp = new Date('2024-03-15').getTime();
      expect(formatDate(timestamp)).toContain('Mar');
    });

    it('should return em dash for null/undefined', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });

    it('should return em dash for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('—');
      expect(formatDate(NaN)).toBe('—');
    });

    it('should accept custom options', () => {
      const date = new Date('2024-03-15');
      const result = formatDate(date, { month: 'long', day: 'numeric' });
      expect(result).toContain('March');
    });
  });

  describe('formatDateTime', () => {
    it('should format with time', () => {
      const date = new Date('2024-03-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toContain('Mar');
      expect(result).toContain('2024');
      expect(result).toContain(':'); // Time separator
    });

    it('should return em dash for null/undefined', () => {
      expect(formatDateTime(null)).toBe('—');
      expect(formatDateTime(undefined)).toBe('—');
    });

    it('should accept custom options', () => {
      const date = new Date('2024-03-15T14:30:00');
      const result = formatDateTime(date, { hour12: true });
      expect(result).toContain('Mar');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format just now', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('5m ago');
    });

    it('should format hours ago', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('3h ago');
    });

    it('should format days ago', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('2d ago');
    });

    it('should format months ago', () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('2mo ago');
    });

    it('should format years ago', () => {
      const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(date)).toBe('1y ago');
    });

    it('should return em dash for null/undefined', () => {
      expect(formatRelativeTime(null)).toBe('—');
      expect(formatRelativeTime(undefined)).toBe('—');
    });

    it('should return em dash for invalid date', () => {
      expect(formatRelativeTime('invalid')).toBe('—');
    });
  });

  describe('formatNumber', () => {
    it('should format number with commas', () => {
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1500.5)).toBe('1,500.5');
    });

    it('should handle string numbers', () => {
      expect(formatNumber('1000000')).toBe('1,000,000');
    });

    it('should return em dash for null/undefined', () => {
      expect(formatNumber(null)).toBe('—');
      expect(formatNumber(undefined)).toBe('—');
    });

    it('should return em dash for NaN', () => {
      expect(formatNumber('not-a-number')).toBe('—');
    });

    it('should accept custom options', () => {
      expect(formatNumber(0.5, { style: 'percent' })).toBe('50%');
    });
  });

  describe('formatPercent', () => {
    it('should format as percentage', () => {
      expect(formatPercent(50)).toBe('50.0%');
      expect(formatPercent(50.5)).toBe('50.5%');
    });

    it('should handle string numbers', () => {
      expect(formatPercent('75')).toBe('75.0%');
    });

    it('should respect decimal places', () => {
      expect(formatPercent(50, 0)).toBe('50%');
      expect(formatPercent(50, 2)).toBe('50.00%');
    });

    it('should return em dash for null/undefined', () => {
      expect(formatPercent(null)).toBe('—');
      expect(formatPercent(undefined)).toBe('—');
    });

    it('should return em dash for NaN', () => {
      expect(formatPercent('not-a-number')).toBe('—');
    });
  });
});
