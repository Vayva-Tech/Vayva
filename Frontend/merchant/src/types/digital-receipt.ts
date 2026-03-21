/**
 * Digital Receipt Types
 * Operational Excellence Tools
 */

export interface DigitalReceipt {
  id: string;
  orderId: string;
  storeId: string;
  customerId: string;
  receiptNumber: string;
  qrCodeUrl: string | null;
  receiptUrl: string;
  emailSent: boolean;
  whatsappSent: boolean;
  smsSent: boolean;
  emailOpenedAt: Date | null;
  feedbackSubmitted: boolean;
  feedbackRating: number | null;
  reorderClicked: boolean;
  createdAt: Date;
}

export interface ReceiptData {
  receiptNumber: string;
  storeName: string;
  storeLogo: string | null;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  qrCodeData: string; // URL to verify receipt
  feedbackUrl: string;
  reorderUrl: string;
}

export interface ReceiptAnalytics {
  totalReceipts: number;
  emailOpenRate: number;
  feedbackRate: number;
  averageRating: number;
  reorderRate: number;
  channelBreakdown: {
    email: number;
    whatsapp: number;
    sms: number;
  };
}

// API Request/Response types
export interface CreateReceiptRequest {
  orderId: string;
  customerId: string;
  receiptNumber: string;
  receiptUrl: string;
  qrCodeUrl?: string;
}

export interface SendReceiptRequest {
  receiptId: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'all';
}

export interface SubmitFeedbackRequest {
  receiptId: string;
  rating: number;
  comment?: string;
}

export interface ReceiptVerificationResponse {
  valid: boolean;
  receipt?: ReceiptData;
  message?: string;
}
