// @ts-nocheck
/**
 * Showing Manager
 * Core showing management operations
 */

import type { 
  Showing, 
  ShowingStatus,
  ShowingType,
  ShowingScheduleRequest,
  ShowingRescheduleRequest,
  ShowingFilter,
  ShowingStats,
  BulkScheduleRequest,
  ConflictCheckResult,
  PropertyListing,
} from '../../types';
import { DEFAULT_SHOWING_CONFIG } from '../../types/showing';
import { checkConflicts, calculateEndTime, validateScheduleRequest } from './scheduler';

/**
 * Create a new showing
 */
export function createShowing(
  request: ShowingScheduleRequest,
  listing: PropertyListing,
  agentId: string,
  createdBy: string,
  existingShowings: Showing[] = []
): { success: boolean; error?: string; showing?: Showing } {
  // Check for conflicts
  const duration = request.duration || DEFAULT_SHOWING_CONFIG.duration;
  const conflictCheck = checkConflicts(request, existingShowings, duration);

  if (conflictCheck.hasConflict) {
    return {
      success: false,
      error: 'Scheduling conflict detected with existing showing(s)',
    };
  }

  const now = new Date();
  const scheduledAt = new Date(request.scheduledAt);
  const endTime = calculateEndTime(scheduledAt, duration);

  const showing: Showing = {
    id: `showing-${Date.now()}`,
    merchantId: listing.merchantId,
    listingId: request.listingId,
    propertyId: listing.propertyId,
    agentId,
    type: request.type || 'private',
    status: 'scheduled',
    scheduledAt,
    duration,
    endTime,
    clients: request.clients.map((client, index) => ({
      ...client,
      id: `client-${Date.now()}-${index}`,
    })),
    clientCount: request.clients.length,
    notes: request.notes,
    instructions: request.instructions,
    reminderSent: false,
    confirmationSent: false,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };

  return { success: true, showing };
}

/**
 * Update showing status
 */
