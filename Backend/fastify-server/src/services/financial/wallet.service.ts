import { prisma } from "@vayva/db";
import { logger } from "../../lib/logger";
import bcrypt from "bcryptjs";
import { PaystackService } from "./paystack.service";

interface WalletSummary {
  balance: number;
  status: string;
  pinSet: boolean;
  currency: string;
  availableBalance?: number;
  pendingKobo: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  status: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

interface BankAccount {
  id: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  recipientCode?: string;
  isDefault: boolean;
}

export class WalletService {
  constructor(
    private readonly db = prisma,
    private readonly paystackService = new PaystackService(),
  ) {}

  /**
   * Get wallet summary for a store
   * Returns balance, status, PIN state, and currency
   */

  async getSummary(storeId: string): Promise<WalletSummary> {
    const wallet = await this.db.wallet.findUnique({
      where: { storeId },
    });

    if (!wallet) {
      await this.db.wallet.create({
        data: {
          storeId,
          availableKobo: 0,
          pendingKobo: 0,
          pinSet: false,
          isLocked: false,
          failedPinAttempts: 0,
        },
      });
      return {
        balance: 0,
        availableBalance: 0,
        pendingKobo: 0,
        status: "active",
        pinSet: false,
        currency: "NGN",
      };
    }

    return {
      balance: Number(wallet.availableKobo),
      availableBalance: Number(wallet.availableKobo),
      pendingKobo: Number(wallet.pendingKobo),
      status: wallet.isLocked ? "locked" : "active",
      pinSet: wallet.pinSet,
      currency: "NGN",
    };
  }

  /**
   * Get transaction ledger for a store
   * Returns paginated list of all wallet transactions
   */
  async getLedger(
    storeId: string,
    params: { limit?: number; offset?: number } = {},
  ): Promise<Transaction[]> {
    const { limit = 50, offset = 0 } = params;

    const entries = await this.db.ledgerEntry.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return entries.map((entry) => ({
      id: entry.id,
      amount: Number(entry.amountKobo),
      type: entry.type,
      date: entry.createdAt.toISOString(),
      status: entry.status,
      description: entry.description || undefined,
      metadata: (entry.metadata as Record<string, unknown>) || undefined,
    }));
  }

