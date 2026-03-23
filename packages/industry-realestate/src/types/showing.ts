// @ts-nocheck
/**
 * Property Showing Management Types
 * Showing scheduling, management, and feedback
 */

import type { Property, PropertyListing } from './property';
import type { Lead } from './lead';

export type ShowingStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type ShowingType = 'private' | 'open_house' | 'virtual' | 'broker';

export type FeedbackSentiment = 'very_interested' | 'interested' | 'neutral' | 'not_interested' | 'negative';

export type InterestLevel = 'high' | 'medium' | 'low' | 'none';

export interface ShowingClient {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  leadId?: string;
  isExistingLead: boolean;
  notes?: string;
}

export interface Showing {
  id: string;
  merchantId: string;
  listingId: string;
  listing?: PropertyListing;
  propertyId: string;
  property?: Property;
  agentId: string;
  type: ShowingType;
  status: ShowingStatus;
  scheduledAt: Date;
  duration: number; // minutes
  endTime: Date;
  clients: ShowingClient[];
  clientCount: number;
  notes?: string;
  instructions?: string;
  accessCode?: string;
  lockboxCode?: string;
  feedback?: ShowingFeedback;
  reminderSent: boolean;
  reminderSentAt?: Date;
  confirmationSent: boolean;
  confirmationSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  cancelledAt?: Date;
  cancelledReason?: string;
  cancelledBy?: string;
}

export interface OpenHouse extends Showing {
  type: 'open_house';
  maxAttendees?: number;
  currentAttendees: number;
  registrationRequired: boolean;
  marketingMaterials: string[];
  refreshments?: string;
  signInSheet?: string;
}

export interface ShowingFeedback {
  id: string;
  showingId: string;
  submittedAt: Date;
  submittedBy?: string;
  sentiment: FeedbackSentiment;
  interestLevel: InterestLevel;
  priceOpinion?: 'too_high' | 'fair' | 'too_low';
  propertyCondition?: 'excellent' | 'good' | 'fair' | 'poor';
  locationOpinion?: 'excellent' | 'good' | 'fair' | 'poor';
  likedFeatures?: string[];
  dislikedFeatures?: string[];
  concerns?: string[];
  additionalComments?: string;
  followUpRequested: boolean;
  followUpDate?: Date;
  estimatedOfferPrice?: number;
  rating: number; // 1-5
}

export interface ShowingSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  existingShowingId?: string;
}

export interface AvailabilityConfig {
  listingId: string;
  agentId: string;
  daysAvailable: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  slotDuration: number; // minutes
  bufferTime: number; // minutes between showings
  blackoutDates: Date[];
  maxAdvanceDays: number;
  minAdvanceHours: number;
}

export interface ShowingScheduleRequest {
  listingId: string;
  scheduledAt: Date;
  duration?: number;
  type?: ShowingType;
  clients: Omit<ShowingClient, 'id'>[];
  notes?: string;
  instructions?: string;
}

export interface ShowingRescheduleRequest {
  showingId: string;
  newScheduledAt: Date;
  reason?: string;
}

export interface ShowingFilter {
  merchantId?: string;
  listingId?: string;
  agentId?: string;
  propertyId?: string;
  status?: ShowingStatus[];
  type?: ShowingType[];
  scheduledAfter?: Date;
  scheduledBefore?: Date;
  clientName?: string;
  leadId?: string;
}

export interface ShowingStats {
  totalShowings: number;
  completedShowings: number;
  cancelledShowings: number;
  noShows: number;
  conversionRate: number; // showings that led to offers
  avgFeedbackRating: number;
  sentimentBreakdown: Record<FeedbackSentiment, number>;
  interestLevelBreakdown: Record<InterestLevel, number>;
  period: {
    start: Date;
    end: Date;
  };
}

export interface BulkScheduleRequest {
  listingId: string;
  slots: {
    scheduledAt: Date;
    duration: number;
  }[];
  type: ShowingType;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingShowings?: Showing[];
  suggestedSlots?: ShowingSlot[];
}

// Default showing configuration
export const DEFAULT_SHOWING_CONFIG = {
  duration: 30, // minutes
  bufferTime: 15, // minutes between showings
  reminderHours: 24,
  confirmationHours: 2,
  maxAdvanceDays: 30,
  minAdvanceHours: 2,
  maxClientsPerShowing: 4,
};

// Open house defaults
export const DEFAULT_OPEN_HOUSE_CONFIG = {
  duration: 180, // 3 hours
  maxAttendees: 50,
  registrationRequired: false,
  defaultDays: [0, 6], // Sunday and Saturday
  defaultTimes: [
    { start: '13:00', end: '16:00' }, // 1-4 PM
  ],
};
