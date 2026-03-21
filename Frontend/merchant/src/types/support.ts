export interface SupportTicket {
  id: string;
  subject: string;
  type: string; // 'bug' | 'feature' | 'billing' | 'other';
  description: string;
  status: string; // 'open' | 'closed' | 'in_progress';
  priority?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SupportTicketCreateRequest {
  subject: string;
  type: string;
  description: string;
  priority?: string;
  metadata?: Record<string, unknown>;
}
