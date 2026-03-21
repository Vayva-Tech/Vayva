import {
  Paystack,
  type PaystackInitArgs,
  type PaystackApiResponse,
} from "@vayva/payments";
import { urls } from "@vayva/shared";
import { getPlanPrice, type BillingCycle, type PlanKey } from "@/lib/billing/plans";

type PaystackMetadata = Record<string, string | number | boolean | undefined>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertMerchantCallback(urlStr: string) {
  const u = new URL(urlStr);
  const allowed = new URL(urls.merchantBase()).host;
  if (u.host !== allowed) throw new Error("Invalid callbackUrl host");
  return urlStr;
}

export class PaystackService {
  static async initializeTransaction(params: {
    email: string;
    amount: number;
    reference: string;
    metadata?: Record<string, unknown>;
    callback_url?: string;
    channels?: ("card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer")[];
  }) {
    const callbackUrl = params.callback_url
      ? assertMerchantCallback(params.callback_url)
      : assertMerchantCallback(`${urls.merchantBase()}/checkout/success`);
    const initArgs = {
      email: params.email,
      amountKobo: params.amount,
      reference: params.reference,
      callbackUrl,
      metadata: params.metadata || {},
      channels: params.channels,
    } as unknown as PaystackInitArgs;

    const init = await Paystack.initializeTransaction(initArgs);
    return {
      status: true,
      message: "Authorization URL created",
      data: {
        authorization_url: init.authorizationUrl,
        access_code: init.accessCode,
        reference: init.reference,
      },
    };
  }

  static async verifyTransaction(reference: string) {
    const verified = await Paystack.verifyTransaction(reference);
    return verified.raw;
  }

  static async createPaymentForPlanChange(
    email: string,
    newPlan: string,
    storeId: string,
    billingCycle: BillingCycle = "monthly",
    paymentMethod: "card" | "bank_transfer" = "card",
  ) {
    // Calculate price based on plan and billing cycle
    const planKey = newPlan.toUpperCase() as PlanKey;
    const amountKobo = getPlanPrice(planKey, billingCycle) * 100;
    
    if (amountKobo === 0) {
      throw new Error("Cannot create payment for free plan");
    }

    const reference = `sub_${storeId}_${billingCycle}_${Date.now()}`;
    
    // For bank transfer, include bank_transfer channel
    // For card auto-debit, we use card channel
    const channels: ("card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer")[] = 
      paymentMethod === "bank_transfer" 
        ? ["bank_transfer", "bank", "ussd"]
        : ["card"];

    const response = await this.initializeTransaction({
      email,
      amount: amountKobo,
      reference,
      metadata: {
        storeId,
        newPlan: planKey,
        type: "subscription",
        billingCycle,
        paymentMethod,
        baseAmountKobo: amountKobo,
        vatAmountKobo: 0,
        vatRate: 0,
      },
      callback_url: `${urls.merchantBase()}/checkout/success`,
      channels,
    });

    return {
      authorization_url: response?.data?.authorization_url,
      reference: response?.data?.reference,
    };
  }

  static async verifyPlanChangePayment(reference: string) {
    const response = await this.verifyTransaction(reference);
    const responseData = isRecord(response.data) ? response.data : {};
    if (responseData.status !== "success") {
      throw new Error("Payment not successful");
    }
    const metadata = isRecord(responseData.metadata)
      ? responseData.metadata
      : {};
    const storeId = metadata.storeId as string | undefined;
    const newPlan = metadata.newPlan as string | undefined;
    const billingCycle = metadata.billingCycle as BillingCycle | undefined;
    const paymentMethod = metadata.paymentMethod as string | undefined;

    if (!storeId || !newPlan) {
      throw new Error("Invalid payment metadata");
    }

    const amountKobo = Number(responseData.amount || 0);
    const currency = String(responseData.currency || "NGN");
    return {
      success: true,
      storeId,
      newPlan,
      billingCycle: billingCycle || "monthly",
      paymentMethod: paymentMethod || "card",
      amountKobo,
      currency,
    };
  }

  // Paystack Plans + Subscriptions for auto-debit card payments
  static async createPaystackPlan(
    name: string,
    amountKobo: number,
    interval: "monthly" | "quarterly",
  ) {
    // Map our billing cycle to Paystack interval
    const paystackInterval = interval === "quarterly" ? "quarterly" : "monthly";
    
    const resp = await Paystack.createPlan({
      name,
      amountKobo,
      interval: paystackInterval as unknown as "monthly" | "daily" | "weekly" | "annually",
    });
    return resp;
  }

  static async createSubscription(
    customerEmail: string,
    planCode: string,
    metadata?: Record<string, unknown>,
  ) {
    const resp = await Paystack.createSubscription({
      customer: customerEmail,
      plan: planCode,
      metadata: metadata || {},
    } as unknown as { customer: string; plan: string; start_date?: string });
    return resp;
  }

  static async initiateTemplatePurchase(
    email: string,
    templateId: string,
    storeId: string,
    amountNgn: number,
  ) {
    const reference = `tpl_${templateId.slice(0, 8)}_${storeId}_${Date.now()}`;
    const response = await this.initializeTransaction({
      email,
      amount: amountNgn * 100, // to kobo
      reference,
      metadata: {
        storeId,
        templateId,
        type: "template_purchase",
      },
      callback_url: `${urls.merchantBase()}/dashboard/store/themes?payment=success&tid=${encodeURIComponent(templateId)}`,
    });
    return {
      authorization_url: response?.data?.authorization_url,
      reference: response?.data?.reference,
    };
  }

  static async getBanks() {
    return await Paystack.getBanks();
  }

  static async resolveAccount(accountNumber: string, bankCode: string) {
    return await Paystack.resolveAccount(accountNumber, bankCode);
  }

  static async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string,
    type: "nuban" | "mobile_money" | "basa" = "nuban",
  ) {
    const resp = await Paystack.createTransferRecipient({
      type,
      name,
      accountNumber,
      bankCode,
    });
    const raw = isRecord(resp.raw)
      ? resp.raw
      : { status: false, message: "Invalid response", data: {} };
    const responseData = isRecord(raw.data) ? raw.data : {};
    return (responseData as Record<string, unknown>).recipient_code
      ? responseData
      : { recipient_code: resp.recipientCode };
  }

  // Transfer methods for wallet withdrawals
  static async initiateTransfer(
    recipientCode: string,
    amountKobo: number,
    reason: string,
    reference?: string,
  ) {
    const resp = await Paystack.initiateTransfer({
      source: "balance",
      recipient: recipientCode,
      amount: amountKobo,
      reason,
      reference,
    } as unknown as { amountKobo: number; recipientCode: string; reference?: string; reason?: string });
    return resp;
  }

  static async verifyTransfer(reference: string) {
    const resp = await Paystack.verifyTransfer(reference);
    return resp;
  }
}
