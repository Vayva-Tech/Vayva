const PAYSTACK_BASE = "https://api.paystack.co";

export type TransferRecipientArgs = {
  type?: string;
  name: string;
  accountNumber: string;
  bankCode: string;
};

export type PaystackInitArgs = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export type PaystackInitResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export type PaystackVerifyResult = {
  status: "success" | "failed" | "abandoned" | "ongoing" | "reversed" | "unknown";
  amountKobo: number | null;
  paidAt: string | null;
  gatewayResponse: string | null;
  raw: PaystackApiResponse;
};

export type PaystackTransferRecipientResult = {
  recipientCode: string;
  raw: PaystackApiResponse;
};

export type PaystackTransferResult = {
  reference?: string;
  transferCode: string;
  status: string;
  raw: PaystackApiResponse;
};

export type PaystackRefundResult = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  rawData: PaystackApiResponse;
};

export type PaystackPlan = {
  id: number;
  name: string;
  plan_code: string;
  description: string | null;
  amount: number;
  interval: string;
  send_invoices: boolean;
  send_sms: boolean;
  currency: string;
};

export type PaystackSubscription = {
  id: number;
  customer: {
    id: number;
    email: string;
    customer_code: string;
  };
  plan: PaystackPlan;
  status: string;
  quantity: number;
  amount: number;
  subscription_code: string;
  next_payment_date: string;
  createdAt: string;
};

export type PaystackSubaccount = {
  id: number;
  business_name: string;
  account_number: string;
  percentage_charge: number;
  settlement_bank: string;
  subaccount_code: string;
};

export type PaystackDedicatedAccount = {
  bank: {
    name: string;
    id: number;
    slug: string;
  };
  account_name: string;
  account_number: string;
  assigned: boolean;
  currency: string;
  active: boolean;
  id: number;
  created_at: string;
  updated_at: string;
};

