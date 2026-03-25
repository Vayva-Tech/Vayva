/**
 * Webhook Signature Verification
 * Verifies webhook signatures from Stripe, Shopify, etc.
 */

import crypto from 'crypto';

export interface WebhookVerificationResult {
  valid: boolean;
  payload?: unknown;
  error?: string;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): WebhookVerificationResult {
  try {
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.substring(2);
    const signatures = parts
      .filter(p => p.startsWith('v1='))
      .map(p => p.substring(3));
    
    if (!timestamp || !signatures.length) {
      return { valid: false, error: 'Invalid signature format' };
    }
    
    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
      return { valid: false, error: 'Webhook timestamp too old' };
    }
    
    // Create expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    // Verify signature
    const isValid = signatures.some(sig => 
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(sig, 'hex')
      )
    );
    
    if (!isValid) {
      return { valid: false, error: 'Signature verification failed' };
    }
    
    return { valid: true, payload: JSON.parse(payload) };
  } catch (error) {
    console.error('[WEBHOOK] Stripe verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

/**
 * Verify Shopify webhook signature
 */
export function verifyShopifySignature(
  payload: string,
  hmacHeader: string,
  secret: string
): WebhookVerificationResult {
  try {
    const digest = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64');
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(hmacHeader)
    );
    
    if (!isValid) {
      return { valid: false, error: 'HMAC verification failed' };
    }
    
    return { valid: true, payload: JSON.parse(payload) };
  } catch (error) {
    console.error('[WEBHOOK] Shopify verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

/**
 * Generic HMAC verification
 */
export function verifyHMACSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): WebhookVerificationResult {
  try {
    const digest = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex');
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(signature, 'hex')
    );
    
    if (!isValid) {
      return { valid: false, error: 'HMAC verification failed' };
    }
    
    return { valid: true, payload: JSON.parse(payload) };
  } catch (error) {
    console.error('[WEBHOOK] HMAC verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
}
