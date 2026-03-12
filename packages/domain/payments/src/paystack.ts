const PAYSTACK_BASE = "https://api.paystack.co";

export type PaystackInitArgs = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
};

export type PaystackInitResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export type PaystackVerifyResult = {
  status:
    | "success"
    | "failed"
    | "abandoned"
    | "ongoing"
    | "reversed"
    | "unknown";
  amountKobo: number | null;
  paidAt: string | null;
  gatewayResponse: string | null;
  raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};

export type PaystackTransferRecipientResult = {
  recipientCode: string;
  raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};

export type PaystackTransferResult = {
  transferCode: string;
  status: string;
  raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};

export type PaystackRefundResult = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  rawData: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};

export type PaystackBank = {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  type: string;
  country: string;
  currency: string;
};

export type PaystackResolvedAccount = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

export type PaystackCustomerCreateResult = {
  customerCode: string;
  raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};

export type PaystackDedicatedVirtualAccountResult = {
  accountNumber: string;
  accountName: string;
  bankName: string;
  providerRef: string;
  raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};

/**
 * Standard Paystack API envelope.
 * Every Paystack endpoint returns `{ status, message, data }` at the top level.
 */
export interface PaystackApiResponse<T = Record<string, unknown>> {
  status: boolean;
  message: string;
  data: T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key)
    throw new Error("Server misconfigured: PAYSTACK_SECRET_KEY missing");
  return key;
}

async function paystackFetch(
  path: string,
  init: RequestInit,
): Promise<PaystackApiResponse<Record<string, unknown> | unknown[] | null>> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const json = await res.json().catch(() => null);
  if (!isRecord(json)) {
    throw new Error("Paystack returned invalid response");
  }

  if (!res.ok) {
    const msg =
      typeof json.message === "string"
        ? json.message
        : `Paystack request failed (${res.status})`;
    throw new Error(msg);
  }
  return {
    status: Boolean(json.status),
    message: typeof json.message === "string" ? json.message : "",
    data: "data" in json ? (json.data as Record<string, unknown> | unknown[] | null) : null,
  };
}