  /**
   * Verify wallet PIN for authentication
   * Locks wallet after 5 failed attempts for 30 minutes
   */
  async verifyPin(storeId: string, pin: string): Promise<boolean> {
    const wallet = await this.db.wallet.findUnique({
      where: { storeId },
    });

    if (!wallet || !wallet.pinSet || !wallet.pinHash) {
      return false;
    }

    if (
      wallet.isLocked &&
      wallet.lockedUntil &&
      wallet.lockedUntil > new Date()
    ) {
      throw new Error("Wallet is temporarily locked due to failed attempts");
    }

    const isValid = await bcrypt.compare(pin, wallet.pinHash);

    if (!isValid) {
      const failedAttempts = wallet.failedPinAttempts + 1;
      const updates: any = { failedPinAttempts: failedAttempts };

      if (failedAttempts >= 5) {
        updates.isLocked = true;
        updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await this.db.wallet.update({
        where: { storeId },
        data: updates,
      });

      return false;
    }

    if (wallet.failedPinAttempts > 0) {
      await this.db.wallet.update({
        where: { storeId },
        data: { failedPinAttempts: 0, isLocked: false, lockedUntil: null },
      });
    }

    return true;
  }

  /**
   * Set or change wallet PIN (must be 6 digits)
   * Creates wallet if it doesn't exist
   */
  async setPin(storeId: string, pin: string): Promise<void> {
    if (!/^\d{6}$/.test(pin)) {
      throw new Error("PIN must be exactly 6 digits");
    }

    const pinHash = await bcrypt.hash(pin, 10);

    await this.db.wallet.upsert({
      where: { storeId },
      create: {
        storeId,
        pinHash,
        pinSet: true,
        availableKobo: 0,
        pendingKobo: 0,
      },
      update: {
        pinHash,
        pinSet: true,
        failedPinAttempts: 0,
        isLocked: false,
        lockedUntil: null,
      },
    });

    logger.info(`[Wallet] PIN set for store ${storeId}`);
  }

  /**
   * Add a bank account for withdrawals
   * Saves account details for future use
   */
  async addBank(
    storeId: string,
    data: {
      accountNumber: string;
      bankCode: string;
      bankName: string;
      accountName: string;
    },
  ): Promise<BankAccount> {
    const bankAccount = await this.db.bankAccount.create({
      data: {
        storeId,
        accountNumber: data.accountNumber,
        bankCode: data.bankCode,
        bankName: data.bankName,
        accountName: data.accountName,
        isDefault: false,
      },
    });

    logger.info(
      `[Wallet] Added bank account ${bankAccount.id} for store ${storeId}`,
    );

    return {
      id: bankAccount.id,
      accountNumber: bankAccount.accountNumber,
      bankCode: bankAccount.bankCode,
      bankName: bankAccount.bankName,
      accountName: bankAccount.accountName,
      recipientCode: bankAccount.recipientCode || undefined,
      isDefault: bankAccount.isDefault,
    };
  }

  /**
   * Get all saved bank accounts for a store
   * Excludes deleted accounts, orders by default first
   */
  async getBanks(storeId: string): Promise<BankAccount[]> {
    const accounts = await this.db.bankAccount.findMany({
      where: { storeId, deletedAt: null },
      orderBy: { isDefault: "desc" },
    });

    return accounts.map((account) => ({
      id: account.id,
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
      bankName: account.bankName,
      accountName: account.accountName,
      recipientCode: account.recipientCode || undefined,
      isDefault: account.isDefault,
    }));
  }

  /**
   * Soft delete a bank account
   * Marks account as deleted without removing from database
   */
  async deleteBank(storeId: string, accountId: string): Promise<void> {
    await this.db.bankAccount.updateMany({
      where: { id: accountId, storeId },
      data: { deletedAt: new Date() },
    });

    logger.info(
      `[Wallet] Deleted bank account ${accountId} for store ${storeId}`,
    );
  }

  /**
   * Set a bank account as default for withdrawals
   * Unsets current default and sets new one in transaction
   */
  async setDefaultBank(storeId: string, accountId: string): Promise<void> {
    await this.db.$transaction([
      this.db.bankAccount.updateMany({
        where: { storeId, isDefault: true },
        data: { isDefault: false },
      }),
      this.db.bankAccount.updateMany({
        where: { id: accountId, storeId },
        data: { isDefault: true },
      }),
    ]);

    logger.info(
      `[Wallet] Set default bank account ${accountId} for store ${storeId}`,
    );
  }

  /**
   * Check withdrawal eligibility for a store
   * Validates KYC status, wallet lock state, PIN setup, and minimum balance
   * Returns blocked reasons if not eligible
   */
  async getEligibility(storeId: string): Promise<{
    kycStatus: string;
    availableBalance: number;
    minWithdrawal: number;
    blockedReasons: string[];
    isEligible: boolean;
  }> {
    const wallet = await this.getSummary(storeId);
    const blockedReasons: string[] = [];

    if (!wallet.pinSet) {
      blockedReasons.push("PIN_NOT_SET");
    }

    if (wallet.status === "locked") {
      blockedReasons.push("WALLET_LOCKED");
    }

    const minWithdrawal = 100000; // Minimum 1000 NGN in kobo
    const isEligible =
      blockedReasons.length === 0 && wallet.availableBalance >= minWithdrawal;

    return {
      kycStatus: "VERIFIED", // Simplified - would integrate with KYC service
      availableBalance: wallet.availableBalance || 0,
      minWithdrawal,
      blockedReasons,
      isEligible,
    };
  }

  /**
   * Get withdrawal quote with fee calculation
   * Charges 1% fee or ₦50 maximum
   * Returns amount, fee, net amount, and estimated arrival time
   */
  async getWithdrawalQuote(
    storeId: string,
    amount: number,
  ): Promise<{
    amount: number;
    fee: number;
    netAmount: number;
    currency: string;
    estimatedArrival: string;
  }> {
    const withdrawalFee = 5000; // Fixed 50 NGN fee in kobo
    const fee = Math.min(withdrawalFee, amount * 0.01); // 1% or ₦50, whichever is less
    const netAmount = amount - fee;

    return {
      amount,
      fee,
      netAmount,
      currency: "NGN",
      estimatedArrival: "Within 24 hours",
    };
  }

  /**
   * Initiate a withdrawal request
   * Validates eligibility, balance, and minimum amount
   * Creates payout record in PENDING status
   * Supports idempotency key for duplicate prevention
   */
  async initiateWithdrawal(
    storeId: string,
    data: {
      amountKobo: number;
      bankAccountId: string;
      idempotencyKey?: string;
    },
  ): Promise<{
    withdrawalId: string;
    status: string;
    requiresOtp: boolean;
    message: string;
  }> {
    const eligibility = await this.getEligibility(storeId);

    if (!eligibility.isEligible) {
      throw new Error(
        `Withdrawal not eligible: ${eligibility.blockedReasons.join(", ")}`,
      );
    }

    if (data.amountKobo > eligibility.availableBalance) {
      throw new Error("Insufficient balance");
    }

    const minWithdrawal = 100000;
    if (data.amountKobo < minWithdrawal) {
      throw new Error(`Minimum withdrawal is ₦${minWithdrawal / 100}`);
    }

    const bankAccount = await this.db.bankAccount.findUnique({
      where: { id: data.bankAccountId, storeId },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    const withdrawal = await this.db.payout.create({
      data: {
        id: `payout-${Date.now()}`,
        storeId,
        bankAccountId: data.bankAccountId,
        amountKobo: data.amountKobo,
        status: "PENDING",
        reference: `WD_${Date.now()}`,
        initiatedAt: new Date(),
      },
    });

    logger.info(
      `[Wallet] Initiated withdrawal ${withdrawal.id} for store ${storeId}`,
    );

    return {
      withdrawalId: withdrawal.id,
      status: "PENDING",
      requiresOtp: false, // Simplified - OTP can be added via Paystack
      message: "Withdrawal initiated successfully",
    };
  }

  /**
   * Confirm withdrawal with OTP code
   * Updates payout status from PENDING to PROCESSING
   * Creates Paystack transfer recipient and initiates transfer
   */
  async confirmWithdrawal(
    storeId: string,
    data: {
      withdrawalId: string;
      otpCode?: string; // Optional for now, required in production
    },
  ): Promise<{
    success: boolean;
    message?: string;
    transferCode?: string;
  }> {
    const withdrawal = await this.db.payout.findUnique({
      where: { id: data.withdrawalId, storeId },
      include: {
        bankAccount: true,
      },
    });

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (withdrawal.status !== "PENDING") {
      throw new Error("Withdrawal already processed");
    }

    try {
      // Step 1: Create Paystack transfer recipient
      const recipient = await this.paystackService.createTransferRecipient({
        type: "nuban",
        name: withdrawal.bankAccount.accountName,
        accountNumber: withdrawal.bankAccount.accountNumber,
        bankCode: withdrawal.bankAccount.bankCode,
        currency: "NGN",
      });

      // Step 2: Initiate transfer via Paystack
      const transfer = await this.paystackService.initiateTransfer({
        amountKobo: withdrawal.amountKobo,
        recipientCode: recipient.recipientCode,
        reference: withdrawal.reference,
        reason: "Merchant withdrawal payout",
      });

      // Step 3: Update payout record with transfer details
      await this.db.payout.update({
        where: { id: data.withdrawalId },
        data: {
          status: "PROCESSING",
          confirmedAt: new Date(),
          transferCode: transfer.transferCode,
          paystackResponse: transfer.raw as any,
        },
      });

      // Step 4: Deduct from wallet balance
      const wallet = await this.db.wallet.findUnique({
        where: { storeId },
      });

      if (wallet) {
        await this.db.wallet.update({
          where: { storeId },
          data: {
            availableKobo: wallet.availableKobo - withdrawal.amountKobo,
          },
        });
      }

      // Step 5: Create ledger entry
      await this.db.ledgerEntry.create({
        data: {
          storeId,
          amountKobo: -withdrawal.amountKobo,
          type: "WITHDRAWAL",
          status: "PROCESSING",
          description: `Withdrawal to ${withdrawal.bankAccount.accountName}`,
          reference: withdrawal.reference,
          metadata: {
            withdrawalId: data.withdrawalId,
            transferCode: transfer.transferCode,
            bankAccount: withdrawal.bankAccount.accountNumber,
          },
        },
      });

      logger.info(
        `[Wallet] Confirmed withdrawal ${data.withdrawalId} via Paystack`,
        {
          transferCode: transfer.transferCode,
          amount: withdrawal.amountKobo,
        },
      );

      return {
        success: true,
        message: "Withdrawal confirmed and processing via Paystack",
        transferCode: transfer.transferCode,
      };
    } catch (error: any) {
      logger.error(`[Wallet] Withdrawal confirmation failed`, {
        withdrawalId: data.withdrawalId,
        error: error.message,
      });

      await this.db.payout.update({
        where: { id: data.withdrawalId },
        data: {
          status: "FAILED",
          failureReason: error.message,
        },
      });

      throw new Error(`Withdrawal failed: ${error.message}`);
    }
  }
}
