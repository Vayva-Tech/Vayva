/**
 * Showing Scheduler
 * Manages showing availability and scheduling
 */

import type { 
  Showing, 
  ShowingSlot, 
  AvailabilityConfig, 
  ShowingScheduleRequest,
  ConflictCheckResult,
  PropertyListing,
} from '../../types';
import { DEFAULT_SHOWING_CONFIG } from '../../types/showing';

/**
 * Generate available time slots for a listing
 */
export function generateAvailableSlots(
  listingId: string,
  config: AvailabilityConfig,
  existingShowings: Showing[],
  startDate: Date = new Date(),
  daysToGenerate: number = 14
): ShowingSlot[] {
  const slots: ShowingSlot[] = [];
  const slotDuration = config.slotDuration;
  const bufferTime = config.bufferTime;
  const totalSlotTime = slotDuration + bufferTime;

  for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    // Check if this day is available
    const dayOfWeek = currentDate.getDay();
    if (!config.daysAvailable.includes(dayOfWeek)) continue;

    // Check if this is a blackout date
    const isBlackout = config.blackoutDates.some(bd => 
      bd.toDateString() === currentDate.toDateString()
    );
    if (isBlackout) continue;

    // Parse start and end times
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.endTime.split(':').map(Number);

    let slotTime = new Date(currentDate);
    slotTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(currentDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Generate slots for this day
    while (slotTime < endTime) {
      const slotEndTime = new Date(slotTime.getTime() + slotDuration * 60000);
      
      // Check for conflicts with existing showings
      const conflictingShowing = findConflictingShowing(
        slotTime,
        slotEndTime,
        existingShowings
      );

      slots.push({
        startTime: new Date(slotTime),
        endTime: slotEndTime,
        available: !conflictingShowing,
        existingShowingId: conflictingShowing?.id,
      });

      // Move to next slot
      slotTime = new Date(slotTime.getTime() + totalSlotTime * 60000);
    }
  }

  return slots;
}

/**
 * Find a conflicting showing
 */
function findConflictingShowing(
  startTime: Date,
  endTime: Date,
  showings: Showing[]
): Showing | undefined {
  return showings.find(showing => {
    // Skip cancelled showings
    if (showing.status === 'cancelled' || showing.status === 'no_show') {
      return false;
    }

    const showingStart = new Date(showing.scheduledAt);
    const showingEnd = new Date(showing.endTime);

    // Check for overlap
    return (
      (startTime >= showingStart && startTime < showingEnd) ||
      (endTime > showingStart && endTime <= showingEnd) ||
      (startTime <= showingStart && endTime >= showingEnd)
    );
  });
}

/**
 * Check for scheduling conflicts
 */
export function checkConflicts(
  request: ShowingScheduleRequest,
  existingShowings: Showing[],
  duration: number = DEFAULT_SHOWING_CONFIG.duration
): ConflictCheckResult {
  const requestedStart = new Date(request.scheduledAt);
  const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

  const conflictingShowings: Showing[] = [];

  for (const showing of existingShowings) {
    if (showing.status === 'cancelled' || showing.status === 'no_show') {
      continue;
    }

    const showingStart = new Date(showing.scheduledAt);
    const showingEnd = new Date(showing.endTime);

    // Check for overlap
    const hasConflict = (
      (requestedStart >= showingStart && requestedStart < showingEnd) ||
      (requestedEnd > showingStart && requestedEnd <= showingEnd) ||
      (requestedStart <= showingStart && requestedEnd >= showingEnd)
    );

    if (hasConflict) {
      conflictingShowings.push(showing);
    }
  }

  return {
    hasConflict: conflictingShowings.length > 0,
    conflictingShowings: conflictingShowings.length > 0 ? conflictingShowings : undefined,
  };
}

/**
 * Find alternative slots when there's a conflict
 */
export function findAlternativeSlots(
  request: ShowingScheduleRequest,
  config: AvailabilityConfig,
  existingShowings: Showing[],
  count: number = 3
): ShowingSlot[] {
  const allSlots = generateAvailableSlots(
    request.listingId,
    config,
    existingShowings,
    new Date(),
    7
  );

  // Filter for available slots around the requested time
  const requestedTime = new Date(request.scheduledAt);
  const requestedHour = requestedTime.getHours();

  return allSlots
    .filter(slot => slot.available)
    .filter(slot => {
      // Prefer slots on the same day
      const slotHour = slot.startTime.getHours();
      return Math.abs(slotHour - requestedHour) <= 2;
    })
    .slice(0, count);
}

