import crypto from 'crypto';
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface WebhookResponse {
  status: number;
  body: Record<string, unknown>;
}

export class PaystackWebhookService {
  constructor(private readonly db = prisma) {}

  /**
   * Verify Paystack webhook signature using HMAC SHA512
   */
  private verifySignature(body: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;

    const hash = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  /**
   * Handle incoming Paystack webhooks
   * Processes transfer events (withdrawals) and charge events (wallet funding)
   */
  async handleWebhook(rawBody: string, signature: string | null): Promise<WebhookResponse> {
    const correlationId = crypto.randomUUID();

    try {
      const secret = process.env.PAYSTACK_SECRET_KEY || '';
      if (!secret) {
        logger.error('[PAYSTACK_WEBHOOK] Missing PAYSTACK_SECRET_KEY', { correlationId });
        return { status: 500, body: { error: 'Webhook not configured' } };
      }

      // Verify webhook signature
      if (!this.verifySignature(rawBody, signature, secret)) {
        logger.error('[PAYSTACK_WEBHOOK] Invalid signature', { correlationId });
        return { status: 401, body: { error: 'Invalid signature' } };
      }

      const event = JSON.parse(rawBody);
      const eventType = event.event;
      const data = event.data;

      logger.info('[PAYSTACK_WEBHOOK] Received event', {
        eventType,
        reference: data?.reference,
        correlationId,
      });

      // Handle transfer events (withdrawals)
      if (eventType === 'transfer.success' || eventType === 'transfer.failed') {
        await this.handleTransferEvent(data, correlationId);
      }

      // Handle charge events (wallet funding)
      if (eventType === 'charge.success') {
        await this.handleChargeEvent(data, correlationId);
      }

      return { status: 200, body: { received: true } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[PAYSTACK_WEBHOOK_ERROR]', {
        error: errorMessage,
        correlationId,
      });
      return { status: 500, body: { error: 'Webhook processing failed', correlationId } };
    }
  }

  /**
   * Process transfer success/failure events
   * Updates withdrawal status and manages wallet balances
   */
  private async handleTransferEvent(data: any, correlationId: string): Promise<void> {
    const reference = data.reference;
    const status = data.event === 'transfer.success' ? 'completed' : 'failed';
    const transferCode = data.transfer_code;

    // Find withdrawal by reference
    const withdrawal = await this.db.withdrawal.findFirst({
      where: {
        OR: [
          { reference },
          { paystackReference: reference },
          { transferCode },
        ],
      },
      include: { store: true },
    });

    if (!withdrawal) {
      logger.warn('[PAYSTACK_WEBHOOK] Withdrawal not found', {
        reference,
        transferCode,
        correlationId,
      });
      return;
    }

    // Update withdrawal status if changed
    if (withdrawal.status !== status) {
      await this.db.$transaction(async (tx) => {
        // Update withdrawal
        await tx.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status,
            completedAt: status === 'completed' ? new Date() : undefined,
            failedAt: status === 'failed' ? new Date() : undefined,
            transferCode: transferCode || withdrawal.transferCode,
            paystackReference: reference,
            failureReason: status === 'failed' ? data.reason : undefined,
          },
        });

        // Update ledger entry
        await tx.ledgerEntry.updateMany({
          where: { withdrawalId: withdrawal.id },
          data: {
            status,
            type: status === 'completed' ? 'withdrawal' : 'withdrawal_failed',
          },
        });

        // Handle failed withdrawal - restore funds
        if (status === 'failed') {
          await tx.wallet.update({
            where: { storeId: withdrawal.storeId },
            data: {
              availableKobo: { increment: withdrawal.amountKobo },
              pendingKobo: { decrement: withdrawal.amountKobo },
            },
          });

          // Create reversal ledger entry
          await tx.ledgerEntry.create({
            data: {
              storeId: withdrawal.storeId,
              type: 'withdrawal_reversal',
              amountKobo: withdrawal.amountKobo,
              status: 'completed',
              withdrawalId: withdrawal.id,
              description: `Withdrawal failed - funds restored: ${data.reason || 'Unknown reason'}`,
              metadata: {
                originalReference: reference,
                failureReason: data.reason,
              },
            },
          });
        } else if (status === 'completed') {
          // Deduct from pending (funds moved to pending during initiation)
          await tx.wallet.update({
            where: { storeId: withdrawal.storeId },
            data: {
              pendingKobo: { decrement: withdrawal.amountKobo },
            },
          });
        }
      });

      logger.info('[PAYSTACK_WEBHOOK] Withdrawal status updated', {
        withdrawalId: withdrawal.id,
        status,
        correlationId,
      });
    }
  }

  /**
   * Process charge success events for wallet funding
   */
  private async handleChargeEvent(data: any, correlationId: string): Promise<void> {
    const reference = data.reference;
    const amount = data.amount; // in kobo

    // Check if this is a wallet funding transaction
    if (reference.startsWith('WALLET_FUND_')) {
      const storeId = reference.replace('WALLET_FUND_', '').split('_')[0];

      await this.db.$transaction([
        this.db.wallet.upsert({
          where: { storeId },
          create: {
            storeId,
            availableKobo: BigInt(amount),
            pendingKobo: 0,
          },
          update: {
            availableKobo: { increment: BigInt(amount) },
          },
        }),
        this.db.ledgerEntry.create({
          data: {
            storeId,
            type: 'wallet_funding',
            amountKobo: BigInt(amount),
            status: 'completed',
            description: 'Wallet funded via Paystack',
            metadata: {
              paystackReference: reference,
              channel: data.channel,
              currency: data.currency,
            },
          },
        }),
      ]);

      logger.info('[PAYSTACK_WEBHOOK] Wallet funded', {
        storeId,
        amount,
        correlationId,
      });
    }
  }
}
