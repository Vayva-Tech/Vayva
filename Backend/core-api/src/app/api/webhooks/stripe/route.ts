import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyStripeSignature } from '@/lib/webhooks/signature';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';
  
  // Verify webhook signature
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  const verification = verifyStripeSignature(body, signature, secret);
  
  if (!verification.valid) {
    console.error('[STRIPE WEBHOOK] Verification failed:', verification.error);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }
  
  const event = verification.payload;
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Update merchant subscription
        if (paymentIntent.metadata?.merchantId) {
          await prisma.merchant.update({
            where: { id: paymentIntent.metadata.merchantId },
            data: {
              stripeCustomerId: paymentIntent.customer as string,
              lastPaymentAt: new Date(),
            },
          });
          
          // Create payment record
          await prisma.payment.create({
            data: {
              merchantId: paymentIntent.metadata.merchantId,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: 'SUCCEEDED',
              stripePaymentIntentId: paymentIntent.id,
            },
          });
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Find merchant by Stripe customer ID
        const merchant = await prisma.merchant.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        });
        
        if (merchant) {
          // Map Stripe plan to our plan tiers
          const planTier = mapStripePlanToTier(subscription.items.data[0]?.plan.id);
          
          await prisma.merchant.update({
            where: { id: merchant.id },
            data: {
              planTier,
              subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
              subscriptionEndsAt: subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000)
                : null,
            },
          });
          
          // Log subscription change
          await prisma.auditLog.create({
            data: {
              merchantId: merchant.id,
              action: 'SUBSCRIPTION_UPDATED',
              details: {
                eventType: event.type,
                subscriptionId: subscription.id,
                planTier,
                status: subscription.status,
              },
            },
          });
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        if (invoice.customer) {
          const merchant = await prisma.merchant.findFirst({
            where: { stripeCustomerId: invoice.customer as string },
          });
          
          if (merchant) {
            await prisma.merchant.update({
              where: { id: merchant.id },
              data: {
                subscriptionStatus: 'PAST_DUE',
              },
            });
            
            // Send notification
            await prisma.notification.create({
              data: {
                merchantId: merchant.id,
                type: 'PAYMENT_FAILED',
                title: 'Payment Failed',
                message: 'Your latest payment could not be processed. Please update your payment method.',
              },
            });
          }
        }
        break;
      }
      
      default:
        console.warn(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }));
  } catch (error) {
    console.error('[STRIPE WEBHOOK] Processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Processing failed' }),
      { status: 500 }
    );
  }
}

/**
 * Map Stripe price IDs to our plan tiers
 */
function mapStripePlanToTier(priceId?: string): string {
  if (!priceId) return 'free';
  
  // These should match your Stripe product/price configuration
  const PLAN_MAPPING: Record<string, string> = {
    'price_1234567890_FREE': 'free',
    'price_1234567890_STARTER': 'starter',
    'price_1234567890_PRO': 'pro',
    'price_1234567890_ENTERPRISE': 'enterprise',
  };
  
  return PLAN_MAPPING[priceId] || 'free';
}
