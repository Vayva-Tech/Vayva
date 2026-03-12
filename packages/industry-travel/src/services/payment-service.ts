import type { PaymentMethod, NotificationPayload } from '../types';

export interface PaystackConfig {
  secretKey: string;
  publicKey: string;
  webhookUrl: string;
}

export interface TransactionInitializeArgs {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface TransactionInitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface TransactionVerifyResult {
  status: 'success' | 'failed' | 'abandoned';
  amountKobo: number | null;
  paidAt: string | null;
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface RefundArgs {
  transaction: string;
  amount?: number;
  customerNote?: string;
  merchantNote?: string;
}

export interface RefundResult {
  status: 'success' | 'failed';
  refundId?: string;
  amountRefunded?: number;
  errorMessage?: string;
}

export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
}

/**
 * TravelPaymentService - Handles payment processing for travel bookings
 */
export class TravelPaymentService {
  private config: PaystackConfig;
  private baseUrl = 'https://api.paystack.co';

  constructor(config: PaystackConfig) {
    this.config = config;
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(
    amount: number,
    bookingId: string,
    customerEmail: string
  ): Promise<TransactionInitializeResult> {
    try {
      // Convert to kobo (Paystack uses kobo for NGN transactions)
      const amountKobo = Math.round(amount * 100);
      const reference = this.generateReference(bookingId);
      
      const response = await this.makeRequest('/transaction/initialize', {
        method: 'POST',
        body: JSON.stringify({
          email: customerEmail,
          amount: amountKobo,
          reference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirm?bookingId=${bookingId}`,
          metadata: {
            bookingId,
            custom_fields: [
              { display_name: 'Booking ID', variable_name: 'booking_id', value: bookingId }
            ]
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Paystack API error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.message || 'Failed to initialize payment');
      }

      return {
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference
      };

    } catch (error) {
      console.error('Payment initialization failed:', error);
      throw new Error('Unable to process payment at this time');
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(paymentId: string): Promise<TransactionVerifyResult> {
    try {
      const response = await this.makeRequest(`/transaction/verify/${encodeURIComponent(paymentId)}`);
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        status: data.data.status,
        amountKobo: data.data.amount,
        paidAt: data.data.paid_at,
        reference: data.data.reference,
        metadata: data.data.metadata
      };

    } catch (error) {
      console.error('Payment verification failed:', error);
      throw new Error('Unable to verify payment');
    }
  }

  /**
   * Process a refund
   */
  async refundPayment(bookingId: string, amount: number): Promise<RefundResult> {
    try {
      // First, we need to find the original transaction
      // This would typically involve looking up the booking's payment reference
      const transactionId = await this.getTransactionIdForBooking(bookingId);
      
      if (!transactionId) {
        return {
          status: 'failed',
          errorMessage: 'Original transaction not found'
        };
      }

      const amountKobo = Math.round(amount * 100);
      
      const response = await this.makeRequest('/refund', {
        method: 'POST',
        body: JSON.stringify({
          transaction: transactionId,
          amount: amountKobo,
          customer_note: 'Booking cancellation refund',
          merchant_note: `Refund for booking ${bookingId}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          status: 'failed',
          errorMessage: errorData.message || 'Refund processing failed'
        };
      }

      const data = await response.json();
      
      return {
        status: 'success',
        refundId: data.data.id,
        amountRefunded: data.data.amount / 100 // Convert back to main currency
      };

    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Refund failed'
      };
    }
  }

  /**
   * Handle webhook notifications from Paystack
   */
  async handleWebhook(payload: WebhookPayload): Promise<void> {
    try {
      // Verify webhook signature (in production)
      // const isValid = this.verifyWebhookSignature(payload);
      // if (!isValid) throw new Error('Invalid webhook signature');

      const { event, data } = payload;
      
      switch (event) {
        case 'charge.success':
          await this.handleSuccessfulCharge(data);
          break;
          
        case 'charge.failed':
          await this.handleFailedCharge(data);
          break;
          
        case 'refund.created':
          await this.handleRefundCreated(data);
          break;
          
        case 'transfer.success':
          await this.handleTransferSuccess(data);
          break;
          
        case 'transfer.failed':
          await this.handleTransferFailed(data);
          break;
          
        default:
          console.log(`Unhandled Paystack webhook event: ${event}`);
      }

    } catch (error) {
      console.error('Webhook handling failed:', error);
      throw error;
    }
  }

  /**
   * Create a customer in Paystack
   */
  async createCustomer(email: string, firstName: string, lastName: string, phone?: string): Promise<string> {
    try {
      const response = await this.makeRequest('/customer', {
        method: 'POST',
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          phone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const data = await response.json();
      return data.data.customer_code;

    } catch (error) {
      console.error('Customer creation failed:', error);
      throw new Error('Unable to create customer profile');
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(reference: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/transaction/${encodeURIComponent(reference)}`);
      
      if (!response.ok) {
        throw new Error('Transaction not found');
      }

      const data = await response.json();
      return data.data;

    } catch (error) {
      console.error('Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * Handle successful charge webhook
   */
  private async handleSuccessfulCharge(data: Record<string, unknown>): Promise<void> {
    const metadata = data.metadata as Record<string, unknown>;
    const bookingId = metadata?.bookingId as string;
    
    if (!bookingId) {
      console.warn('No booking ID in successful charge webhook');
      return;
    }

    // This would trigger the booking confirmation process
    console.log(`Payment successful for booking: ${bookingId}`);
    // In a real implementation, this would call the booking service to confirm the booking
  }

  /**
   * Handle failed charge webhook
   */
  private async handleFailedCharge(data: Record<string, unknown>): Promise<void> {
    const metadata = data.metadata as Record<string, unknown>;
    const bookingId = metadata?.bookingId as string;
    
    if (bookingId) {
      console.log(`Payment failed for booking: ${bookingId}`);
      // This would trigger the booking cancellation process
    }
  }

  /**
   * Handle refund created webhook
   */
  private async handleRefundCreated(data: Record<string, unknown>): Promise<void> {
    const transactionId = data.transaction as string;
    console.log(`Refund created for transaction: ${transactionId}`);
    // Handle refund notification
  }

  /**
   * Handle transfer success webhook
   */
  private async handleTransferSuccess(data: Record<string, unknown>): Promise<void> {
    console.log('Transfer successful:', data);
    // Handle payout/transfer success
  }

  /**
   * Handle transfer failed webhook
   */
  private async handleTransferFailed(data: Record<string, unknown>): Promise<void> {
    console.log('Transfer failed:', data);
    // Handle payout/transfer failure
  }

  /**
   * Get transaction ID for a booking (helper method)
   */
  private async getTransactionIdForBooking(bookingId: string): Promise<string | null> {
    // This would query your database to find the Paystack transaction reference
    // for the given booking ID
    console.log(`Looking up transaction for booking: ${bookingId}`);
    return null; // Placeholder
  }

  /**
   * Generate unique reference for transactions
   */
  private generateReference(bookingId: string): string {
    return `BOOK-${bookingId}-${Date.now()}`;
  }

  /**
   * Make authenticated request to Paystack API
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.config.secretKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  /**
   * Verify webhook signature (implement in production)
   */
  private verifyWebhookSignature(payload: WebhookPayload): boolean {
    // In production, verify the signature using Paystack's webhook secret
    // This is a simplified placeholder
    return true;
  }
}