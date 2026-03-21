/**
 * Payment Service
 * Handles payouts, withdrawals, and payment operations
 */
export class PaymentService {
  /**
   * Get list of payouts for a store
   */
  static async getPayouts(storeId: string): Promise<{ data: any[]; total: number }> {
    const res = await fetch(`/api/payments/payouts?storeId=${storeId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch payouts: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Request a new payout
   */
  static async requestPayout(data: {
    amount: number;
    bankAccountId: string;
  }): Promise<{ success: boolean; payoutId?: string; message?: string }> {
    const res = await fetch("/api/payments/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Failed to request payout" }));
      throw new Error(error.error || `Failed to request payout: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Initiate a wallet withdrawal
   */
  static async initiateWithdrawal(data: {
    amountKobo: number;
    pin: string;
    bankAccountId: string;
  }): Promise<{ withdrawalId?: string; error?: string; message?: string }> {
    const res = await fetch("/api/wallet/withdraw/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Failed to initiate withdrawal" }));
      throw new Error(error.error || `Failed to initiate withdrawal: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Confirm a withdrawal with OTP
   */
  static async confirmWithdrawal(
    withdrawalId: string,
    otpCode: string
  ): Promise<{ success?: boolean; error?: string; message?: string }> {
    const res = await fetch("/api/wallet/withdraw/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId, otpCode }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Failed to confirm withdrawal" }));
      throw new Error(error.error || `Failed to confirm withdrawal: ${res.statusText}`);
    }
    return res.json();
  }
}

export default PaymentService;
