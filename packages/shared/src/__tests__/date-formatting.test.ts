import {
  formatDateAdvanced,
  formatRelativeTimeAdvanced,
  startOfPeriod,
  businessDaysBetween,
  timezoneConverter,
  formatDuration,
} from '../utils/date-formatting';

describe('date-formatting utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25');
      expect(formatDateAdvanced(date)).toBe('Dec 25, 2023');
    });

    it('should format string date correctly', () => {
      expect(formatDateAdvanced('2023-12-25')).toBe('Dec 25, 2023');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format future dates correctly', () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      expect(formatRelativeTimeAdvanced(futureDate)).toContain('in 2 days');
    });

    it('should format past dates correctly', () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      expect(formatRelativeTimeAdvanced(pastDate)).toContain('1 hour ago');
    });
  });

  describe('startOfPeriod', () => {
    it('should get start of day', () => {
      const date = new Date('2023-12-25T15:30:00');
      const startOfDay = startOfPeriod(date, 'day');
      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
    });

    it('should get start of month', () => {
      const date = new Date('2023-12-25');
      const startOfMonth = startOfPeriod(date, 'month');
      expect(startOfMonth.getDate()).toBe(1);
      expect(startOfMonth.getMonth()).toBe(11); // December
    });
  });

  describe('businessDaysBetween', () => {
    it('should calculate business days excluding weekends', () => {
      const start = new Date('2023-12-25'); // Monday
      const end = new Date('2023-12-29');   // Friday
      expect(businessDaysBetween(start, end)).toBe(5);
    });

    it('should exclude weekends', () => {
      const start = new Date('2023-12-22'); // Friday
      const end = new Date('2023-12-27');   // Wednesday (includes weekend)
      expect(businessDaysBetween(start, end)).toBe(4); // Fri, Mon, Tue, Wed
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(45000)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(125000)).toBe('2m 5s');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(3725000)).toBe('1h 2m');
    });

    it('should format days and hours', () => {
      expect(formatDuration(90000000)).toBe('1d 1h');
    });
  });
});