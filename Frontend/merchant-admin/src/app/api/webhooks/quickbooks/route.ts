import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * POST /api/webhooks/quickbooks
 * Handle QuickBooks webhook events
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (QuickBooks specific)
    const isValid = await verifyQuickBooksWebhook(req);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const eventType = req.headers.get('event-type') || 'unknown';

    console.log('QuickBooks Webhook Received:', { eventType, ...body });

    // Store webhook event for processing
    await prisma.webhookEvent.create({
      data: {
        provider: 'quickbooks',
        eventType,
        payload: body,
        processed: false,
      },
    });

    // Process different event types
    switch (eventType) {
      case 'com.intuit.quickbooks.invoice':
        await handleInvoiceEvent(body);
        break;
      case 'com.intuit.quickbooks.payment':
        await handlePaymentEvent(body);
        break;
      case 'com.intuit.quickbooks.customer':
        await handleCustomerEvent(body);
        break;
      default:
        console.log('Unhandled QuickBooks event type:', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing QuickBooks webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

/**
 * Verify QuickBooks webhook signature
 */
async function verifyQuickBooksWebhook(req: NextRequest): Promise<boolean> {
  const signature = req.headers.get('X-Intuit-Signature');
  const body = await req.text();
  const webhookSecret = process.env.QUICKBOOKS_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return false;
  }

  // Verify HMAC signature
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(body);
  const calculatedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

/**
 * Handle invoice events
 */
async function handleInvoiceEvent(data: any) {
  const { id, status, totalAmt, customerId } = data.resource;

  console.log('Invoice event:', { id, status, amount: totalAmt });

  // Update invoice in database
  // await prisma.invoice.update({
  //   where: { quickBooksId: id },
  //   data: {
  //     status: mapInvoiceStatus(status),
  //     totalAmount: totalAmt,
  //     lastSyncedAt: new Date(),
  //   },
  // });

  // If invoice paid, trigger notification
  if (status === 'Paid') {
    // await sendInvoicePaidNotification(customerId, id);
  }
}

/**
 * Handle payment events
 */
async function handlePaymentEvent(data: any) {
  const { id, amount, customerId } = data.resource;

  console.log('Payment received:', { id, amount });

  // Record payment in database
  // await prisma.payment.create({
  //   data: {
  //     quickBooksId: id,
  //     amount: parseFloat(amount),
  //     customerId,
  //     date: new Date(),
  //   },
  // });
}

/**
 * Handle customer events
 */
async function handleCustomerEvent(data: any) {
  const { id, displayName, companyName } = data.resource;

  console.log('Customer event:', { id, displayName, companyName });

  // Sync customer data
  // await prisma.client.upsert({
  //   where: { quickBooksId: id },
  //   update: {
  //     name: displayName,
  //     company: companyName,
  //   },
  //   create: {
  //     quickBooksId: id,
  //     name: displayName,
  //     company: companyName,
  //   },
  // });
}

function mapInvoiceStatus(qbStatus: string): string {
  const statusMap: Record<string, string> = {
    'Payable': 'pending',
    'Paid': 'paid',
    'Not Paid': 'unpaid',
    'Void': 'cancelled',
  };
  return statusMap[qbStatus] || 'pending';
}
