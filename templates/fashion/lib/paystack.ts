// Paystack integration for Fashion template
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_key_here';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

interface PaystackTransaction {
  reference: string;
  amount: number; // in kobo (smallest currency unit)
  email: string;
  currency?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
  channels?: string[];
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export class PaystackService {
  static async initializeTransaction(data: PaystackTransaction): Promise<PaystackResponse> {
    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          currency: data.currency || 'NGN',
          channels: data.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw error;
    }
  }

  static async verifyTransaction(reference: string): Promise<any> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Paystack verification error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  static getPublicKey(): string {
    return PAYSTACK_PUBLIC_KEY;
  }

  static formatAmount(amount: number, currency: string = 'NGN'): number {
    // Convert to smallest currency unit (kobo for NGN)
    if (currency === 'NGN') {
      return Math.round(amount * 100); // Convert to kobo
    }
    return Math.round(amount * 100); // Default to cents
  }

  static unformatAmount(amount: number, currency: string = 'NGN'): number {
    // Convert from smallest currency unit back to main unit
    if (currency === 'NGN') {
      return amount / 100; // Convert from kobo
    }
    return amount / 100; // Default from cents
  }
}

// Mock Paystack service for development/testing
export class MockPaystackService {
  static async initializeTransaction(data: PaystackTransaction): Promise<PaystackResponse> {
    // Generate mock reference
    const reference = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: `https://checkout.paystack.co/mock-payment/${reference}`,
        access_code: `mock_access_${reference}`,
        reference,
      },
    };
  }

  static async verifyTransaction(reference: string): Promise<any> {
    return {
      status: true,
      message: 'Verification successful',
      data: {
        status: 'success',
        reference,
        amount: 500000, // 5000 NGN in kobo
        currency: 'NGN',
        paid_at: new Date().toISOString(),
        customer: {
          email: 'customer@example.com',
        },
      },
    };
  }

  static getPublicKey(): string {
    return 'pk_test_mock_key';
  }

  static formatAmount(amount: number, currency: string = 'NGN'): number {
    return Math.round(amount * 100);
  }

  static unformatAmount(amount: number, currency: string = 'NGN'): number {
    return amount / 100;
  }
}

// Export the appropriate service based on environment
export const Paystack = process.env.NODE_ENV === 'production' && 
                      process.env.PAYSTACK_SECRET_KEY && 
                      process.env.PAYSTACK_SECRET_KEY !== 'sk_test_your_key_here'
  ? PaystackService
  : MockPaystackService;