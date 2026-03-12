import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * POST /api/webhooks/xero
 * Handle Xero webhook events
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (Xero specific)
    const isValid = verifyXeroWebhook(req);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const eventType = body.event ? body.event.category : 'unknown';

    console.log('Xero Webhook Received:', { eventType, ...body });

    // Store webhook event for processing
    await prisma.webhookEvent.create({
      data: {
        provider: 'xero',
        eventType,
        payload: body,
        processed: false,
      },
    });

    // Process different event types
    switch (eventType) {
      case 'invoices':
        await handleInvoiceEvent(body);
        break;
      case 'payments':
        await handlePaymentEvent(body);
        break;
      case 'contacts':
        await handleContactEvent(body);
        break;
      default:
        console.log('Unhandled Xero event type:', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Xero webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

/**
 * Verify Xero webhook signature
 */
function verifyXeroWebhook(req: NextRequest): boolean {
  const signature = req.headers.get('X-Xero-Signature');
  const webhookSecret = process.env.XERO_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return false;
  }

  // Xero uses a different verification method
  // This is a simplified version - implement full verification per Xero docs
  return true; // Placeholder - implement actual verification
}

/**
 * Handle invoice events
 */
async function handleInvoiceEvent(data: any) {
  const invoice = data.invoices?.[0];
  if (!invoice) return;

  console.log('Xero Invoice event:', {
    id: invoice.InvoiceID,
    status: invoice.Status,
    total: invoice.Total,
  });

  // Update invoice in database
  // await prisma.invoice.update({
  //   where: { xeroId: invoice.InvoiceID },
  //   data: {
  //     status: mapInvoiceStatus(invoice.Status),
  //     totalAmount: invoice.Total,
  //     lastSyncedAt: new Date(),
  //   },
  // });
}

/**
 * Handle payment events
 */
async function handlePaymentEvent(data: any) {
  const payment = data.payments?.[0];
  if (!payment) return;

  console.log('Xero Payment event:', {
    id: payment.PaymentID,
    amount: payment.Amount,
  });

  // Record payment in database
  // await prisma.payment.create({
  //   data: {
  //     xeroId: payment.PaymentID,
  //     amount: parseFloat(payment.Amount),
  //     date: new Date(),
  //   },
  // });
}

/**
 * Handle contact events
 */
async function handleContactEvent(data: any) {
  const contact = data.contacts?.[0];
  if (!contact) return;

  console.log('Xero Contact event:', {
    id: contact.ContactID,
    name: contact.Name,
  });

  // Sync contact data
  // await prisma.client.upsert({
  //   where: { xeroId: contact.ContactID },
  //   update: {
  //     name: contact.Name,
  //     company: contact.Name,
  //   },
  //   create: {
  //     xeroId: contact.ContactID,
  //     name: contact.Name,
  //     company: contact.Name,
  //   },
  // });
}

function mapInvoiceStatus(xeroStatus: string): string {
  const statusMap: Record<string, string> = {
    'DRAFT': 'draft',
    'SUBMITTED': 'pending',
    'AUTHORISED': 'paid',
    'PAID': 'paid',
    'VOIDED': 'cancelled',
  };
  return statusMap[xeroStatus] || 'draft';
}
