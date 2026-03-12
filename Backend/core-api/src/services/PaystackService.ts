import {
  PaystackTransactionInitialize,
  PaystackTransactionVerify,
  PaystackAccountResolve,
} from "@/types/billing";
import { Paystack } from "@vayva/payments";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const PaystackService = {
  async initializeTransaction(
    email: string,
    amount: number, // in kobo
    reference: string,
    callbackUrl: string,
    metadata: Record<string, unknown> = {},
  ): Promise<PaystackTransactionInitialize> {
    const init = await Paystack.initializeTransaction({
      email,
      amountKobo: amount,
      reference,
      callbackUrl,
      metadata,
    });
    return {
      authorization_url: init.authorizationUrl,
      access_code: init.accessCode,
      reference: init.reference,
    };
  },
  async verifyTransaction(
    reference: string,
  ): Promise<PaystackTransactionVerify> {
    const verified = await Paystack.verifyTransaction(reference);
    const raw = isRecord(verified.raw) ? verified.raw : null;
    if (!raw || !isRecord(raw.data)) {
      throw new Error("Paystack verify response missing data");
    }
    const data = raw.data;
    return {
      id: Number(data.id),
      domain: String(data.domain ?? ""),
      status: String(data.status ?? ""),
      reference: String(data.reference ?? ""),
      amount: Number(data.amount ?? 0),
      message: data.message === null ? null : String(data.message ?? ""),
      gateway_response: String(data.gateway_response ?? ""),
      paid_at: String(data.paid_at ?? ""),
      created_at: String(data.created_at ?? ""),
      channel: String(data.channel ?? ""),
      currency: String(data.currency ?? ""),
      ip_address: String(data.ip_address ?? ""),
      metadata: isRecord(data.metadata) ? data.metadata : {},
      customer: isRecord(data.customer)
        ? {
            id: Number(data.customer.id),
            first_name:
              data.customer.first_name !== null &&
              data.customer.first_name !== undefined
                ? String(data.customer.first_name)
                : null,
            last_name:
              data.customer.last_name !== null && data.customer.last_name !== undefined
                ? String(data.customer.last_name)
                : null,
            email: String(data.customer.email ?? ""),
            customer_code: String(data.customer.customer_code ?? ""),
            phone:
              data.customer.phone !== null && data.customer.phone !== undefined
                ? String(data.customer.phone)
                : null,
            metadata: isRecord(data.customer.metadata)
              ? data.customer.metadata
              : {},
            risk_action: String(data.customer.risk_action ?? ""),
          }
        : {
            id: 0,
            first_name: null,
            last_name: null,
            email: "",
            customer_code: "",
            phone: null,
            metadata: {},
            risk_action: "",
          },
      authorization: isRecord(data.authorization)
        ? {
            authorization_code: String(data.authorization.authorization_code ?? ""),
            bin: String(data.authorization.bin ?? ""),
            last4: String(data.authorization.last4 ?? ""),
            exp_month: String(data.authorization.exp_month ?? ""),
            exp_year: String(data.authorization.exp_year ?? ""),
            channel: String(data.authorization.channel ?? ""),
            card_type: String(data.authorization.card_type ?? ""),
            bank: String(data.authorization.bank ?? ""),
            country_code: String(data.authorization.country_code ?? ""),
            brand: String(data.authorization.brand ?? ""),
            reusable: Boolean(data.authorization.reusable),
            signature: String(data.authorization.signature ?? ""),
          }
        : {
            authorization_code: "",
            bin: "",
            last4: "",
            exp_month: "",
            exp_year: "",
            channel: "",
            card_type: "",
            bank: "",
            country_code: "",
            brand: "",
            reusable: false,
            signature: "",
          },
    };
  },
  async resolveBankAccount(
    accountNumber: string,
    bankCode: string,
  ): Promise<PaystackAccountResolve> {
    const data = await Paystack.resolveAccount(accountNumber, bankCode);
    return {
      account_number: data.account_number,
      account_name: data.account_name,
      bank_id: data.bank_id,
    };
  },
};
