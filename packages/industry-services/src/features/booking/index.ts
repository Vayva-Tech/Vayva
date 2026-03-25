/**
 * Booking Feature Module
 * Dedicated module for booking functionality
 */

export interface BookingFeatureConfig {
  enableReminders: boolean;
  reminderHoursBefore: number;
  enableAutoConfirm: boolean;
  confirmationWindowHours: number;
  enableRescheduling: boolean;
  rescheduleWindowHours: number;
}

export const DEFAULT_BOOKING_CONFIG: BookingFeatureConfig = {
  enableReminders: true,
  reminderHoursBefore: 24,
  enableAutoConfirm: false,
  confirmationWindowHours: 48,
  enableRescheduling: true,
  rescheduleWindowHours: 24,
};