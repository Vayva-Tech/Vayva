import { PrismaClient } from "@prisma/client";
import { PaystackService } from "@vayva/payments";
import { logger } from "@/lib/logger";
import crypto from "crypto";

const prisma = new PrismaClient();

// Verify Paystack webhook signature
function verifyPaystackSignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  
  const hash = crypto
    .createHmac("sha512", secret)
    .update(body)
    .digest("hex");
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

export async function handlePaystackWebhook(rawBody: string, signature: string | null): Promise<{ status: number; body: Record<string, unknown> }> {
  const correlationId = crypto.randomUUID();
  
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    if (!secret) {
      logger.error("[PAYSTACK_WEBHOOK] Missing PAYSTACK_SECRET_KEY", { correlationId });
      return { status: 500, body: { error: "Webhook not configured" } };
    }
    
    // Verify webhook signature
    if (!verifyPaystackSignature(rawBody, signature, secret)) {
      logger.error("[PAYSTACK_WEBHOOK] Invalid signature", { correlationId });
      return { status: 401, body: { error: "Invalid signature" } };
    }
    
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const data = event.data;
    
    logger.info("[PAYSTACK_WEBHOOK] Received event", { 
      eventType, 
      reference: data?.reference,
      correlationId 
    });
    
    // Handle transfer events
    if (eventType === "transfer.success" || eventType === "transfer.failed") {
      const reference = data.reference;
      const status = eventType === "transfer.success" ? "completed" : "failed";
      const transferCode = data.transfer_code;
      
      // Find withdrawal by reference
      const withdrawal = await prisma.withdrawal.findFirst({
        where: { 
          OR: [
            { reference },
            { paystackReference: reference },
            { transferCode }
          ]
        },
        include: { store: true }
      });
      
      if (!withdrawal) {
        logger.warn("[PAYSTACK_WEBHOOK] Withdrawal not found", { 
          reference, 
          transferCode,
          correlationId 
        });
        return { status: 200, body: { message: "Withdrawal not found" } };
      }
      
      // Update withdrawal status
      if (withdrawal.status !== status) {
        await prisma.$transaction(async (tx) => {
          // Update withdrawal status
          await tx.withdrawal.update({
            where: { id: withdrawal.id },
            data: {
              status: status,
              completedAt: status === "completed" ? new Date() : undefined,
              failedAt: status === "failed" ? new Date() : undefined,
              transferCode: transferCode || withdrawal.transferCode,
              paystackReference: reference,
              failureReason: status === "failed" ? data.reason : undefined,
            },
          });
          
          // Update ledger entry
          await tx.ledgerEntry.updateMany({
            where: { withdrawalId: withdrawal.id },
            data: {
              status: status,
              type: status === "completed" ? "withdrawal" : "withdrawal_failed",
            },
          });
          
          // If failed, restore funds to available balance
          if (status === "failed") {
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
                type: "withdrawal_reversal",
                amountKobo: withdrawal.amountKobo,
                status: "completed",
                withdrawalId: withdrawal.id,
                description: `Withdrawal failed - funds restored: ${data.reason || "Unknown reason"}`,
                metadata: {
                  originalReference: reference,
                  failureReason: data.reason,
                },
              },
            });
          } else if (status === "completed") {
            // Move from pending to deducted (funds were already moved to pending during initiation)
            await tx.wallet.update({
              where: { storeId: withdrawal.storeId },
              data: {
                pendingKobo: { decrement: withdrawal.amountKobo },
              },
            });
          }
        });
        
        logger.info("[PAYSTACK_WEBHOOK] Withdrawal status updated", {
          withdrawalId: withdrawal.id,
          status,
          correlationId,
        });
      }
    }
    
    // Handle charge success (for incoming payments to wallet)
    if (eventType === "charge.success") {
      const reference = data.reference;
      const amount = data.amount; // in kobo
      
      // Check if this is a wallet funding transaction
      if (reference.startsWith("WALLET_FUND_")) {
        const storeId = reference.replace("WALLET_FUND_", "").split("_")[0];
        
        await prisma.$transaction([
          prisma.wallet.upsert({
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
          prisma.ledgerEntry.create({
            data: {
              storeId,
              type: "wallet_funding",
              amountKobo: BigInt(amount),
              status: "completed",
              description: "Wallet funded via Paystack",
              metadata: {
                paystackReference: reference,
                channel: data.channel,
                currency: data.currency,
              },
            },
          }),
        ]);
        
        logger.info("[PAYSTACK_WEBHOOK] Wallet funded", {
          storeId,
          amount,
          correlationId,
        });
      }
    }
    
    return { status: 200, body: { received: true } };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("[PAYSTACK_WEBHOOK_ERROR]", {
      error: errorMessage,
      correlationId,
    });
    return { status: 500, body: { error: "Webhook processing failed", correlationId } };
  }
}
