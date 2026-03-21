import { env } from "@/lib/config/env";
import { logger } from "@vayva/shared";

export interface PaystackMetadata {
  [key: string]: string | number | boolean | undefined;
}

export interface PaystackInitArgs {
  email: string;
  amountKobo: number;
  reference: string;
  metadata?: PaystackMetadata;
  callbackUrl?: string;
}

export interface PaystackApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
  raw?: any;
}

interface TransferRecipientArgs {
  type: "nuban" | "mobile_money" | "basa";
  name: string;
  accountNumber: string;
  bankCode: string;
  currency?: string;
}

interface PaystackTransactionInit {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackTransactionVerify {
  status: string;
  message: string;
  amount: number;
  currency: string;
  metadata: PaystackMetadata;
  gateway_response?: string;
  channel?: string;
  transaction_date?: string;
}

interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  country: string;
  currency: string;
}

interface PaystackAccountResolve {
  account_number: string;
  account_name: string;
  bank_id: number;
}

interface PaystackTransferRecipient {
  recipient_code: string;
  type: string;
  name: string;
  details: {
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
}

const PAYSTACK_BASE_URL = "https://api.paystack?.co";
const SECRET_KEY = env.PAYSTACK_SECRET_KEY || process.env?.PAYSTACK_SECRET_KEY;

/**
 * Make authenticated request to Paystack API
 */
async function paystackRequest<T>(
  endpoint: string,
  options: Parameters<typeof fetch>[1] = {}
): Promise<PaystackApiResponse<T>> {
  if (!SECRET_KEY) {
    throw new Error("Paystack secret key not configured");
  }

  const url = `${PAYSTACK_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    logger.error("Paystack API error", { endpoint, status: response.status, message: data.message });
    throw new Error(data.message || `Paystack API error: ${response.statusText}`);
  }

  return data as PaystackApiResponse<T>;
}

/**
 * Paystack API client
 */
export const Paystack = {
  /**
   * Initialize a new transaction
   */
  initializeTransaction: async (args: PaystackInitArgs) => {
    const response = await paystackRequest<PaystackTransactionInit>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: args.email,
        amount: args.amountKobo,
        reference: args.reference,
        metadata: args.metadata,
        callback_url: args.callbackUrl,
      }),
    });

    return {
      authorizationUrl: response.data?.authorization_url,
      accessCode: response.data?.access_code,
      reference: response.data?.reference,
    };
  },

  /**
   * Verify a transaction by reference
   */
  verifyTransaction: async (reference: string) => {
    const response = await paystackRequest<PaystackTransactionVerify>(`/transaction/verify/${reference}`);

    return {
      status: response.status,
      message: response.message,
      data: {
        status: response.data?.status,
        message: response.data?.message,
        amount: response.data?.amount,
        currency: response.data?.currency,
        metadata: response.data?.metadata,
      },
      raw: response,
    };
  },

  /**
   * Get list of supported banks
   */
  getBanks: async (): Promise<PaystackBank[]> => {
    try {
      const response = await paystackRequest<{ banks: PaystackBank[] }>("/bank?country=nigeria");
      return response.data?.banks || [];
    } catch (error) {
      logger.error("Failed to fetch Paystack banks", { error });
      return [];
    }
  },

  /**
   * Resolve account number to account name
   */
  resolveAccount: async (accountNumber: string, bankCode: string) => {
    const response = await paystackRequest<PaystackAccountResolve>(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );

    return {
      account_number: response.data?.account_number,
      account_name: response.data?.account_name,
    };
  },

  /**
   * Create a transfer recipient
   */
  createTransferRecipient: async (args: TransferRecipientArgs) => {
    const response = await paystackRequest<PaystackTransferRecipient>("/transferrecipient", {
      method: "POST",
      body: JSON.stringify({
        type: args.type,
        name: args.name,
        account_number: args.accountNumber,
        bank_code: args.bankCode,
        currency: args.currency || "NGN",
      }),
    });

    return {
      status: response.status,
      recipientCode: response.data?.recipient_code,
      raw: response,
    };
  },

  /**
   * Initiate a transfer
   */
  initiateTransfer: async (args: {
    amountKobo: number;
    recipientCode: string;
    reference: string;
    reason?: string;
  }) => {
    const response = await paystackRequest<{ transfer_code: string; status: string }>("/transfer", {
      method: "POST",
      body: JSON.stringify({
        source: "balance",
        amount: args.amountKobo,
        recipient: args.recipientCode,
        reference: args.reference,
        reason: args.reason || "Payout",
      }),
    });

    return {
      transferCode: response.data?.transfer_code,
      status: response.data?.status,
      raw: response,
    };
  },
};

// Re-export for backward compatibility
export default Paystack;
