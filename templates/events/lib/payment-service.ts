// Payment processing service for Events template
// This simulates a payment gateway integration

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'failed';
  clientSecret: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'mobile_money';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  errorMessage?: string;
}

class PaymentService {
  private static instance: PaymentService;
  
  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Create a payment intent (simulates Stripe/PayPal API)
  async createPaymentIntent(amount: number, currency: string = 'NGN'): Promise<PaymentIntent> {
    // In a real implementation, this would call the payment processor API
    const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 16)}`;
    
    return {
      id: paymentIntentId,
      amount,
      currency,
      status: 'requires_payment_method',
      clientSecret: `pi_${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 24)}`
    };
  }

  // Process payment (simulates payment execution)
  async processPayment(paymentIntentId: string, paymentMethod: PaymentMethod): Promise<PaymentResult> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      return {
        success: true,
        paymentIntentId
      };
    } else {
      return {
        success: false,
        paymentIntentId,
        errorMessage: 'Payment declined. Please check your payment details and try again.'
      };
    }
  }

  // Validate payment method
  validatePaymentMethod(method: PaymentMethod): boolean {
    if (method.type === 'card') {
      return !!method.card && 
             !!method.card.brand && 
             !!method.card.last4 && 
             method.card.expMonth > 0 && 
             method.card.expMonth <= 12 &&
             method.card.expYear >= new Date().getFullYear();
    }
    return true; // For other payment types
  }

  // Format amount for display
  formatAmount(amount: number, currency: string = 'NGN'): string {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    return formatter.format(amount / 100); // Assuming amounts are in kobo/cents
  }

  // Get supported payment methods
  getSupportedMethods(): Array<{type: string, name: string, icon: string}> {
    return [
      { type: 'card', name: 'Credit/Debit Card', icon: '💳' },
      { type: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
      { type: 'mobile_money', name: 'Mobile Money', icon: '📱' }
    ];
  }
}

export default PaymentService.getInstance();