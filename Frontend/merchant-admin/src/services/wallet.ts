import { apiJson } from "@/lib/api";

export interface WalletSummary {
  balance: number;
  status: string;
  pinSet: boolean;
  currency: string;
  availableBalance?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  description?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface WithdrawalQuote {
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  estimatedArrival: string;
}

export interface WithdrawalResult {
  success: boolean;
  payoutId?: string;
  status?: string;
  error?: string;
  correlationId?: string;
}

export interface EligibilityResult {
  kycStatus: string;
  availableBalance: number;
  minWithdrawal: number;
  blockedReasons: string[];
  isEligible: boolean;
}

export const WalletService = {
  /**
   * Get wallet summary for the current merchant
   */
  getSummary: async (): Promise<WalletSummary> => {
    const response = await apiJson<{ success: boolean; data: WalletSummary }>("/api/wallet");
    if (!response.success) {
      throw new Error("Failed to fetch wallet summary");
    }
    return response.data;
  },

  /**
   * Get wallet transaction ledger
   */
  getLedger: async (params?: { limit?: number; offset?: number }): Promise<Transaction[]> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const response = await apiJson<{ success: boolean; data: Transaction[] }>(
      `/api/wallet/ledger?${searchParams.toString()}`
    );
    if (!response.success) {
      throw new Error("Failed to fetch ledger");
    }
    return response.data;
  },

  /**
   * Verify wallet PIN
   */
  verifyPin: async (pin: string): Promise<boolean> => {
    const response = await apiJson<{ success: boolean; valid: boolean }>("/api/wallet/verify-pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    return response.success && response.valid;
  },

  /**
   * Set wallet PIN
   */
  setPin: async (pin: string): Promise<void> => {
    const response = await apiJson<{ success: boolean }>("/api/wallet/set-pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
    if (!response.success) {
      throw new Error("Failed to set PIN");
    }
  },

  /**
   * Add a bank account for withdrawals
   */
  addBank: async (data: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }): Promise<BankAccount> => {
    const response = await apiJson<{ success: boolean; data: BankAccount }>("/api/wallet/banks", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.success) {
      throw new Error("Failed to add bank account");
    }
    return response.data;
  },

  /**
   * Get list of saved bank accounts
   */
  getBanks: async (): Promise<BankAccount[]> => {
    const response = await apiJson<{ success: boolean; data: BankAccount[] }>("/api/wallet/banks");
    if (!response.success) {
      throw new Error("Failed to fetch bank accounts");
    }
    return response.data;
  },

  /**
   * Get withdrawal eligibility status
   */
  getEligibility: async (): Promise<EligibilityResult> => {
    const response = await apiJson<{ success: boolean; data: EligibilityResult }>(
      "/api/wallet/withdraw/eligibility"
    );
    if (!response.success) {
      throw new Error("Failed to check eligibility");
    }
    return response.data;
  },

  /**
   * Get withdrawal quote (fees and net amount)
   */
  getWithdrawalQuote: async (amount: number): Promise<WithdrawalQuote> => {
    const response = await apiJson<{ success: boolean; data: WithdrawalQuote }>(
      "/api/wallet/withdraw/quote",
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      }
    );
    if (!response.success) {
      throw new Error("Failed to get withdrawal quote");
    }
    return response.data;
  },

  /**
   * Initiate a withdrawal
   */
  initiateWithdrawal: async (
    amountKobo: number,
    bankAccountId: string,
    idempotencyKey: string
  ): Promise<WithdrawalResult> => {
    const response = await apiJson<WithdrawalResult>("/api/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify({ amountKobo, bankAccountId, idempotencyKey }),
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    return response;
  },

  /**
   * Confirm a withdrawal with OTP
   */
  confirmWithdrawal: async (
    withdrawalId: string,
    otpCode: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await apiJson<{ success: boolean; message?: string }>(
      "/api/wallet/withdraw/confirm",
      {
        method: "POST",
        body: JSON.stringify({ withdrawalId, otpCode }),
      }
    );
    return response;
  },
};
