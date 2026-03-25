import { PrismaClient } from "@prisma/client";
import { PaystackService } from "@vayva/payments";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export interface WalletSummary {
  balance: number;
  status: string;
  pinSet: boolean;
  currency: string;
  availableBalance?: number;
  pendingKobo: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  status: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  recipientCode?: string;
  isDefault: boolean;
}

export interface WithdrawalRequest {
  id: string;
  amountKobo: number;
  status: "pending" | "processing" | "completed" | "failed";
  bankAccountId: string;
  reference: string;
  transferCode?: string;
  createdAt: Date;
  completedAt?: Date;
}

// PIN Management
async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

async function verifyPinHash(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

// Wallet Service Implementation
export const WalletService = {
  // Get wallet summary for a store
  getSummary: async (storeId: string): Promise<WalletSummary> => {
    const wallet = await prisma.wallet.findUnique({
      where: { storeId },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      const _newWallet = await prisma.wallet.create({
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
  },

  // Get transaction ledger
  getLedger: async (storeId: string, params: { limit?: number; offset?: number } = {}): Promise<Transaction[]> => {
    const { limit = 50, offset = 0 } = params;

    const entries = await prisma.ledgerEntry.findMany({
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
  },

  // Verify PIN
  verifyPin: async (storeId: string, pin: string): Promise<boolean> => {
    const wallet = await prisma.wallet.findUnique({
      where: { storeId },
    });

    if (!wallet || !wallet.pinSet || !wallet.pinHash) {
      return false;
    }

    // Check if wallet is locked
    if (wallet.isLocked && wallet.lockedUntil && wallet.lockedUntil > new Date()) {
      throw new Error("Wallet is temporarily locked due to failed attempts. Please try again later.");
    }

    const isValid = await verifyPinHash(pin, wallet.pinHash);

    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = wallet.failedPinAttempts + 1;
      const updates: { failedPinAttempts: number; isLocked?: boolean; lockedUntil?: Date } = {
        failedPinAttempts: failedAttempts,
      };

      // Lock wallet after 5 failed attempts for 30 minutes
      if (failedAttempts >= 5) {
        updates.isLocked = true;
        updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await prisma.wallet.update({
        where: { storeId },
        data: updates,
      });

      return false;
    }

    // Reset failed attempts on successful verification
    if (wallet.failedPinAttempts > 0) {
      await prisma.wallet.update({
        where: { storeId },
        data: { failedPinAttempts: 0, isLocked: false, lockedUntil: null },
      });
    }

    return true;
  },

  // Set/change PIN
  setPin: async (storeId: string, pin: string): Promise<void> => {
    // Validate PIN (6 digits)
    if (!/^\d{6}$/.test(pin)) {
      throw new Error("PIN must be exactly 6 digits");
    }

    const pinHash = await hashPin(pin);

    await prisma.wallet.upsert({
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
  },

  // Add bank account
  addBank: async (
    storeId: string,
    data: {
      accountNumber: string;
      bankCode: string;
      bankName: string;
      accountName: string;
    }
  ): Promise<BankAccount> => {
    // Create transfer recipient on Paystack
    const recipientResult = await PaystackService.createTransferRecipient({
      type: "nuban",
      name: data.accountName,
      accountNumber: data.accountNumber,
      bankCode: data.bankCode,
    });

    // Save bank account with recipient code
    const bankAccount = await prisma.bankAccount.create({
      data: {
        storeId,
        accountNumber: data.accountNumber,
        bankCode: data.bankCode,
        bankName: data.bankName,
        accountName: data.accountName,
        recipientCode: recipientResult.recipientCode,
        isDefault: false,
      },
    });

    return {
      id: bankAccount.id,
      accountNumber: bankAccount.accountNumber,
      bankCode: bankAccount.bankCode,
      bankName: bankAccount.bankName,
      accountName: bankAccount.accountName,
      recipientCode: bankAccount.recipientCode || undefined,
      isDefault: bankAccount.isDefault,
    };
  },

  // Get bank accounts
  getBanks: async (storeId: string): Promise<BankAccount[]> => {
    const accounts = await prisma.bankAccount.findMany({
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
  },

  // Delete bank account
  deleteBank: async (storeId: string, accountId: string): Promise<void> => {
    await prisma.bankAccount.updateMany({
      where: { id: accountId, storeId },
      data: { deletedAt: new Date() },
    });
  },

  // Set default bank account
  setDefaultBank: async (storeId: string, accountId: string): Promise<void> => {
    await prisma.$transaction([
      // Unset current default
      prisma.bankAccount.updateMany({
        where: { storeId, isDefault: true },
        data: { isDefault: false },
      }),
      // Set new default
      prisma.bankAccount.updateMany({
        where: { id: accountId, storeId },
        data: { isDefault: true },
      }),
    ]);
  },

  // Initiate withdrawal
  initiateWithdrawal: async (
    storeId: string,
    data: {
      amountKobo: number;
      pin: string;
      bankAccountId: string;
    }
  ): Promise<{ withdrawalId: string; requiresOtp: boolean; message: string }> => {
    // Verify PIN
    const pinValid = await WalletService.verifyPin(storeId, data.pin);
    if (!pinValid) {
      throw new Error("Invalid PIN");
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { storeId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Check balance
    if (wallet.availableKobo < BigInt(data.amountKobo)) {
      throw new Error("Insufficient balance");
    }

    // Get bank account
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: data.bankAccountId, storeId, deletedAt: null },
    });

    if (!bankAccount) {
      throw new Error("Bank account not found");
    }

    if (!bankAccount.recipientCode) {
      throw new Error("Bank account not verified with payment provider");
    }

    // Generate unique reference
    const reference = `WDR_${storeId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Reserve funds by moving to pending
    await prisma.wallet.update({
      where: { storeId },
      data: {
        availableKobo: wallet.availableKobo - BigInt(data.amountKobo),
        pendingKobo: wallet.pendingKobo + BigInt(data.amountKobo),
      },
    });

    // Create withdrawal record
    const withdrawal = await prisma.withdrawal.create({
      data: {
        storeId,
        amountKobo: BigInt(data.amountKobo),
        status: "pending",
        bankAccountId: bankAccount.id,
        reference,
        recipientCode: bankAccount.recipientCode,
      },
    });

    // Create ledger entry
    await prisma.ledgerEntry.create({
      data: {
        storeId,
        type: "withdrawal_pending",
        amountKobo: -BigInt(data.amountKobo),
        status: "pending",
        withdrawalId: withdrawal.id,
        description: `Withdrawal initiated to ${bankAccount.bankName} - ${bankAccount.accountNumber}`,
        metadata: {
          bankName: bankAccount.bankName,
          accountNumber: bankAccount.accountNumber,
          reference,
        },
      },
    });

    return {
      withdrawalId: withdrawal.id,
      requiresOtp: true,
      message: "Withdrawal initiated. Please confirm with OTP sent to your registered phone/email.",
    };
  },

  // Confirm withdrawal with OTP
  confirmWithdrawal: async (
    storeId: string,
    withdrawalId: string,
    otpCode: string
  ): Promise<{ success: boolean; message: string }> => {
    // Get withdrawal
    const withdrawal = await prisma.withdrawal.findFirst({
      where: { id: withdrawalId, storeId },
      include: { bankAccount: true },
    });

    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    if (withdrawal.status !== "pending") {
      throw new Error(`Withdrawal is already ${withdrawal.status}`);
    }

    try {
      // Initiate transfer on Paystack
      const transferResult = await PaystackService.initiateTransfer({
        amountKobo: Number(withdrawal.amountKobo),
        recipientCode: withdrawal.recipientCode,
        reference: withdrawal.reference,
        reason: `Merchant withdrawal - ${withdrawal.bankAccount?.bankName}`,
      });

      // Check if transfer requires OTP (Paystack sometimes requires this for large amounts)
      if (transferResult.status === "otp" || transferResult.transferCode) {
        // Try to finalize with provided OTP
        try {
          const finalizedResult = await PaystackService.finalizeTransfer(
            transferResult.transferCode,
            otpCode
          );

          // Update withdrawal record
          await prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: {
              status: "completed",
              transferCode: finalizedResult.transferCode,
              completedAt: new Date(),
              paystackReference: finalizedResult.reference,
            },
          });

          // Update ledger entry
          await prisma.ledgerEntry.updateMany({
            where: { withdrawalId },
            data: {
              status: "completed",
              type: "withdrawal",
            },
          });

          // Move from pending to actual deduction (funds already moved to pending during initiation)
          const wallet = await prisma.wallet.findUnique({
            where: { storeId },
          });

          if (wallet) {
            await prisma.wallet.update({
              where: { storeId },
              data: {
                pendingKobo: wallet.pendingKobo - withdrawal.amountKobo,
              },
            });
          }

          return {
            success: true,
            message: "Withdrawal completed successfully. Funds will be credited to your account shortly.",
          };
        } catch {
          // OTP failed, mark as failed and restore funds
          await handleWithdrawalFailure(storeId, withdrawalId, withdrawal.amountKobo);
          throw new Error("Invalid OTP. Please try again.");
        }
      }

      // Transfer initiated successfully without OTP requirement
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "processing",
          transferCode: transferResult.transferCode,
          paystackReference: transferResult.reference,
        },
      });

      await prisma.ledgerEntry.updateMany({
        where: { withdrawalId },
        data: {
          status: "processing",
        },
      });

      return {
        success: true,
        message: "Withdrawal is being processed. You will be notified once completed.",
      };
    } catch (error) {
      // Restore funds on failure
      await handleWithdrawalFailure(storeId, withdrawalId, withdrawal.amountKobo);
      throw error;
    }
  },

  // Get withdrawal history
  getWithdrawals: async (
    storeId: string,
    params: { limit?: number; offset?: number; status?: string } = {}
  ): Promise<WithdrawalRequest[]> => {
    const { limit = 50, offset = 0, status } = params;

    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { bankAccount: true },
    });

    return withdrawals.map((w) => ({
      id: w.id,
      amountKobo: Number(w.amountKobo),
      status: w.status as WithdrawalRequest["status"],
      bankAccountId: w.bankAccountId,
      reference: w.reference,
      transferCode: w.transferCode || undefined,
      createdAt: w.createdAt,
      completedAt: w.completedAt || undefined,
    }));
  },

  // Credit wallet (for order earnings, refunds, etc.)
  creditWallet: async (
    storeId: string,
    amountKobo: number,
    data: {
      type: string;
      description: string;
      orderId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> => {
    await prisma.$transaction([
      // Update wallet balance
      prisma.wallet.upsert({
        where: { storeId },
        create: {
          storeId,
          availableKobo: BigInt(amountKobo),
          pendingKobo: 0,
        },
        update: {
          availableKobo: { increment: BigInt(amountKobo) },
        },
      }),

      // Create ledger entry
      prisma.ledgerEntry.create({
        data: {
          storeId,
          type: data.type,
          amountKobo: BigInt(amountKobo),
          status: "completed",
          orderId: data.orderId,
          description: data.description,
          metadata: data.metadata || {},
        },
      }),
    ]);
  },

  // Get Paystack balance (for display purposes)
  getPaystackBalance: async (): Promise<{ currency: string; balance: number }> => {
    try {
      const result = await PaystackService.checkBalance();
      return {
        currency: result.currency,
        balance: result.balance,
      };
    } catch (error) {
      console.error("Failed to get Paystack balance:", error);
      return { currency: "NGN", balance: 0 };
    }
  },
};

// Helper function to handle withdrawal failure and restore funds
async function handleWithdrawalFailure(
  storeId: string,
  withdrawalId: string,
  amountKobo: bigint
): Promise<void> {
  await prisma.$transaction([
    // Mark withdrawal as failed
    prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "failed",
        failedAt: new Date(),
      },
    }),

    // Update ledger entry
    prisma.ledgerEntry.updateMany({
      where: { withdrawalId },
      data: {
        status: "failed",
      },
    }),

    // Restore funds to available balance
    prisma.wallet.update({
      where: { storeId },
      data: {
        availableKobo: { increment: amountKobo },
        pendingKobo: { decrement: amountKobo },
      },
    }),
  ]);
}

export default WalletService;