/**
 * Validate a schedule request
 */
export function validateScheduleRequest(
  request: ShowingScheduleRequest,
  config: AvailabilityConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const scheduledAt = new Date(request.scheduledAt);
  const now = new Date();

  // Check minimum advance notice
  const hoursUntilShowing = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilShowing < config.minAdvanceHours) {
    errors.push(`Showings must be scheduled at least ${config.minAdvanceHours} hours in advance`);
  }

  // Check maximum advance booking
  const daysUntilShowing = hoursUntilShowing / 24;
  if (daysUntilShowing > config.maxAdvanceDays) {
    errors.push(`Showings cannot be scheduled more than ${config.maxAdvanceDays} days in advance`);
  }

  // Check if day is available
  const dayOfWeek = scheduledAt.getDay();
  if (!config.daysAvailable.includes(dayOfWeek)) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    errors.push(`Showings are not available on ${dayNames[dayOfWeek]}s`);
  }

  // Check if time is within available hours
  const [startHour, startMinute] = config.startTime.split(':').map(Number);
  const [endHour, endMinute] = config.endTime.split(':').map(Number);
  
  const showingHour = scheduledAt.getHours();
  const showingMinute = scheduledAt.getMinutes();
  
  const showingTime = showingHour * 60 + showingMinute;
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  if (showingTime < startTime || showingTime >= endTime) {
    errors.push(`Showings must be between ${config.startTime} and ${config.endTime}`);
  }

  // Check blackout dates
  const isBlackout = config.blackoutDates.some(bd => 
    bd.toDateString() === scheduledAt.toDateString()
  );
  if (isBlackout) {
    errors.push('This date is not available for showings');
  }

  // Validate clients
  if (!request.clients || request.clients.length === 0) {
    errors.push('At least one client is required');
  }

  for (const client of request.clients) {
    if (!client.name) {
      errors.push('Client name is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate end time for a showing
 */
export function calculateEndTime(
  startTime: Date,
  duration: number = DEFAULT_SHOWING_CONFIG.duration
): Date {
  return new Date(startTime.getTime() + duration * 60000);
}

/**
 * Get default availability config for a listing
 */
export function getDefaultAvailabilityConfig(
  listingId: string,
  agentId: string
): AvailabilityConfig {
  return {
    listingId,
    agentId,
    daysAvailable: [1, 2, 3, 4, 5, 6], // Monday-Saturday
    startTime: '09:00',
    endTime: '18:00',
    slotDuration: DEFAULT_SHOWING_CONFIG.duration,
    bufferTime: DEFAULT_SHOWING_CONFIG.bufferTime,
    blackoutDates: [],
    maxAdvanceDays: DEFAULT_SHOWING_CONFIG.maxAdvanceDays,
    minAdvanceHours: DEFAULT_SHOWING_CONFIG.minAdvanceHours,
  };
}

/**
 * Check if a showing needs a reminder
 */
export function needsReminder(
  showing: Showing,
  reminderHours: number = DEFAULT_SHOWING_CONFIG.reminderHours
): boolean {
  if (showing.reminderSent) return false;
  if (showing.status !== 'scheduled' && showing.status !== 'confirmed') return false;

  const now = new Date();
  const showingTime = new Date(showing.scheduledAt);
  const hoursUntilShowing = (showingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntilShowing <= reminderHours && hoursUntilShowing > 0;
}

/**
 * Check if a showing needs a confirmation
 */
export function needsConfirmation(
  showing: Showing,
  confirmationHours: number = DEFAULT_SHOWING_CONFIG.confirmationHours
): boolean {
  if (showing.confirmationSent) return false;
  if (showing.status !== 'scheduled') return false;

  const now = new Date();
  const showingTime = new Date(showing.scheduledAt);
  const hoursUntilShowing = (showingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntilShowing <= confirmationHours && hoursUntilShowing > 0;
}

/**
 * Get upcoming showings that need reminders
 */
export function getShowingsNeedingReminders(
  showings: Showing[],
  reminderHours: number = DEFAULT_SHOWING_CONFIG.reminderHours
): Showing[] {
  return showings.filter(s => needsReminder(s, reminderHours));
}

/**
 * Get upcoming showings that need confirmations
 */
export function getShowingsNeedingConfirmations(
  showings: Showing[],
  confirmationHours: number = DEFAULT_SHOWING_CONFIG.confirmationHours
): Showing[] {
  return showings.filter(s => needsConfirmation(s, confirmationHours));
}
