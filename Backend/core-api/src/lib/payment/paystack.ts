import {
  Paystack,
  PaystackInitArgs,
  PaystackApiResponse
} from "@vayva/payments";
import { urls } from "@vayva/shared";

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
  }) {
    const callbackUrl = params.callback_url
      ? assertMerchantCallback(params.callback_url)
      : undefined;
    const initArgs: PaystackInitArgs = {
      email: params.email,
      amountKobo: params.amount,
      reference: params.reference,
      metadata: params.metadata || {},
      ...(callbackUrl ? { callbackUrl } : {}),
    };

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
    return verified.raw as PaystackApiResponse<Record<string, unknown>>; // preserve original Paystack shape { status, message, data }
  }
  static async createPaymentForPlanChange(
    email: string,
    newPlan: string,
    storeId: string,
  ) {
    // Plan prices in kobo (no VAT)
    const planPrices = {
      FREE: 0,
      STARTER: 25000 * 100, // ₦25,000
      PRO: 35000 * 100, // ₦35,000
      PRO_PLUS: 50000 * 100, // ₦50,000
    } as const;
    const baseAmount =
      (planPrices as Record<string, number | undefined>)[newPlan] || 0;
    if (baseAmount === 0) {
      throw new Error("Cannot create payment for free plan");
    }
    // No VAT - price is flat
    const amount = baseAmount;
    const reference = `sub_${storeId}_${Date.now()}`;
    const response = await this.initializeTransaction({
      email,
      amount,
      reference,
      metadata: {
        storeId,
        newPlan,
        type: "subscription",
        baseAmountKobo: baseAmount,
        vatAmountKobo: 0,
        vatRate: 0,
      },
      callback_url: `${urls.merchantBase()}/dashboard/settings/subscription?payment=success`,
    });
    return {
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
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

    if (!storeId || !newPlan) {
      throw new Error("Invalid payment metadata");
    }

    const amountKobo = Number(responseData.amount || 0);
    const currency = String(responseData.currency || "NGN");
    return {
      success: true,
      storeId,
      newPlan,
      amountKobo,
      currency,
    };
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
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
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
  ) {
    const resp = await Paystack.createTransferRecipient({
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
}
