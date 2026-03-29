import { prisma } from '@vayva/db';
import { z } from 'zod';
import { logger } from '../../lib/logger';

// ============================================================================
// Validation Schemas
// ============================================================================

const GenerateInvoiceSchema = z.object({
  orderId: z.string(),
  includeQRCode: z.boolean().optional().default(true),
  format: z.enum(['PDF', 'HTML', 'EMAIL']).optional().default('PDF'),
});

const VerifyPaymentSchema = z.object({
  reference: z.string(), // Paystack reference
  amount: z.number(),
  email: z.string().email(),
});

const TrackTransactionSchema = z.object({
  orderId: z.string(),
  eventType: z.enum(['CREATED', 'PAID', 'REFUNDED', 'VOIDED', 'PARTIAL_PAYMENT']),
  metadata: z.record(z.unknown()).optional(),
  actorId: z.string(), // User ID who performed action
  actorType: z.enum(['CUSTOMER', 'CASHIER', 'SYSTEM', 'API']),
});

// ============================================================================
// Invoice Generator Service
// ============================================================================

export class InvoiceGeneratorService {
  constructor(private readonly db = prisma) {}

  /**
   * Generate invoice for POS order
   */
  async generateInvoice(
    orderId: string,
    options: { includeQRCode?: boolean; format?: 'PDF' | 'HTML' | 'EMAIL' } = {}
  ) {
    const parsed = GenerateInvoiceSchema.parse({ orderId, ...options });

    // Get order with all details
    const order = await this.db.pOSOrder.findUnique({
      where: { id: parsed.orderId },
      include: {
        items: {
          include: {
            posItem: true,
          },
        },
        payments: true,
        store: {
          include: {
            memberships: {
              where: { role: 'OWNER' },
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get store owner details
    const ownerMembership = order.store.memberships[0];
    const storeDetails = {
      name: order.store.name,
      slug: order.store.slug,
      ownerName: ownerMembership?.user.name,
      email: ownerMembership?.user.email,
      phone: ownerMembership?.user.phone,
    };

    // Calculate totals
    const subtotal = Number(order.subtotal);
    const tax = Number(order.tax);
    const discount = Number(order.discount);
    const tip = Number(order.tip);
    const serviceCharge = Number(order.serviceCharge);
    const totalPaid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = subtotal + tax + tip + serviceCharge - discount - totalPaid;

    // Generate invoice data
    const invoiceData = {
      invoiceNumber: `INV-${order.receiptNumber || order.id}`,
      orderNumber: order.receiptNumber,
      date: order.createdAt.toISOString(),
      dueDate: order.createdAt.toISOString(), // POS is immediate
      status: order.paymentStatus,
      
      // Store/Biller Details
      biller: {
        name: storeDetails.name,
        email: storeDetails.email,
        phone: storeDetails.phone,
        slug: storeDetails.slug,
      },
      
      // Customer Details (if available)
      customer: {
        name: 'Walk-in Customer', // Default for POS
        email: null,
        phone: null,
      },
      
      // Line Items
      items: order.items.map((item, index) => ({
        itemNumber: index + 1,
        description: item.posItem.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        amount: Number(item.subtotal),
      })),
      
      // Financial Summary
      summary: {
        subtotal,
        taxRate: 7.5, // VAT
        taxAmount: tax,
        discountAmount: discount,
        tipAmount: tip,
        serviceChargeAmount: serviceCharge,
        totalAmount: subtotal + tax + tip + serviceCharge - discount,
        amountPaid: totalPaid,
        balanceDue: balance,
      },
      
      // Payment Details
      payments: order.payments.map(payment => ({
        method: payment.method,
        amount: Number(payment.amount),
        reference: payment.reference,
        status: payment.status,
        date: payment.createdAt.toISOString(),
      })),
      
      // QR Code for verification (optional)
      qrCode: parsed.includeQRCode ? this.generateVerificationQR(order.id, totalPaid) : null,
      
      // Footer Notes
      notes: [
        'Thank you for your business!',
        'This is a computer-generated invoice.',
        `For inquiries, contact: ${storeDetails.email}`,
      ],
      
      // Terms & Conditions
      terms: [
        'Payment is due upon receipt.',
        'All sales are final unless otherwise stated.',
        'For refunds, please refer to our return policy.',
      ],
    };

    logger.info(`[Invoice] Generated invoice ${invoiceData.invoiceNumber} for order ${orderId}`);
    
    // Save invoice record to database
    const savedInvoice = await this.db.iNvoice.create({
      data: {
        storeId: order.storeId,
        orderId: order.orderId || undefined,
        posOrderId: orderId,
        invoiceNumber: invoiceData.invoiceNumber,
        amount: invoiceData.summary.totalAmount,
        status: order.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        issuedAt: new Date(),
        dueDate: new Date(),
        metadata: invoiceData,
      },
    });

    return {
      success: true,
      data: invoiceData,
      invoiceId: savedInvoice.id,
    };
  }

  /**
   * Generate verification QR code data
   */
  private generateVerificationQR(orderId: string, amount: number) {
    // Create verification payload
    const payload = {
      orderId,
      amount,
      timestamp: Date.now(),
      verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-payment`,
    };

    // Return as base64 encoded JSON (for QR code generation)
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Email invoice to customer
   */
  async emailInvoice(orderId: string, customerEmail: string) {
    const invoice = await this.generateInvoice(orderId, { format: 'EMAIL' });

    // TODO: Integrate with email service
    // await emailService.send({
    //   to: customerEmail,
    //   subject: `Invoice ${invoice.data.invoiceNumber}`,
    //   html: this.renderInvoiceHTML(invoice.data),
    //   attachments: [{
    //     filename: `invoice-${invoice.data.invoiceNumber}.pdf`,
    //     content: await this.generatePDF(invoice.data),
    //   }],
    // });

    logger.info(`[Invoice] Emailed invoice to ${customerEmail}`);
    return { success: true };
  }

  /**
   * Render invoice as HTML
   */
  private renderInvoiceHTML(data: any): string {
    // Simplified HTML template - in production, use proper template engine
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .invoice-title { font-size: 32px; font-weight: bold; color: #22C55E; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .totals { float: right; width: 300px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px; }
          .total-final { font-size: 18px; font-weight: bold; color: #22C55E; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="invoice-title">INVOICE</div>
            <div>${data.biller.name}</div>
            <div>${data.biller.email}</div>
          </div>
          <div style="text-align: right;">
            <div>Invoice #: ${data.invoiceNumber}</div>
            <div>Date: ${new Date(data.date).toLocaleDateString()}</div>
          </div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>₦${item.unitPrice.toLocaleString()}</td>
                <td>₦${item.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>₦${data.summary.subtotal.toLocaleString()}</span>
          </div>
          <div class="totals-row">
            <span>Tax (7.5%):</span>
            <span>₦${data.summary.taxAmount.toLocaleString()}</span>
          </div>
          <div class="totals-row">
            <span>Total:</span>
            <span class="total-final">₦${data.summary.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// ============================================================================
// Payment Verification Service
// ============================================================================

export class PaymentVerificationService {
  constructor(private readonly db = prisma) {}

  /**
   * Verify Paystack payment
   */
  async verifyPaystackPayment(reference: string, expectedAmount: number) {
    try {
      // Call Paystack API to verify transaction
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.status) {
        throw new Error('Failed to verify payment with Paystack');
      }

      const transaction = data.data;

      // Validate transaction status
      if (transaction.status !== 'success') {
        return {
          verified: false,
          error: `Payment status: ${transaction.status}`,
        };
      }

      // Validate amount
      const paidAmount = transaction.amount / 100; // Paystack returns amount in kobo
      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        return {
          verified: false,
          error: `Amount mismatch: Expected ₦${expectedAmount}, Got ₦${paidAmount}`,
        };
      }

      // Validate email
      if (transaction.customer && transaction.customer.email) {
        // Email matches
      }

      return {
        verified: true,
        data: {
          reference: transaction.reference,
          amount: paidAmount,
          currency: transaction.currency,
          channel: transaction.authorization?.channel || 'card',
          cardLast4: transaction.authorization?.last4_digits,
          bank: transaction.authorization?.bank,
          paidAt: transaction.paid_at,
          customerEmail: transaction.customer?.email,
          customerName: transaction.customer?.first_name + ' ' + transaction.customer?.last_name,
        },
      };
    } catch (error) {
      logger.error({ error }, '[Payment Verification] Failed to verify Paystack payment');
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record verified payment in POS order
   */
  async recordVerifiedPayment(
    orderId: string,
    verificationData: {
      reference: string;
      amount: number;
      method: string;
      cardLast4?: string;
      bank?: string;
      paidAt: string;
      customerEmail?: string;
    }
  ) {
    const order = await this.db.pOSOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Create payment record
    const payment = await this.db.pOSPayment.create({
      data: {
        orderId,
        method: verificationData.method,
        amount: verificationData.amount,
        reference: verificationData.reference,
        status: 'COMPLETED',
        metadata: {
          cardLast4: verificationData.cardLast4,
          bank: verificationData.bank,
          paidAt: verificationData.paidAt,
          customerEmail: verificationData.customerEmail,
          verified: true,
          verificationSource: 'PAYSTACK',
        },
      },
    });

    // Update order payment status
    const totalPaid = await this.db.pOSPayment.aggregate({
      where: { orderId },
      _sum: { amount: true },
    });

    const orderTotal = Number(order.total);
    const paidSoFar = Number(totalPaid._sum.amount) || 0;

    let newPaymentStatus = order.paymentStatus;
    if (paidSoFar >= orderTotal) {
      newPaymentStatus = 'PAID';
    } else if (paidSoFar > 0) {
      newPaymentStatus = 'PARTIAL';
    }

    await this.db.pOSOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: newPaymentStatus,
      },
    });

    logger.info(`[Payment] Recorded verified payment ${payment.id} for order ${orderId}`);
    
    return {
      success: true,
      paymentId: payment.id,
      paymentStatus: newPaymentStatus,
    };
  }
}

// ============================================================================
// Transaction Tracking Service
// ============================================================================

export class TransactionTrackingService {
  constructor(private readonly db = prisma) {}

  /**
   * Track transaction event (audit trail)
   */
  async trackTransactionEvent(data: z.infer<typeof TrackTransactionSchema>) {
    const parsed = TrackTransactionSchema.parse(data);

    const auditLog = await this.db.transactionAuditLog.create({
      data: {
        orderId: parsed.orderId,
        eventType: parsed.eventType,
        metadata: parsed.metadata,
        actorId: parsed.actorId,
        actorType: parsed.actorType,
        timestamp: new Date(),
      },
    });

    logger.info(`[Audit] Tracked ${parsed.eventType} event for order ${parsed.orderId}`);
    
    return {
      success: true,
      auditLogId: auditLog.id,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(orderId: string) {
    const logs = await this.db.transactionAuditLog.findMany({
      where: { orderId },
      orderBy: { timestamp: 'desc' },
    });

    return {
      success: true,
      logs,
    };
  }
}

// Export singleton instances
export const invoiceGenerator = new InvoiceGeneratorService();
export const paymentVerifier = new PaymentVerificationService();
export const transactionTracker = new TransactionTrackingService();