export type PaystackDispute = {
  id: number;
  refund_amount: number;
  currency: string;
  status: string;
  resolution: string | null;
  message: string | null;
  reason: string | null;
  evidence: unknown | null;
  last_filled_amt: number;
  last_filled_date: string | null;
  createdAt: string;
  updatedAt: string;
  transaction: {
    id: number;
    reference: string;
    amount: number;
    status: string;
  };
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

/**
 * Standard Paystack API envelope.
 * Every Paystack endpoint returns `{ status, message, data }` at the top level.
 */
export interface PaystackApiResponse {
  status: boolean;
  message: string;
  data: Record<string, unknown>;
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Server misconfigured: PAYSTACK_SECRET_KEY missing");
  return key;
}

async function paystackFetch(path: string, init: RequestInit): Promise<PaystackApiResponse> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const json = await res.json().catch(() => null) as Record<string, unknown> | null;

  if (!res.ok) {
    const msg =
      json && typeof json.message === "string"
        ? json.message
        : `Paystack request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as unknown as PaystackApiResponse;
}

export type PaystackService = {
  // Core Transactions
  initializeTransaction: (args: PaystackInitArgs) => Promise<PaystackInitResult>;
  verifyTransaction: (reference: string) => Promise<PaystackVerifyResult>;
  createRefund: (args: { transaction: string; amount?: number; customer_note?: string; merchant_note?: string }) => Promise<PaystackRefundResult>;

  // Transfers & Payouts
  createTransferRecipient: (args: { type?: string; name: string; accountNumber: string; bankCode: string; currency?: string }) => Promise<PaystackTransferRecipientResult>;
  initiateTransfer: (args: { amountKobo: number; recipientCode: string; reference?: string; reason?: string }) => Promise<PaystackTransferResult>;
  verifyTransfer: (reference: string) => Promise<{ status: string; transferCode: string | undefined; raw: PaystackApiResponse }>;
  initiateBulkTransfer: (transfers: Array<{ amountKobo: number; recipientCode: string; reference: string; reason?: string }>) => Promise<{ batchId: string; raw: PaystackApiResponse }>;

  // Bank Resolution
  getBanks: (country?: string) => Promise<PaystackBank[]>;
  resolveAccount: (accountNumber: string, bankCode: string) => Promise<PaystackResolvedAccount>;
  verifyBvnIdentity: (bvn: string) => Promise<{ bvn: string; first_name: string; last_name: string; middle_name: string | null; name_match_score: number; verified: boolean }>;

  // Subscriptions & Plans
  createPlan: (args: { name: string; amountKobo: number; interval: "daily" | "weekly" | "monthly" | "annually"; description?: string; send_invoices?: boolean }) => Promise<{ planCode: string; plan: PaystackPlan; raw: PaystackApiResponse }>;
  createSubscription: (args: { customer: string; plan: string; start_date?: string }) => Promise<{ subscriptionCode: string; subscription: PaystackSubscription; raw: PaystackApiResponse }>;
  fetchSubscription: (code: string) => Promise<PaystackSubscription>;
  disableSubscription: (code: string, token: string) => Promise<{ message: string; raw: PaystackApiResponse }>;
  enableSubscription: (code: string, token: string) => Promise<{ message: string; raw: PaystackApiResponse }>;

  // Subaccounts (Marketplace/Multi-vendor)
  createSubaccount: (args: { business_name: string; settlement_bank: string; account_number: string; percentage_charge?: number; description?: string }) => Promise<{ subaccount: PaystackSubaccount; raw: PaystackApiResponse }>;
  fetchSubaccount: (idOrCode: string) => Promise<PaystackSubaccount>;
  updateSubaccount: (idOrCode: string, args: Partial<PaystackSubaccount>) => Promise<{ subaccount: PaystackSubaccount; raw: PaystackApiResponse }>;

  // Dedicated Virtual Accounts
  createDedicatedAccount: (args: { customer: string; preferred_bank?: string; subaccount?: string }) => Promise<{ dedicatedAccount: PaystackDedicatedAccount; raw: PaystackApiResponse }>;
  fetchDedicatedAccount: (id: string) => Promise<PaystackDedicatedAccount>;
  deactivateDedicatedAccount: (id: string) => Promise<{ message: string; raw: PaystackApiResponse }>;
  splitDedicatedAccountTransaction: (args: { customer: string; subaccount: string; share?: number; preferred_bank?: string }) => Promise<{ dedicatedAccount: PaystackDedicatedAccount; raw: PaystackApiResponse }>;

  // Disputes & Chargebacks
  fetchDisputes: (status?: string) => Promise<PaystackDispute[]>;
  fetchDispute: (id: string) => Promise<PaystackDispute>;
  addDisputeEvidence: (id: string, args: { customer_email: string; customer_name: string; customer_phone: string; service_details: string; delivery_address?: string; delivery_date?: string }) => Promise<{ message: string; raw: PaystackApiResponse }>;
  resolveDispute: (id: string, args: { resolution: "merchant-accepted" | "declined"; message: string; refund_amount?: number }) => Promise<{ message: string; raw: PaystackApiResponse }>;

  // Transfer Control (OTP)
  checkBalance: () => Promise<{ currency: string; balance: number; raw: PaystackApiResponse }>;
  resendTransferOTP: (transferCode: string, reason: "resend-otp") => Promise<{ message: string; raw: PaystackApiResponse }>;
  finalizeTransfer: (transferCode: string, otp: string) => Promise<PaystackTransferResult>;
};

export const Paystack: PaystackService = {
  async initializeTransaction(args: PaystackInitArgs): Promise<PaystackInitResult> {
    if (!args.email) throw new Error("email required");
    if (!Number.isFinite(args.amountKobo) || args.amountKobo <= 0) throw new Error("amountKobo invalid");
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

    const data = json.data;
    return {
      authorizationUrl: String(data.authorization_url),
      accessCode: String(data.access_code),
      reference: String(data.reference),
    };
  },

  async verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
    if (!reference) throw new Error("reference required");
    const json = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`, { method: "GET" });
    const data = json.data;
    const status = (String(data.status || "unknown")) as PaystackVerifyResult["status"];
    return {
      status,
      amountKobo: typeof data.amount === "number" ? data.amount : null,
      paidAt: typeof data.paid_at === "string" ? data.paid_at : null,
      gatewayResponse: typeof data.gateway_response === "string" ? data.gateway_response : null,
      raw: json,
    };
  },

  async createTransferRecipient(args: { name: string; accountNumber: string; bankCode: string; type?: string }): Promise<PaystackTransferRecipientResult> {
    const json = await paystackFetch("/transferrecipient", {
      method: "POST",
      body: JSON.stringify({
        type: args.type || "nuban",
        name: args.name,
        account_number: args.accountNumber,
        bank_code: args.bankCode,
        currency: "NGN",
      }),
    });
    return {
      recipientCode: String(json.data.recipient_code),
      raw: json,
    };
  },

  async initiateTransfer(args: { amountKobo: number; recipientCode: string; reference?: string; reason?: string }): Promise<PaystackTransferResult> {
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
      transferCode: String(json.data.transfer_code),
      status: String(json.data.status),
      raw: json,
    };
  },

  async verifyTransfer(reference: string): Promise<{ status: string; transferCode: string | undefined; raw: PaystackApiResponse }> {
    if (!reference) throw new Error("reference required");
    const json = await paystackFetch(`/transfer/verify/${encodeURIComponent(reference)}`, { method: "GET" });
    return {
      status: String(json.data.status),
      transferCode: json.data.transfer_code ? String(json.data.transfer_code) : undefined,
      raw: json,
    };
  },

  async getBanks(): Promise<PaystackBank[]> {
    const json = await paystackFetch(`/bank`, { method: "GET" });
    return json.data as unknown as PaystackBank[];
  },

  async resolveAccount(accountNumber: string, bankCode: string): Promise<PaystackResolvedAccount> {
    if (!accountNumber || !bankCode) throw new Error("accountNumber and bankCode required");
    const json = await paystackFetch(`/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`, { method: "GET" });
    return json.data as unknown as PaystackResolvedAccount;
  },

  async verifyBvnIdentity(bvn: string): Promise<{ bvn: string; first_name: string; last_name: string; middle_name: string | null; name_match_score: number; verified: boolean }> {
    if (!bvn || !/^\d{11}$/.test(bvn)) throw new Error("Valid 11-digit BVN required");
    
    try {
      // Paystack BVN verification endpoint
      const json = await paystackFetch(`/identity/verify/bvn`, {
        method: "POST",
        body: JSON.stringify({ bvn }),
      });
      
      const data = json.data;
      const firstName = String(data.first_name || data.firstname || "");
      const lastName = String(data.last_name || data.lastname || "");
      const middleName = data.middle_name || data.middlename || null;
      
      // Calculate name match score (Paystack returns confidence score)
      const nameMatchScore = typeof data.name_match_score === "number" 
        ? data.name_match_score 
        : typeof data.confidence_score === "number" 
          ? data.confidence_score 
          : 0;
      
      return {
        bvn: String(data.bvn || bvn),
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName ? String(middleName) : null,
        name_match_score: nameMatchScore,
        verified: Boolean(data.verified !== false && data.status === "verified"),
      };
    } catch (error) {
      logger.error("[Paystack.verifyBvnIdentity]", { bvn, error });
      throw new Error("BVN verification failed");
    }
  },

  async createRefund(args: { transaction: string; amount?: number; customer_note?: string; merchant_note?: string }): Promise<PaystackRefundResult> {
    if (!args.transaction) throw new Error("transaction (reference or id) required");
    const json = await paystackFetch("/refund", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return {
      id: String(json.data.id),
      status: String(json.data.status),
      amount: Number(json.data.amount),
      currency: String(json.data.currency),
      rawData: json,
    };
  },

  // Bulk Transfers
  async initiateBulkTransfer(transfers: Array<{ amountKobo: number; recipientCode: string; reference: string; reason?: string }>): Promise<{ batchId: string; raw: PaystackApiResponse }> {
    if (!transfers || transfers.length === 0) throw new Error("transfers array required");
    const json = await paystackFetch("/transfer/bulk", {
      method: "POST",
      body: JSON.stringify({
        currency: "NGN",
        transfers: transfers.map(t => ({
          amount: t.amountKobo,
          recipient: t.recipientCode,
          reference: t.reference,
          reason: t.reason || "Bulk payout",
        })),
      }),
    });
    return {
      batchId: String(json.data.batch_id || json.data.id),
      raw: json,
    };
  },

  // Subscriptions & Plans
  async createPlan(args: { name: string; amountKobo: number; interval: "daily" | "weekly" | "monthly" | "annually"; description?: string; send_invoices?: boolean }): Promise<{ planCode: string; plan: PaystackPlan; raw: PaystackApiResponse }> {
    if (!args.name) throw new Error("plan name required");
    if (!Number.isFinite(args.amountKobo) || args.amountKobo <= 0) throw new Error("amountKobo invalid");
    const json = await paystackFetch("/plan", {
      method: "POST",
      body: JSON.stringify({
        name: args.name,
        amount: args.amountKobo,
        interval: args.interval,
        description: args.description,
        send_invoices: args.send_invoices,
      }),
    });
    return {
      planCode: String(json.data.plan_code),
      plan: json.data as unknown as PaystackPlan,
      raw: json,
    };
  },

  async createSubscription(args: { customer: string; plan: string; start_date?: string }): Promise<{ subscriptionCode: string; subscription: PaystackSubscription; raw: PaystackApiResponse }> {
    if (!args.customer || !args.plan) throw new Error("customer and plan required");
    const json = await paystackFetch("/subscription", {
      method: "POST",
      body: JSON.stringify({
        customer: args.customer,
        plan: args.plan,
        start_date: args.start_date,
      }),
    });
    return {
      subscriptionCode: String(json.data.subscription_code),
      subscription: json.data as unknown as PaystackSubscription,
      raw: json,
    };
  },

  async fetchSubscription(code: string): Promise<PaystackSubscription> {
    if (!code) throw new Error("subscription code required");
    const json = await paystackFetch(`/subscription/${encodeURIComponent(code)}`, { method: "GET" });
    return json.data as unknown as PaystackSubscription;
  },

  async disableSubscription(code: string, token: string): Promise<{ message: string; raw: PaystackApiResponse }> {
    if (!code || !token) throw new Error("code and email token required");
    const json = await paystackFetch("/subscription/disable", {
      method: "POST",
      body: JSON.stringify({ code, token }),
    });
    return {
      message: String(json.message),
      raw: json,
    };
  },

  async enableSubscription(code: string, token: string): Promise<{ message: string; raw: PaystackApiResponse }> {
    if (!code || !token) throw new Error("code and email token required");
    const json = await paystackFetch("/subscription/enable", {
      method: "POST",
      body: JSON.stringify({ code, token }),
    });
    return {
      message: String(json.message),
      raw: json,
    };
  },

  // Subaccounts (Marketplace)
  async createSubaccount(args: { business_name: string; settlement_bank: string; account_number: string; percentage_charge?: number; description?: string }): Promise<{ subaccount: PaystackSubaccount; raw: PaystackApiResponse }> {
    if (!args.business_name || !args.settlement_bank || !args.account_number) {
      throw new Error("business_name, settlement_bank, and account_number required");
    }
    const json = await paystackFetch("/subaccount", {
      method: "POST",
      body: JSON.stringify({
        business_name: args.business_name,
        settlement_bank: args.settlement_bank,
        account_number: args.account_number,
        percentage_charge: args.percentage_charge || 0,
        description: args.description,
      }),
    });
    return {
      subaccount: json.data as unknown as PaystackSubaccount,
      raw: json,
    };
  },

  async fetchSubaccount(idOrCode: string): Promise<PaystackSubaccount> {
    if (!idOrCode) throw new Error("subaccount id or code required");
    const json = await paystackFetch(`/subaccount/${encodeURIComponent(idOrCode)}`, { method: "GET" });
    return json.data as unknown as PaystackSubaccount;
  },

  async updateSubaccount(idOrCode: string, args: Partial<PaystackSubaccount>): Promise<{ subaccount: PaystackSubaccount; raw: PaystackApiResponse }> {
    if (!idOrCode) throw new Error("subaccount id or code required");
    const json = await paystackFetch(`/subaccount/${encodeURIComponent(idOrCode)}`, {
      method: "PUT",
      body: JSON.stringify(args),
    });
    return {
      subaccount: json.data as unknown as PaystackSubaccount,
      raw: json,
    };
  },

  // Dedicated Virtual Accounts
  async createDedicatedAccount(args: { customer: string; preferred_bank?: string; subaccount?: string }): Promise<{ dedicatedAccount: PaystackDedicatedAccount; raw: PaystackApiResponse }> {
    if (!args.customer) throw new Error("customer code or email required");
    const json = await paystackFetch("/dedicated_account", {
      method: "POST",
      body: JSON.stringify({
        customer: args.customer,
        preferred_bank: args.preferred_bank || "wema-bank",
        subaccount: args.subaccount,
      }),
    });
    return {
      dedicatedAccount: json.data as unknown as PaystackDedicatedAccount,
      raw: json,
    };
  },

  async fetchDedicatedAccount(id: string): Promise<PaystackDedicatedAccount> {
    if (!id) throw new Error("dedicated account id required");
    const json = await paystackFetch(`/dedicated_account/${encodeURIComponent(id)}`, { method: "GET" });
    return json.data as unknown as PaystackDedicatedAccount;
  },

  async deactivateDedicatedAccount(id: string): Promise<{ message: string; raw: PaystackApiResponse }> {
    if (!id) throw new Error("dedicated account id required");
    const json = await paystackFetch("/dedicated_account/deactivate", {
      method: "POST",
      body: JSON.stringify({ account_number: id }),
    });
    return {
      message: String(json.message),
      raw: json,
    };
  },

  async splitDedicatedAccountTransaction(args: { customer: string; subaccount: string; share?: number; preferred_bank?: string }): Promise<{ dedicatedAccount: PaystackDedicatedAccount; raw: PaystackApiResponse }> {
    if (!args.customer || !args.subaccount) throw new Error("customer and subaccount required");
    const json = await paystackFetch("/dedicated_account/split", {
      method: "POST",
      body: JSON.stringify({
        customer: args.customer,
        subaccount: args.subaccount,
        share: args.share,
        preferred_bank: args.preferred_bank,
      }),
    });
    return {
      dedicatedAccount: json.data as unknown as PaystackDedicatedAccount,
      raw: json,
    };
  },

  // Disputes & Chargebacks
  async fetchDisputes(status?: string): Promise<PaystackDispute[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const json = await paystackFetch(`/dispute${query}`, { method: "GET" });
    return (json.data as unknown as PaystackDispute[]) || [];
  },

  async fetchDispute(id: string): Promise<PaystackDispute> {
    if (!id) throw new Error("dispute id required");
    const json = await paystackFetch(`/dispute/${encodeURIComponent(id)}`, { method: "GET" });
    return json.data as unknown as PaystackDispute;
  },

  async addDisputeEvidence(id: string, args: { customer_email: string; customer_name: string; customer_phone: string; service_details: string; delivery_address?: string; delivery_date?: string }): Promise<{ message: string; raw: PaystackApiResponse }> {
    if (!id) throw new Error("dispute id required");
    const json = await paystackFetch(`/dispute/${encodeURIComponent(id)}/evidence`, {
      method: "POST",
      body: JSON.stringify(args),
    });
    return {
      message: String(json.message),
      raw: json,
    };
  },

  async resolveDispute(id: string, args: { resolution: "merchant-accepted" | "declined"; message: string; refund_amount?: number }): Promise<{ message: string; raw: PaystackApiResponse }> {
    if (!id) throw new Error("dispute id required");
    const json = await paystackFetch(`/dispute/${encodeURIComponent(id)}/resolve`, {
      method: "PUT",
      body: JSON.stringify(args),
    });
    return {
      message: String(json.message),
      raw: json,
    };
  },

  // Transfer Control (OTP)
  async checkBalance(): Promise<{ currency: string; balance: number; raw: PaystackApiResponse }> {
    const json = await paystackFetch("/balance", { method: "GET" });
    const balanceData = Array.isArray(json.data) ? json.data[0] : json.data;
    return {
      currency: String(balanceData?.currency || "NGN"),
      balance: Number(balanceData?.balance || 0),
      raw: json,
    };
  },

  async resendTransferOTP(transferCode: string, reason: "resend-otp"): Promise<{ message: string; raw: PaystackApiResponse }> {
    if (!transferCode) throw new Error("transfer code required");
    const json = await paystackFetch("/transfer/resend_otp", {
      method: "POST",
      body: JSON.stringify({ transfer_code: transferCode, reason }),
    });
    return {
      message: String(json.message),
      raw: json,
    };
  },

  async finalizeTransfer(transferCode: string, otp: string): Promise<PaystackTransferResult> {
    if (!transferCode || !otp) throw new Error("transferCode and otp required");
    const json = await paystackFetch("/transfer/finalize_transfer", {
      method: "POST",
      body: JSON.stringify({ transfer_code: transferCode, otp }),
    });
    return {
      reference: String(json.data.reference),
      status: String(json.data.status),
      transferCode: String(json.data.transfer_code),
      raw: json,
    };
  },
};
