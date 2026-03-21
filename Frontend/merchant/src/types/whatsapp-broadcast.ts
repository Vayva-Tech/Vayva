/**
 * WhatsApp Broadcast Pro Types
 * Implementation Plan 3: Customer Experience & Marketing
 */

export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type TemplateCategory = 'marketing' | 'transactional' | 'utility';
export type TemplateApprovalStatus = 'pending' | 'approved' | 'rejected';
export type RecipientStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppBroadcast {
  id: string;
  storeId: string;
  name: string;
  segmentId: string | null;
  templateId: string | null;
  content: string;
  mediaUrl: string | null;
  status: BroadcastStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openCount: number;
  clickCount: number;
  createdAt: Date;
  createdBy: string;
  // Joined fields
  segmentName?: string;
  templateName?: string;
}

export interface WhatsAppTemplate {
  id: string;
  storeId: string;
  name: string;
  category: TemplateCategory;
  content: string;
  variables: string[];
  mediaUrl: string | null;
  isApproved: boolean;
  approvalStatus: TemplateApprovalStatus;
  rejectionReason: string | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppBroadcastRecipient {
  id: string;
  broadcastId: string;
  customerId: string;
  phoneNumber: string;
  status: RecipientStatus;
  errorCode: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  readAt: Date | null;
  // Joined fields
  customerName?: string;
}

export interface BroadcastAnalytics {
  totalBroadcasts: number;
  totalSent: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  topPerforming: WhatsAppBroadcast[];
}

export interface CreateBroadcastInput {
  name: string;
  segmentId?: string;
  templateId?: string;
  content: string;
  mediaUrl?: string;
  scheduledAt?: Date;
}

export interface CreateTemplateInput {
  name: string;
  category: TemplateCategory;
  content: string;
  variables?: string[];
  mediaUrl?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {}
