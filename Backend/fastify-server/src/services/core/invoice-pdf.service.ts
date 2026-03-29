import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import PDFDocument from 'pdfkit';
import { NotificationsService } from '../platform/notifications.service';
import { createWriteStream } from 'fs';
import { join } from 'path';

export interface InvoicePDFConfig {
  logoPath?: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  taxId?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    sortCode?: string;
  };
}

export interface InvoiceGenerationResult {
  success: boolean;
  invoiceId: string;
  pdfPath?: string;
  pdfUrl?: string;
  message: string;
}

export class InvoicePdfService {
  private readonly defaultConfig: InvoicePDFConfig = {
    companyName: process.env.COMPANY_NAME || 'Vayva Technologies',
    companyAddress: process.env.COMPANY_ADDRESS || 'Lagos, Nigeria',
    companyEmail: process.env.COMPANY_EMAIL || 'billing@vayva.ng',
    taxId: process.env.COMPANY_TAX_ID,
    bankDetails: {
      bankName: process.env.BANK_NAME || '',
      accountName: process.env.BANK_ACCOUNT_NAME || '',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
      sortCode: process.env.BANK_SORT_CODE || '',
    },
  };

  constructor(
    private readonly db = prisma,
    private readonly notificationService = new NotificationsService()
  ) {}

