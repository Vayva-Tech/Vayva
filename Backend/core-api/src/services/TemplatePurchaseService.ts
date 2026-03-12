import { PaystackService } from "./PaystackService";
import { logger } from "@vayva/shared";

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

// TODO: Implement with proper database models
export const TemplatePurchaseService = {
  async initiatePurchase(
    request: TemplatePurchaseRequest,
  ): Promise<TemplatePurchaseResult> {
    try {
      const { merchantId, templateId, amount, email, callbackUrl } = request;

      // Generate unique reference
      const reference = `TMP_${Date.now()}_${merchantId.slice(0, 8)}`;

      // TODO: Create pending purchase record in database
      // await prisma.templatePurchase.create({...});

      // Initialize Paystack transaction
      const transaction = await PaystackService.initializeTransaction(
        email,
        amount,
        reference,
        callbackUrl,
        {
          type: "template_purchase",
          merchantId,
          templateId,
        },
      );

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
        // TODO: Update purchase status to failed
        return {
          success: false,
          error: "Payment verification failed",
        };
      }

      // TODO: Get purchase record from database and apply template

      return {
        success: true,
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
};
