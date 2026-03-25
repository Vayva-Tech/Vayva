// Phase 4 Industry Types - B2B Wholesale, Events & Ticketing, Nonprofit

// ============================================================================
// B2B WHOLESALE
// ============================================================================

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type RequisitionUrgency = 'low' | 'normal' | 'high' | 'urgent';
export type RequisitionStatus = 'pending' | 'approved' | 'rejected' | 'ordered' | 'cancelled';

export interface Quote {
  id: string;
  storeId: string;
  customerId: string;
  quoteNumber: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  expiryDate: Date;
  notes?: string;
  terms?: string;
  convertedToOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface CreateQuoteInput {
  storeId: string;
  customerId: string;
  items: Omit<QuoteItem, 'id' | 'quoteId' | 'total'>[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  expiryDate?: Date;
  notes?: string;
  terms?: string;
}

export interface UpdateQuoteInput {
  items?: Omit<QuoteItem, 'id' | 'quoteId' | 'total'>[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  status?: QuoteStatus;
  expiryDate?: Date;
  notes?: string;
  terms?: string;
}

export interface CreditAccount {
  id: string;
  storeId: string;
  customerId: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  paymentTerms: string;
  interestRate: number;
  isActive: boolean;
  approvedBy: string;
  approvedAt: Date;
}

export interface CreateCreditAccountInput {
  storeId: string;
  customerId: string;
  creditLimit: number;
  paymentTerms?: string;
  interestRate?: number;
  approvedBy: string;
}

export interface Requisition {
  id: string;
  storeId: string;
  customerId: string;
  requesterName: string;
  requesterEmail: string;
  approverId?: string;
  status: RequisitionStatus;
  urgency: RequisitionUrgency;
  neededBy?: Date;
  notes?: string;
  items: RequisitionItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RequisitionItem {
  id: string;
  requisitionId: string;
  productId: string;
  quantity: number;
  maxPrice?: number;
  notes?: string;
}

export interface CreateRequisitionInput {
  storeId: string;
  customerId: string;
  requesterName: string;
  requesterEmail?: string;
  items: Omit<RequisitionItem, 'id' | 'requisitionId'>[];
  urgency?: RequisitionUrgency;
  neededBy?: Date;
  notes?: string;
}

// ============================================================================
// EVENTS & TICKETING
// ============================================================================

export type EventStatus =
  | 'draft'
  | 'published'
  | 'cancelled'
  | 'completed'
  | 'sold_out';
export type TicketStatus = 'active' | 'refunded' | 'cancelled' | 'used';

export interface Event {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  venue?: string;
  address?: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  status: EventStatus;
  /** Lowest ticket price (display); optional when not ticketed */
  price?: number;
  capacity: number;
  bannerImage?: string;
  organizerId: string;
  category: string;
  isPublic: boolean;
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  storeId: string;
  title: string;
  description?: string;
  venue?: string;
  address?: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
  capacity: number;
  bannerImage?: string;
  organizerId: string;
  category: string;
  isPublic?: boolean;
  requiresApproval?: boolean;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  remaining: number;
  salesStart: Date;
  salesEnd: Date;
  maxPerOrder: number;
  benefits: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketTierInput {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  salesStart: Date;
  salesEnd: Date;
  maxPerOrder?: number;
  benefits?: string[];
}

export interface TicketPurchase {
  id: string;
  tierId: string;
  eventId: string;
  customerId: string;
  orderId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: TicketStatus;
  ticketNumber: string;
  qrCode?: string;
  checkedInAt?: Date;
  checkedInBy?: string;
  seatNumber?: string;
  transferredFrom?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketPurchaseInput {
  tierId: string;
  eventId: string;
  customerId: string;
  orderId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  seatNumber?: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;
  checkedIn: boolean;
  checkedInAt?: Date;
  notes?: string;
  createdAt: Date;
}

export interface CreateEventAttendeeInput {
  eventId: string;
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;
  notes?: string;
}

export interface CheckInInput {
  ticketNumber: string;
  checkedInBy: string;
}

// ============================================================================
// NONPROFIT
// ============================================================================

export type CampaignStatus = 'active' | 'completed' | 'cancelled' | 'paused';
export type DonationStatus = 'pending' | 'completed' | 'refunded' | 'failed';
export type DonationType = 'one_time' | 'recurring' | 'in_kind' | 'memorial' | 'tribute' | 'matching' | 'stock' | 'grant';
export type VolunteerStatus = 'active' | 'inactive' | 'suspended';
export type GrantStatus = 'pending' | 'approved' | 'active' | 'completed' | 'rejected';

export interface DonationCampaign {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  goal: number;
  raised: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  status: CampaignStatus;
  bannerImage?: string;
  featured: boolean;
  impactMetrics?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDonationCampaignInput {
  storeId: string;
  title: string;
  description?: string;
  goal: number;
  currency?: string;
  startDate: Date;
  endDate?: Date;
  bannerImage?: string;
  impactMetrics?: Record<string, number>;
}

export interface Donation {
  id: string;
  campaignId?: string;
  storeId: string;
  donorId?: string;
  donorEmail: string;
  donorName?: string;
  amount: number;
  currency: string;
  isAnonymous: boolean;
  message?: string;
  recurring: boolean;
  frequency?: string;
  paymentMethod: string;
  status: DonationStatus;
  receiptSent: boolean;
  receiptUrl?: string;
  taxReceiptNumber?: string;
  matchedBy?: string;
  matchedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDonationInput {
  campaignId?: string;
  storeId: string;
  donorId?: string;
  donorEmail: string;
  donorName?: string;
  amount: number;
  currency?: string;
  isAnonymous?: boolean;
  message?: string;
  recurring?: boolean;
  frequency?: string;
  paymentMethod: string;
}

export interface Volunteer {
  id: string;
  storeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  skills: string[];
  availability?: Record<string, any>;
  emergencyContact?: string;
  backgroundCheck?: string;
  status: VolunteerStatus;
  hoursVolunteered: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVolunteerInput {
  storeId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  skills?: string[];
  availability?: Record<string, any>;
  emergencyContact?: string;
}

export interface VolunteerShift {
  id: string;
  storeId: string;
  eventId?: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  volunteersNeeded: number;
  volunteersAssigned: string[];
  status: 'open' | 'filled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVolunteerShiftInput {
  storeId: string;
  eventId?: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  volunteersNeeded: number;
}

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  shiftId: string;
  status: 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  checkedInAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grant {
  id: string;
  storeId: string;
  name: string;
  funder: string;
  amount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  status: GrantStatus;
  requirements?: string;
  restrictions?: string;
  reportingSchedule?: string;
  fundsAllocated: number;
  fundsSpent: number;
  documents?: Record<string, string>[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGrantInput {
  storeId: string;
  name: string;
  funder: string;
  amount: number;
  currency?: string;
  startDate: Date;
  endDate: Date;
  requirements?: string;
  restrictions?: string;
  reportingSchedule?: string;
}

export interface GrantExpense {
  id: string;
  grantId: string;
  category: string;
  description: string;
  amount: number;
  receiptUrl?: string;
  date: Date;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface CreateGrantExpenseInput {
  grantId: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  receiptUrl?: string;
}