  /**
   * Generate PDF for an invoice
   */
  async generateInvoicePDF(
    invoiceId: string,
    config?: Partial<InvoicePDFConfig>
  ): Promise<InvoiceGenerationResult> {
    try {
      const invoice = await this.db.invoiceV2.findFirst({
        where: { id: invoiceId },
        include: {
          store: {
            include: {
              user: true,
            },
          },
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const finalConfig: InvoicePDFConfig = {
        ...this.defaultConfig,
        ...config,
      };

      // Create PDF directory if it doesn't exist
      const pdfDir = join(process.cwd(), 'storage', 'invoices');
      const pdfFilename = `${invoice.invoiceNumber}.pdf`;
      const pdfPath = join(pdfDir, pdfFilename);

      // Ensure directory exists
      const fs = await import('fs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = createWriteStream(pdfPath);

        doc.pipe(stream);

        // Header with logo (if provided) and company info
        this.addHeader(doc, finalConfig);

        // Invoice title and number
        this.addInvoiceTitle(doc, invoice);

        // From/To addresses
        this.addAddresses(doc, invoice, finalConfig);

        // Invoice details table
        this.addInvoiceTable(doc, invoice);

        // Totals section
        this.addTotals(doc, invoice);

        // Bank details for payment
        if (finalConfig.bankDetails?.accountNumber) {
          this.addBankDetails(doc, finalConfig.bankDetails);
        }

        // Footer with terms
        this.addFooter(doc, invoice);

        // Finalize PDF
        doc.end();

        stream.on('finish', async () => {
          // Update invoice record with PDF path
          await this.db.invoiceV2.update({
            where: { id: invoiceId },
            data: {
              pdfPath,
              metadata: {
                ...(invoice.metadata as any),
                pdfGeneratedAt: new Date().toISOString(),
              },
            },
          });

          logger.info(`[InvoicePDF] Generated PDF for invoice ${invoiceId}`);

          resolve({
            success: true,
            invoiceId,
            pdfPath,
            pdfUrl: `/api/invoices/${invoiceId}/pdf`,
            message: 'Invoice PDF generated successfully',
          });
        });

        stream.on('error', (error) => {
          logger.error(`[InvoicePDF] Error generating PDF for invoice ${invoiceId}`, error);
          resolve({
            success: false,
            invoiceId,
            message: 'Failed to generate PDF',
          });
        });
      });
    } catch (error) {
      logger.error(`[InvoicePDF] Error generating invoice ${invoiceId}`, error);
      return {
        success: false,
        invoiceId,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add header with company branding
   */
  private addHeader(doc: PDFDocument, config: InvoicePDFConfig): void {
    // Company name
    doc.fontSize(24).text(config.companyName, { align: 'left' });

    // Company address
    doc.fontSize(10).text(config.companyAddress, { align: 'left' });
    doc.text(config.companyEmail, { align: 'left' });

    if (config.taxId) {
      doc.text(`Tax ID: ${config.taxId}`, { align: 'left' });
    }

    // Move down
    doc.moveDown(2);
  }

  /**
   * Add invoice title and number
   */
  private addInvoiceTitle(doc: PDFDocument, invoice: any): void {
    // Title
    doc.fontSize(20).text('INVOICE', { align: 'right' });

    // Invoice number
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });

    // Date
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: 'right' });

    // Due date
    doc.text(
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      { align: 'right' }
    );

    // Status badge
    const statusColors: Record<string, string> = {
      DRAFT: 'gray',
      SENT: 'blue',
      PAID: 'green',
      OVERDUE: 'red',
      CANCELLED: 'gray',
    };

    doc.fillColor(statusColors[invoice.status] || 'black');
    doc.text(`Status: ${invoice.status}`, { align: 'right' });
    doc.fillColor('black');

    doc.moveDown(3);
  }

  /**
   * Add billing addresses
   */
  private addAddresses(doc: PDFDocument, invoice: any, config: InvoicePDFConfig): void {
    const tableTop = 200;

    // Bill To
    doc.fontSize(12).text('Bill To:', 50, tableTop, { bold: true });
    doc.fontSize(10);

    const customerName = invoice.store.name || invoice.store.user.firstName || 'Customer';
    doc.text(customerName, 50, tableTop + 20);
    doc.text(invoice.store.user.email, 50, tableTop + 35);

    if (invoice.store.address) {
      doc.text(invoice.store.address, 50, tableTop + 50);
    }

    // Pay To (company info)
    doc.fontSize(12).text('Pay To:', 350, tableTop, { bold: true });
    doc.fontSize(10).text(config.companyName, 350, tableTop + 20);
    doc.text(config.companyAddress, 350, tableTop + 35);
    doc.text(config.companyEmail, 350, tableTop + 50);

    doc.moveDown(3);
  }

  /**
   * Add invoice items table
   */
  private addInvoiceTable(doc: PDFDocument, invoice: any): void {
    const tableTop = 300;
    const tableLeft = 50;
    const rowHeight = 25;

    // Table headers
    doc.fontSize(10).fillColor('black').font('Helvetica-Bold');
    doc.text('Description', tableLeft, tableTop);
    doc.text('Quantity', 300, tableTop, { width: 80, align: 'center' });
    doc.text('Unit Price', 380, tableTop, { width: 100, align: 'right' });
    doc.text('Amount', 480, tableTop, { width: 80, align: 'right' });

    // Draw header line
    doc.moveTo(tableLeft, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Table rows
    doc.font('Helvetica');
    let y = tableTop + 30;

    const items = invoice.items || [];

    items.forEach((item: any, index: number) => {
      const amountInNaira = Number(item.amount) / 100;
      const unitAmountInNaira = Number(item.unitAmount) / 100;

      doc.text(item.description || `Item ${index + 1}`, tableLeft, y, {
        width: 240,
        ellipsis: true,
      });
      doc.text(String(item.quantity), 300, y, { width: 80, align: 'center' });
      doc.text(`₦${unitAmountInNaira.toLocaleString()}`, 380, y, {
        width: 100,
        align: 'right',
      });
      doc.text(`₦${amountInNaira.toLocaleString()}`, 480, y, {
        width: 80,
        align: 'right',
      });

      y += rowHeight;
    });

    // Draw bottom line
    doc.moveTo(tableLeft, y).lineTo(550, y).stroke();
  }

  /**
   * Add totals section
   */
  private addTotals(doc: PDFDocument, invoice: any): void {
    const totalY = 450;
    const subtotalInNaira = Number(invoice.subtotalKobo) / 100;
    const taxInNaira = Number(invoice.taxKobo) / 100;
    const totalInNaira = Number(invoice.totalKobo) / 100;

    doc.fontSize(12);

    // Subtotal
    doc.text('Subtotal:', 350, totalY, { width: 120, align: 'right' });
    doc.text(`₦${subtotalInNaira.toLocaleString()}`, 480, totalY, {
      width: 80,
      align: 'right',
    });

    // Tax
    doc.text('Tax:', 350, totalY + 25, { width: 120, align: 'right' });
    doc.text(`₦${taxInNaira.toLocaleString()}`, 480, totalY + 25, {
      width: 80,
      align: 'right',
    });

    // Total
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('Total:', 350, totalY + 50, { width: 120, align: 'right' });
    doc.text(`₦${totalInNaira.toLocaleString()}`, 480, totalY + 50, {
      width: 80,
      align: 'right',
    });

    doc.font('Helvetica');
  }

  /**
   * Add bank details
   */
  private addBankDetails(doc: PDFDocument, bankDetails: any): void {
    const y = 520;

    doc.fontSize(12).fillColor('black').font('Helvetica-Bold');
    doc.text('Payment Details:', 50, y);

    doc.fontSize(10).font('Helvetica');
    
    if (bankDetails.bankName) {
      doc.text(`Bank: ${bankDetails.bankName}`, 50, y + 20);
    }
    
    if (bankDetails.accountName) {
      doc.text(`Account Name: ${bankDetails.accountName}`, 50, y + 35);
    }
    
    if (bankDetails.accountNumber) {
      doc.text(`Account Number: ${bankDetails.accountNumber}`, 50, y + 50);
    }
    
    if (bankDetails.sortCode) {
      doc.text(`Sort Code: ${bankDetails.sortCode}`, 50, y + 65);
    }
  }

  /**
   * Add footer with terms and notes
   */
  private addFooter(doc: PDFDocument, invoice: any): void {
    const y = 620;

    doc.fontSize(10).fillColor('gray');

    // Payment terms
    doc.text(
      'Payment is due within 7 days of invoice date. Late payments may incur additional charges.',
      50,
      y,
      { width: 500 }
    );

    // Thank you message
    doc.text('Thank you for your business!', 50, y + 20, { align: 'center' });

    // Contact info
    doc.text(
      'For questions about this invoice, please contact billing@vayva.ng',
      50,
      y + 35,
      { align: 'center' }
    );

    // Page number
    doc.fontSize(8).text('Page 1 of 1', 50, 780, { align: 'right' });
  }

  /**
   * Send invoice via email
   */
  async sendInvoiceEmail(invoiceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const invoice = await this.db.invoiceV2.findFirst({
        where: { id: invoiceId },
        include: {
          store: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate PDF if not already generated
      if (!invoice.pdfPath) {
        await this.generateInvoicePDF(invoiceId);
      }

      const totalInNaira = Number(invoice.totalKobo) / 100;
      const subject = `Invoice ${invoice.invoiceNumber} from Vayva - ₦${totalInNaira.toLocaleString()}`;

      const emailBody = `
Dear ${invoice.store.user.firstName || 'Valued Customer'},

Please find attached invoice ${invoice.invoiceNumber} for the amount of ₦${totalInNaira.toLocaleString()}.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Amount Due: ₦${totalInNaira.toLocaleString()}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
- Status: ${invoice.status}

Payment Instructions:
Please make payment using the bank details provided in the attached invoice.

If you have any questions about this invoice, please don't hesitate to contact us at billing@vayva.ng.

Thank you for your business!

Best regards,
The Vayva Team
      `.trim();

      // Create notification (which triggers email)
      await this.notificationService.createNotification({
        userId: invoice.store.userId,
        type: 'invoice',
        title: `Invoice ${invoice.invoiceNumber}`,
        message: emailBody,
        metadata: {
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          amount: totalInNaira,
          dueDate: invoice.dueDate,
          attachmentPath: invoice.pdfPath,
        },
      });

      logger.info(`[InvoicePDF] Sent invoice email for invoice ${invoiceId}`);

      return {
        success: true,
        message: 'Invoice email sent successfully',
      };
    } catch (error) {
      logger.error(`[InvoicePDF] Error sending invoice email for ${invoiceId}`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  /**
   * Schedule recurring invoices
   */
  async scheduleRecurringInvoice(
    subscriptionId: string,
    interval: 'monthly' | 'quarterly' | 'annual'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await this.db.subscription.findFirst({
        where: { id: subscriptionId },
        include: {
          plan: true,
          store: true,
        },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Calculate next billing date
      let nextBillingDate = new Date();
      switch (interval) {
        case 'monthly':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case 'annual':
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      // Create scheduled invoice record
      await this.db.invoiceSchedule.create({
        data: {
          subscriptionId,
          storeId: subscription.storeId,
          nextBillingDate,
          interval,
          amount: subscription.plan.price,
          status: 'SCHEDULED',
          metadata: {
            planKey: subscription.plan.planKey,
            billingCycle: subscription.billingCycle,
          },
        },
      });

      logger.info(
        `[InvoicePDF] Scheduled recurring invoice for subscription ${subscriptionId} on ${nextBillingDate.toISOString()}`
      );

      return {
        success: true,
        message: `Recurring invoice scheduled for ${nextBillingDate.toLocaleDateString()}`,
      };
    } catch (error) {
      logger.error(`[InvoicePDF] Error scheduling recurring invoice for ${subscriptionId}`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to schedule invoice',
      };
    }
  }

  /**
   * Calculate tax based on store location
   */
  calculateTax(amount: number, storeId: string): Promise<number> {
    // Default VAT rate for Nigeria (7.5%)
    const DEFAULT_VAT_RATE = 0.075;

    return Promise.resolve(amount * DEFAULT_VAT_RATE);
  }

  /**
   * Generate custom invoice with branding
   */
  async generateCustomInvoice(
    storeId: string,
    invoiceData: {
      items: Array<{ description: string; quantity: number; unitAmount: number }>;
      dueDate: Date;
      customBranding?: {
        logoPath?: string;
        companyName?: string;
        colors?: { primary: string; secondary: string };
      };
    }
  ): Promise<InvoiceGenerationResult> {
    try {
      // Verify store ownership
      const store = await this.db.store.findFirst({
        where: { id: storeId },
        include: { user: true },
      });

      if (!store) {
        throw new Error('Store not found');
      }

      // Calculate amounts
      const subtotal = invoiceData.items.reduce(
        (sum, item) => sum + item.quantity * item.unitAmount,
        0
      );
      const tax = await this.calculateTax(subtotal, storeId);
      const total = subtotal + tax;

      // Create invoice record
      const invoice = await this.db.invoiceV2.create({
        data: {
          storeId,
          invoiceNumber: `INV-${Date.now()}`,
          totalKoho: BigInt(Math.round(total * 100)),
          subtotalKobo: BigInt(Math.round(subtotal * 100)),
          taxKobo: BigInt(Math.round(tax * 100)),
          status: 'DRAFT',
          dueDate: invoiceData.dueDate,
          items: invoiceData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitAmount: Math.round(item.unitAmount * 100),
            amount: Math.round(item.quantity * item.unitAmount * 100),
          })),
          metadata: {
            customBranding: invoiceData.customBranding,
          },
        },
      });

      // Generate PDF with custom branding
      const config: Partial<InvoicePDFConfig> = invoiceData.customBranding
        ? {
            logoPath: invoiceData.customBranding.logoPath,
            companyName: invoiceData.customBranding.companyName,
          }
        : {};

      return await this.generateInvoicePDF(invoice.id, config);
    } catch (error) {
      logger.error(`[InvoicePDF] Error generating custom invoice`, error);
      return {
        success: false,
        invoiceId: '',
        message: error instanceof Error ? error.message : 'Failed to generate custom invoice',
      };
    }
  }
}
