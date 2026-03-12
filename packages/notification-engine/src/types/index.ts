/**
 * Notification System Types
 */

export type NotificationChannel = 
  | 'email' 
  | 'sms' 
  | 'push' 
  | 'in-app' 
  | 'slack' 
  | 'whatsapp'
  | 'webhook';

export type NotificationPriority = 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'urgent' 
  | 'critical';

export type NotificationStatus = 
  | 'pending' 
  | 'sent' 
  | 'delivered' 
  | 'failed' 
  | 'queued'
  | 'cancelled';

export interface NotificationPayload {
  /** Unique identifier for the notification */
  id?: string;
  
  /** Recipient information */
  recipient: {
    userId?: string;
    storeId?: string;
    email?: string;
    phoneNumber?: string;
    deviceId?: string;
    slackChannel?: string;
    webhookUrl?: string;
  };
  
  /** Content */
  subject: string;
  body: string;
  data?: Record<string, unknown>;
  
  /** Metadata */
  category: string;
  priority: NotificationPriority;
  tags?: string[];
  
  /** Timing */
  scheduledFor?: Date;
  expiresAt?: Date;
  
  /** Delivery options */
  channels: NotificationChannel[];
  deduplicationKey?: string;
  maxRetries?: number;
  retryDelayMs?: number;
  
  /** Context */
  source: string;
  eventId?: string;
  correlationId?: string;
}

export interface DispatchResult {
  success: boolean;
  messageId?: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  error?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChannelCredentials {
  apiKey?: string;
  authToken?: string;
  webhookUrl?: string;
  fromAddress?: string;
  fromNumber?: string;
  businessAccountId?: string;
}

export interface ChannelConfig {
  enabled: boolean;
  credentials: ChannelCredentials;
  rateLimit?: {
    maxPerMinute: number;
    maxPerHour: number;
  };
  fallbackChannels?: NotificationChannel[];
}

export interface DeliveryAttempt {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  attemptNumber: number;
  errorMessage?: string;
  providerResponse?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRule {
  id: string;
  name: string;
  description?: string;
  
  // Trigger configuration
  trigger: {
    type: 'event' | 'threshold' | 'schedule' | 'ai-insight';
    event?: string;
    threshold?: {
      metric: string;
      operator: 'greater-than' | 'less-than' | 'equals' | 'crosses';
      value: number;
    };
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string; // "09:00"
    };
  };
  
  // Conditions (optional)
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater-than' | 'less-than';
    value: any;
  }>;
  
  // Actions to take when rule triggers
  actions: Array<{
    type: NotificationChannel;
    recipient?: string;
    template: string;
    variables?: Record<string, any>;
  }>;
  
  // Delivery options
  deliveryOptions: {
    immediate: boolean;
    batchWithSimilar: boolean;
    batchWindowMinutes: number;
    retryOnFailure: boolean;
    maxRetries: number;
  };
  
  // Quiet hours behavior
  respectQuietHours: boolean;
  
  // Status
  enabled: boolean;
}

export interface NotificationMessage {
  id: string;
  subject: string;
  body: string;
  recipients: Array<{ 
    userId?: string; 
    storeId?: string; 
    email?: string; 
    phoneNumber?: string; 
    deviceId?: string; 
    slackChannel?: string; 
    webhookUrl?: string; 
  }>;
  channel: NotificationChannel;
  priority: NotificationPriority;
  category: string;
  metadata?: {
    source: string;
    eventId?: string;
    data?: Record<string, unknown>;
  };
  createdAt: Date;
}

export interface NotificationLog {
  id: string;
  notificationId: string;
  storeId?: string;
  userId?: string;
  category: string;
  priority: NotificationPriority;
  channelsAttempted: NotificationChannel[];
  channelsSuccessful: NotificationChannel[];
  totalAttempts: number;
  firstAttemptAt: Date;
  lastAttemptAt: Date;
  status: NotificationStatus;
  failureReason?: string;
  engagementMetrics?: {
    opened?: boolean;
    clicked?: boolean;
    dismissed?: boolean;
    openedAt?: Date;
    clickedAt?: Date;
  };
}