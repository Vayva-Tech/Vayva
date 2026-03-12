import {
  formatCompactNumber,
  formatPercentage,
  clamp,
  roundToMultiple,
  percentageChange,
  formatBytes,
  normalize,
  interpolate,
} from '../utils/number-formatting';

describe('number-formatting utilities', () => {
  describe('formatCompactNumber', () => {
    it('should format thousands', () => {
      expect(formatCompactNumber(1500)).toBe('1.5K');
    });

    it('should format millions', () => {
      expect(formatCompactNumber(2500000)).toBe('2.5M');
    });

    it('should format billions', () => {
      expect(formatCompactNumber(3500000000)).toBe('3.5B');
    });

    it('should not format small numbers', () => {
      expect(formatCompactNumber(999)).toBe('999');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercentage(45.67)).toBe('45.7%');
    });

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(45.67, 2)).toBe('45.67%');
    });
  });

  describe('clamp', () => {
    it('should clamp value to min', () => {
      expect(clamp(5, 10, 20)).toBe(10);
    });

    it('should clamp value to max', () => {
      expect(clamp(25, 10, 20)).toBe(20);
    });

    it('should not clamp value within range', () => {
      expect(clamp(15, 10, 20)).toBe(15);
    });
  });

  describe('roundToMultiple', () => {
    it('should round to nearest multiple', () => {
      expect(roundToMultiple(23, 5)).toBe(25);
    });

    it('should round down to nearest multiple', () => {
      expect(roundToMultiple(22, 5)).toBe(20);
    });
  });

  describe('percentageChange', () => {
    it('should calculate positive percentage change', () => {
      expect(percentageChange(100, 150)).toBe(50);
    });

    it('should calculate negative percentage change', () => {
      expect(percentageChange(100, 75)).toBe(-25);
    });

    it('should handle zero original value', () => {
      expect(percentageChange(0, 50)).toBe(100);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(formatBytes(512)).toBe('512 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('normalize', () => {
    it('should normalize value to 0-1 range', () => {
      expect(normalize(50, 0, 100)).toBe(0.5);
    });

    it('should handle edge cases', () => {
      expect(normalize(0, 0, 0)).toBe(0);
      expect(normalize(10, 5, 5)).toBe(0);
    });
  });

  describe('interpolate', () => {
    it('should interpolate between values', () => {
      expect(interpolate(10, 20, 0.5)).toBe(15);
    });

    it('should handle factor of 0', () => {
      expect(interpolate(10, 20, 0)).toBe(10);
    });

    it('should handle factor of 1', () => {
      expect(interpolate(10, 20, 1)).toBe(20);
    });
  });
});