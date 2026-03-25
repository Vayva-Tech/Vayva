import { PaystackService } from "./PaystackService";
import { logger } from "@vayva/shared";
import { prisma as _prisma, prismaDelegates } from "@/lib/db";

export interface TemplatePurchaseRequest {
  merchantId: string;
  templateId: string;
  amount: number; // in kobo
  email: string;
  callbackUrl: string;
}

export interface TemplatePurchaseResult {
  success: boolean;
  authorization_url?: string;
  reference?: string;
  error?: string;
}

export const TemplatePurchaseService = {
  async initiatePurchase(
    request: TemplatePurchaseRequest,
  ): Promise<TemplatePurchaseResult> {
    try {
      const { merchantId, templateId, amount, email, callbackUrl } = request;

      // Generate unique reference
      const reference = `TMP_${Date.now()}_${merchantId.slice(0, 8)}`;

      // Create pending purchase record in database
      const purchaseRecord = await prismaDelegates.templatePurchase.create({
        data: {
          merchantId,
          templateId,
          amount,
          status: 'PENDING',
          reference,
          initiatedAt: new Date(),
        },
      });

      const transaction = await PaystackService.initializeTransaction(
        email,
        amount,
        reference,
        callbackUrl,
        { merchantId, templateId, templatePurchaseId: purchaseRecord.id },
      );

      logger.info('[TEMPLATE_PURCHASE_INIT]', {
        purchaseId: purchaseRecord.id,
        merchantId,
        templateId,
        amount,
      });

      return {
        success: true,
        authorization_url: transaction.authorization_url,
        reference: transaction.reference,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("[TEMPLATE_PURCHASE_INIT_ERROR]", {
        error: errorMessage,
        merchantId: request.merchantId,
        templateId: request.templateId,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  async verifyPurchase(reference: string): Promise<{
    success: boolean;
    merchantId?: string;
    templateId?: string;
    error?: string;
  }> {
    try {
      // Verify with Paystack
      const verification = await PaystackService.verifyTransaction(reference);

      if (verification.status !== "success") {
        // Update purchase status to failed
        await prismaDelegates.templatePurchase.update({
          where: { reference },
          data: { status: 'FAILED', completedAt: new Date() },
        });
        
        return {
          success: false,
          error: "Payment verification failed",
        };
      }

      // Get purchase record from database
      const purchase = await prismaDelegates.templatePurchase.findUnique({
        where: { reference },
      });

      if (!purchase) {
        return {
          success: false,
          error: "Purchase record not found",
        };
      }

      // Apply template to merchant's store
      await this.applyTemplateToStore(purchase.merchantId, purchase.templateId);

      // Update purchase status to completed
      await prismaDelegates.templatePurchase.update({
        where: { reference },
        data: { 
          status: 'COMPLETED', 
          completedAt: new Date(),
          metadata: {
            paystackReference: verification.reference,
            paidAmount: verification.amount,
            paidAt: verification.paid_at,
          },
        },
      });

      logger.info('[TEMPLATE_PURCHASE_COMPLETED]', {
        purchaseId: purchase.id,
        merchantId: purchase.merchantId,
        templateId: purchase.templateId,
      });

      return {
        success: true,
        merchantId: purchase.merchantId,
        templateId: purchase.templateId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("[TEMPLATE_PURCHASE_VERIFY_ERROR]", {
        error: errorMessage,
        reference,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  async getSwapPrice(userPlan: "starter" | "pro"): Promise<number> {
    // Return price in NGN
    return userPlan === "starter" ? 10000 : 5000;
  },

  /**
   * Apply purchased template to merchant's store
   */
  async applyTemplateToStore(merchantId: string, templateId: string): Promise<void> {
    try {
      // Get template data
      const template = await prismaDelegates.template.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Update merchant's current template
      await prismaDelegates.merchantSettings.upsert({
        where: { merchantId },
        update: { 
          currentTemplateId: templateId,
          templateCustomizations: (template as { config?: unknown }).config as unknown,
        },
        create: {
          merchantId,
          currentTemplateId: templateId,
          templateCustomizations: (template as { config?: unknown }).config as unknown,
        },
      });

      logger.info('[TEMPLATE_APPLIED]', {
        merchantId,
        templateId,
      });
    } catch (error) {
      logger.error("[TEMPLATE_APPLY_ERROR]", {
        error: error instanceof Error ? error.message : "Unknown error",
        merchantId,
        templateId,
      });
      throw error;
    }
  },
};