export function updateShowingStatus(
  showing: Showing,
  newStatus: ShowingStatus,
  reason?: string,
  updatedBy?: string
): { success: boolean; error?: string; showing?: Showing } {
  // Validate status transition
  const validTransitions: Record<ShowingStatus, ShowingStatus[]> = {
    scheduled: ['confirmed', 'cancelled', 'rescheduled'],
    confirmed: ['in_progress', 'cancelled', 'rescheduled'],
    in_progress: ['completed', 'no_show'],
    completed: [],
    cancelled: ['scheduled'], // Can reactivate
    no_show: ['rescheduled'],
    rescheduled: ['scheduled'],
  };

  if (!validTransitions[showing.status].includes(newStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${showing.status} to ${newStatus}`,
    };
  }

  const updates: Partial<Showing> = {
    status: newStatus,
    updatedAt: new Date(),
  };

  if (newStatus === 'cancelled') {
    updates.cancelledAt = new Date();
    updates.cancelledReason = reason;
    updates.cancelledBy = updatedBy;
  }

  const updatedShowing: Showing = {
    ...showing,
    ...updates,
  };

  return { success: true, showing: updatedShowing };
}

/**
 * Reschedule a showing
 */
export function rescheduleShowing(
  showing: Showing,
  request: ShowingRescheduleRequest,
  existingShowings: Showing[] = [],
  updatedBy?: string
): { success: boolean; error?: string; showing?: Showing } {
  // Check if showing can be rescheduled
  if (showing.status === 'completed' || showing.status === 'cancelled') {
    return {
      success: false,
      error: `Cannot reschedule a ${showing.status} showing`,
    };
  }

  // Check for conflicts at new time
  const rescheduleRequest: ShowingScheduleRequest = {
    listingId: showing.listingId,
    scheduledAt: request.newScheduledAt,
    duration: showing.duration,
    type: showing.type,
    clients: showing.clients,
  };

  const conflictCheck = checkConflicts(rescheduleRequest, existingShowings, showing.duration);

  if (conflictCheck.hasConflict) {
    return {
      success: false,
      error: 'Scheduling conflict detected at the new time',
    };
  }

  const newScheduledAt = new Date(request.newScheduledAt);
  const newEndTime = calculateEndTime(newScheduledAt, showing.duration);

  const updatedShowing: Showing = {
    ...showing,
    scheduledAt: newScheduledAt,
    endTime: newEndTime,
    status: 'rescheduled',
    updatedAt: new Date(),
  };

  return { success: true, showing: updatedShowing };
}

/**
 * Bulk schedule showings
 */
export function bulkScheduleShowings(
  request: BulkScheduleRequest,
  listing: PropertyListing,
  agentId: string,
  createdBy: string,
  existingShowings: Showing[] = []
): { success: boolean; errors?: string[]; showings?: Showing[] } {
  const showings: Showing[] = [];
  const errors: string[] = [];

  for (const slot of request.slots) {
    const scheduleRequest: ShowingScheduleRequest = {
      listingId: request.listingId,
      scheduledAt: slot.scheduledAt,
      duration: slot.duration,
      type: request.type,
      clients: [], // Would need to be provided
    };

    const result = createShowing(
      scheduleRequest,
      listing,
      agentId,
      createdBy,
      [...existingShowings, ...showings]
    );

    if (result.success && result.showing) {
      showings.push(result.showing);
    } else {
      errors.push(`Failed to schedule at ${slot.scheduledAt}: ${result.error}`);
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    showings: showings.length > 0 ? showings : undefined,
  };
}

/**
 * Filter showings
 */
export function filterShowings(
  showings: Showing[],
  filter: ShowingFilter
): Showing[] {
  return showings.filter(showing => {
    if (filter.merchantId && showing.merchantId !== filter.merchantId) return false;
    if (filter.listingId && showing.listingId !== filter.listingId) return false;
    if (filter.agentId && showing.agentId !== filter.agentId) return false;
    if (filter.propertyId && showing.propertyId !== filter.propertyId) return false;
    if (filter.status && !filter.status.includes(showing.status)) return false;
    if (filter.type && !filter.type.includes(showing.type)) return false;
    if (filter.leadId && !showing.clients.some(c => c.leadId === filter.leadId)) return false;
    
    if (filter.scheduledAfter && showing.scheduledAt < filter.scheduledAfter) return false;
    if (filter.scheduledBefore && showing.scheduledAt > filter.scheduledBefore) return false;
    
    if (filter.clientName) {
      const hasMatchingClient = showing.clients.some(c => 
        c.name.toLowerCase().includes(filter.clientName!.toLowerCase())
      );
      if (!hasMatchingClient) return false;
    }

    return true;
  });
}

/**
 * Calculate showing statistics
 */
export function calculateShowingStats(
  showings: Showing[],
  startDate: Date,
  endDate: Date
): ShowingStats {
  const periodShowings = showings.filter(s => 
    s.scheduledAt >= startDate && s.scheduledAt <= endDate
  );

  const completed = periodShowings.filter(s => s.status === 'completed');
  const cancelled = periodShowings.filter(s => s.status === 'cancelled');
  const noShows = periodShowings.filter(s => s.status === 'no_show');

  // Calculate conversion rate (showings with positive feedback)
  const withFeedback = completed.filter(s => s.feedback);
  const positiveFeedback = withFeedback.filter(s => 
    s.feedback!.interestLevel === 'high' || s.feedback!.interestLevel === 'medium'
  );
  const conversionRate = withFeedback.length > 0
    ? positiveFeedback.length / withFeedback.length
    : 0;

  // Calculate average rating
  const ratings = withFeedback
    .filter(s => s.feedback!.rating)
    .map(s => s.feedback!.rating);
  const avgRating = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  // Sentiment breakdown
  const sentimentBreakdown = {
    very_interested: 0,
    interested: 0,
    neutral: 0,
    not_interested: 0,
    negative: 0,
  };

  for (const showing of withFeedback) {
    if (showing.feedback!.sentiment) {
      sentimentBreakdown[showing.feedback!.sentiment]++;
    }
  }

  // Interest level breakdown
  const interestLevelBreakdown = {
    high: 0,
    medium: 0,
    low: 0,
    none: 0,
  };

  for (const showing of withFeedback) {
    if (showing.feedback!.interestLevel) {
      interestLevelBreakdown[showing.feedback!.interestLevel]++;
    }
  }

  return {
    totalShowings: periodShowings.length,
    completedShowings: completed.length,
    cancelledShowings: cancelled.length,
    noShows: noShows.length,
    conversionRate: Math.round(conversionRate * 100) / 100,
    avgFeedbackRating: Math.round(avgRating * 10) / 10,
    sentimentBreakdown,
    interestLevelBreakdown,
    period: { start: startDate, end: endDate },
  };
}

/**
 * Get upcoming showings
 */
export function getUpcomingShowings(
  showings: Showing[],
  hoursAhead: number = 24
): Showing[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

  return showings.filter(s => 
    s.scheduledAt >= now &&
    s.scheduledAt <= cutoff &&
    (s.status === 'scheduled' || s.status === 'confirmed')
  );
}

/**
 * Get today's showings
 */
export function getTodaysShowings(showings: Showing[]): Showing[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return showings.filter(s => 
    s.scheduledAt >= today &&
    s.scheduledAt < tomorrow &&
    (s.status === 'scheduled' || s.status === 'confirmed' || s.status === 'in_progress')
  );
}

/**
 * Mark reminder sent
 */
export function markReminderSent(showing: Showing): Showing {
  return {
    ...showing,
    reminderSent: true,
    reminderSentAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Mark confirmation sent
 */
export function markConfirmationSent(showing: Showing): Showing {
  return {
    ...showing,
    confirmationSent: true,
    confirmationSentAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get showing summary for dashboard
 */
export function getShowingSummary(showings: Showing[]) {
  const now = new Date();
  const today = getTodaysShowings(showings);
  const upcoming = getUpcomingShowings(showings, 168); // 7 days

  const completedThisMonth = showings.filter(s => {
    if (s.status !== 'completed') return false;
    const showingMonth = s.scheduledAt.getMonth();
    const showingYear = s.scheduledAt.getFullYear();
    return showingMonth === now.getMonth() && showingYear === now.getFullYear();
  }).length;

  const withFeedback = showings.filter(s => s.feedback).length;
  const conversionRate = withFeedback > 0
    ? showings.filter(s => 
        s.feedback?.interestLevel === 'high' || s.feedback?.interestLevel === 'medium'
      ).length / withFeedback
    : 0;

  return {
    today: today.length,
    thisWeek: upcoming.length,
    thisMonth: completedThisMonth,
    totalCompleted: showings.filter(s => s.status === 'completed').length,
    totalCancelled: showings.filter(s => s.status === 'cancelled').length,
    noShows: showings.filter(s => s.status === 'no_show').length,
    withFeedback,
    conversionRate: Math.round(conversionRate * 100),
  };
}