export const Paystack = {
  async createCustomer(args: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaystackCustomerCreateResult> {
    if (!args.email) throw new Error("email required");
    if (!args.firstName) throw new Error("firstName required");
    if (!args.lastName) throw new Error("lastName required");

    const json = await paystackFetch("/customer", {
      method: "POST",
      body: JSON.stringify({
        email: args.email,
        first_name: args.firstName,
        last_name: args.lastName,
        phone: args.phone,
        metadata: args.metadata,
      }),
    });

    if (!isRecord(json.data)) {
      throw new Error("Paystack customer response missing data");
    }

    const customerCode =
      typeof json.data.customer_code === "string" ? json.data.customer_code : "";
    if (!customerCode) {
      throw new Error("Paystack customer response invalid");
    }

    return {
      customerCode,
      raw: json,
    };
  },

  async createDedicatedVirtualAccount(args: {
    customerCode: string;
    preferredBank?: string;
  }): Promise<PaystackDedicatedVirtualAccountResult> {
    if (!args.customerCode) throw new Error("customerCode required");

    const json = await paystackFetch("/dedicated_account", {
      method: "POST",
      body: JSON.stringify({
        customer: args.customerCode,
        preferred_bank: args.preferredBank,
      }),
    });

    if (!isRecord(json.data)) {
      throw new Error("Paystack dedicated account response missing data");
    }

    const accountNumber =
      typeof json.data.account_number === "string" ? json.data.account_number : "";
    const accountName =
      typeof json.data.account_name === "string" ? json.data.account_name : "";

    const bankName = isRecord(json.data.bank) && typeof json.data.bank.name === "string"
      ? json.data.bank.name
      : "";

    const providerRef =
      typeof json.data.dedicated_account_id === "number"
        ? String(json.data.dedicated_account_id)
        : typeof json.data.id === "number"
          ? String(json.data.id)
          : "";

    if (!accountNumber || !accountName) {
      throw new Error("Paystack dedicated account response invalid");
    }

    return {
      accountNumber,
      accountName,
      bankName,
      providerRef,
      raw: json,
    };
  },

  async initializeTransaction(
    args: PaystackInitArgs,
  ): Promise<PaystackInitResult> {
    if (!args.email) throw new Error("email required");
    if (!Number.isFinite(args.amountKobo) || args.amountKobo <= 0)
      throw new Error("amountKobo invalid");
    if (!args.reference) throw new Error("reference required");
    if (!args.callbackUrl) throw new Error("callbackUrl required");

    const json = await paystackFetch("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: args.email,
        amount: args.amountKobo,
        reference: args.reference,
        callback_url: args.callbackUrl,
        metadata: args.metadata,
      }),
    });

    if (!isRecord(json.data)) {
      throw new Error("Paystack initialize response missing data");
    }
    const data = json.data;
    const authorizationUrl =
      typeof data.authorization_url === "string" ? data.authorization_url : "";
    const accessCode =
      typeof data.access_code === "string" ? data.access_code : "";
    const reference = typeof data.reference === "string" ? data.reference : "";
    if (!authorizationUrl || !accessCode || !reference) {
      throw new Error("Paystack initialize response invalid");
    }
    return {
      authorizationUrl,
      accessCode,
      reference,
    };
  },

  async verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
    if (!reference) throw new Error("reference required");
    const json = await paystackFetch(
      `/transaction/verify/${encodeURIComponent(reference)}`,
      { method: "GET" },
    );
    if (!isRecord(json.data)) {
      throw new Error("Paystack verify response missing data");
    }
    const data = json.data;
    const status = String(
      data.status || "unknown",
    ) as PaystackVerifyResult["status"];
    return {
      status,
      amountKobo: typeof data.amount === "number" ? data.amount : null,
      paidAt: typeof data.paid_at === "string" ? data.paid_at : null,
      gatewayResponse:
        typeof data.gateway_response === "string"
          ? data.gateway_response
          : null,
      raw: json,
    };
  },

  async createTransferRecipient(args: {
    name: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<PaystackTransferRecipientResult> {
    const json = await paystackFetch("/transferrecipient", {
      method: "POST",
      body: JSON.stringify({
        type: "nuban",
        name: args.name,
        account_number: args.accountNumber,
        bank_code: args.bankCode,
        currency: "NGN",
      }),
    });
    return {
      recipientCode: isRecord(json.data) && typeof json.data.recipient_code === "string" 
        ? json.data.recipient_code 
        : "",
      raw: json,
    };
  },

  async initiateTransfer(args: {
    amountKobo: number;
    recipientCode: string;
    reference?: string;
    reason?: string;
  }): Promise<PaystackTransferResult> {
    const json = await paystackFetch("/transfer", {
      method: "POST",
      body: JSON.stringify({
        source: "balance",
        amount: args.amountKobo,
        recipient: args.recipientCode,
        reference: args.reference,
        reason: args.reason,
      }),
    });
    return {
      transferCode: isRecord(json.data) && typeof json.data.transfer_code === "string"
        ? json.data.transfer_code
        : "",
      status: isRecord(json.data) && typeof json.data.status === "string"
        ? json.data.status
        : "unknown",
      raw: json,
    };
  },

  async verifyTransfer(
    reference: string,
  ): Promise<{
    status: string;
    transferCode: string | undefined;
    raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
  }> {
    if (!reference) throw new Error("reference required");
    const json = await paystackFetch(
      `/transfer/verify/${encodeURIComponent(reference)}`,
      { method: "GET" },
    );
    return {
      status: isRecord(json.data) && typeof json.data.status === "string"
        ? json.data.status
        : "unknown",
      transferCode: isRecord(json.data) && typeof json.data.transfer_code === "string"
        ? json.data.transfer_code
        : undefined,
      raw: json,
    };
  },

  async getBanks(): Promise<PaystackBank[]> {
    const json = await paystackFetch(`/bank`, { method: "GET" });
    if (!Array.isArray(json.data)) return [];
    return json.data
      .filter(isRecord)
      .map((bank) => ({
        id: Number(bank.id),
        name: String(bank.name ?? ""),
        slug: String(bank.slug ?? ""),
        code: String(bank.code ?? ""),
        longcode: String(bank.longcode ?? ""),
        type: String(bank.type ?? ""),
        country: String(bank.country ?? ""),
        currency: String(bank.currency ?? ""),
      }));
  },

  async resolveAccount(
    accountNumber: string,
    bankCode: string,
  ): Promise<PaystackResolvedAccount> {
    if (!accountNumber || !bankCode)
      throw new Error("accountNumber and bankCode required");
    const json = await paystackFetch(
      `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
      { method: "GET" },
    );
    if (!isRecord(json.data)) {
      throw new Error("Paystack resolve response missing data");
    }
    const resolvedAccountNumber =
      typeof json.data.account_number === "string"
        ? json.data.account_number
        : "";
    const accountName =
      typeof json.data.account_name === "string" ? json.data.account_name : "";
    const bankId =
      typeof json.data.bank_id === "number" ? json.data.bank_id : NaN;
    if (!resolvedAccountNumber || !accountName || !Number.isFinite(bankId)) {
      throw new Error("Paystack resolve response invalid");
    }
    return {
      account_number: resolvedAccountNumber,
      account_name: accountName,
      bank_id: bankId,
    };
  },

  async createRefund(args: {
    transaction: string;
    amount?: number;
    customer_note?: string;
    merchant_note?: string;
  }): Promise<PaystackRefundResult> {
    if (!args.transaction)
      throw new Error("transaction (reference or id) required");
    const json = await paystackFetch("/refund", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return {
      id: isRecord(json.data) && typeof json.data.id === "string" ? json.data.id : "",
      status: isRecord(json.data) && typeof json.data.status === "string" ? json.data.status : "",
      amount: isRecord(json.data) && typeof json.data.amount === "number" ? json.data.amount : 0,
      currency: isRecord(json.data) && typeof json.data.currency === "string" ? json.data.currency : "",
      rawData: json,
    };
  },
};
