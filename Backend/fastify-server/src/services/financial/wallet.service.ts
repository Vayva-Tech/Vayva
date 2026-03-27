import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Wallet Service - Backend
 * Manages digital wallets, virtual accounts, and wallet operations
 */
export class WalletService {
  constructor(private readonly db = prisma) {}

  /**
   * Get or create wallet for customer
   */
  async getOrCreateWallet(storeId: string, customerId: string) {
    let wallet = await this.db.wallet.findFirst({
      where: { storeId, customerId },
    });

    if (!wallet) {
      wallet = await this.db.wallet.create({
        data: {
          id: `wallet-${Date.now()}`,
          storeId,
          customerId,
          balance: 0,
          currency: 'NGN',
          status: 'ACTIVE',
        },
      });
    }

    return wallet;
  }

  /**
   * Get wallet by ID
   */
  async getWalletById(walletId: string, storeId: string) {
    return await this.db.wallet.findFirst({
      where: { id: walletId, storeId },
      include: {
        customer: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Credit wallet (add funds)
   */
  async creditWallet(walletId: string, storeId: string, amount: number, metadata?: any) {
    const wallet = await this.getWalletById(walletId, storeId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const transaction = await this.db.walletTransaction.create({
      data: {
        id: `wtx-${Date.now()}`,
        walletId,
        type: 'CREDIT',
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        description: metadata?.description || 'Wallet credit',
        reference: metadata?.reference,
        metadata: metadata || {},
      },
    });

    // Update wallet balance
    await this.db.wallet.update({
      where: { id: walletId },
      data: { balance: wallet.balance + amount },
    });

    logger.info(`[Wallet] Credited ${amount} to wallet ${walletId}`);
    return transaction;
  }

  /**
   * Debit wallet (remove funds)
   */
  async debitWallet(walletId: string, storeId: string, amount: number, metadata?: any) {
    const wallet = await this.getWalletById(walletId, storeId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const transaction = await this.db.walletTransaction.create({
      data: {
        id: `wtx-${Date.now()}`,
        walletId,
        type: 'DEBIT',
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        description: metadata?.description || 'Wallet debit',
        reference: metadata?.reference,
        metadata: metadata || {},
      },
    });

    // Update wallet balance
    await this.db.wallet.update({
      where: { id: walletId },
      data: { balance: wallet.balance - amount },
    });

    logger.info(`[Wallet] Debited ${amount} from wallet ${walletId}`);
    return transaction;
  }

  /**
   * Transfer between wallets
   */
  async transferWallets(
    fromWalletId: string,
    toWalletId: string,
    storeId: string,
    amount: number,
    metadata?: any
  ) {
    // Debit source wallet
    await this.debitWallet(fromWalletId, storeId, amount, {
      ...metadata,
      description: `Transfer to ${toWalletId}`,
    });

    // Credit destination wallet
    await this.creditWallet(toWalletId, storeId, amount, {
      ...metadata,
      description: `Transfer from ${fromWalletId}`,
    });

    logger.info(`[Wallet] Transferred ${amount} from ${fromWalletId} to ${toWalletId}`);
    return { success: true };
  }

  /**
   * Create virtual account for wallet
   */
  async createVirtualAccount(walletId: string, storeId: string) {
    const wallet = await this.getWalletById(walletId, storeId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check if already has virtual account
    const existing = await this.db.virtualAccount.findFirst({
      where: { walletId },
    });

    if (existing) {
      return existing;
    }

    // Generate unique account number
    const accountNumber = this.generateAccountNumber();

    const virtualAccount = await this.db.virtualAccount.create({
      data: {
        id: `va-${Date.now()}`,
        walletId,
        accountNumber,
        accountName: wallet.customer?.firstName + ' ' + wallet.customer?.lastName || 'Wallet Account',
        bankCode: 'VAYVA', // Virtual bank code
        bankName: 'Vayva Wallet',
        status: 'ACTIVE',
      },
    });

    logger.info(`[Wallet] Created virtual account ${accountNumber} for wallet ${walletId}`);
    return virtualAccount;
  }

  /**
   * Get wallet transactions
   */
  async getWalletTransactions(
    walletId: string,
    storeId: string,
    filters?: {
      page?: number;
      limit?: number;
      type?: 'CREDIT' | 'DEBIT';
      fromDate?: Date;
      toDate?: Date;
    }
  ) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const where: any = { walletId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const [transactions, total] = await Promise.all([
      this.db.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.walletTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Set wallet PIN
   */
  async setWalletPin(walletId: string, storeId: string, pinHash: string) {
    const wallet = await this.getWalletById(walletId, storeId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    await this.db.wallet.update({
      where: { id: walletId },
      data: { pinHash },
    });

    logger.info(`[Wallet] PIN set for wallet ${walletId}`);
    return { success: true };
  }

  /**
   * Verify wallet PIN
   */
  async verifyWalletPin(walletId: string, storeId: string, pinHash: string) {
    const wallet = await this.getWalletById(walletId, storeId);
    
    if (!wallet) {
      return false;
    }

    if (!wallet.pinHash) {
      throw new Error('Wallet PIN not set');
    }

    return wallet.pinHash === pinHash;
  }

  /**
   * Initiate withdrawal from wallet
   */
  async initiateWithdrawal(
    walletId: string,
    storeId: string,
    amount: number,
    withdrawalData: {
      bankCode: string;
      accountNumber: string;
      accountName: string;
    }
  ) {
    const wallet = await this.getWalletById(walletId, storeId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Create withdrawal request
    const withdrawal = await this.db.walletWithdrawal.create({
      data: {
        id: `ww-${Date.now()}`,
        walletId,
        amount,
        status: 'PENDING',
        bankCode: withdrawalData.bankCode,
        accountNumber: withdrawalData.accountNumber,
        accountName: withdrawalData.accountName,
        initiatedAt: new Date(),
      },
    });

    // Reserve the amount (reduce available balance)
    await this.db.wallet.update({
      where: { id: walletId },
      data: { 
        balance: wallet.balance - amount,
        pendingWithdrawals: (wallet.pendingWithdrawals || 0) + amount,
      },
    });

    logger.info(`[Wallet] Withdrawal initiated: ${withdrawal.id} for ${amount}`);
    return withdrawal;
  }

  /**
   * Confirm withdrawal completion
   */
  async confirmWithdrawal(withdrawalId: string, storeId: string) {
    const withdrawal = await this.db.walletWithdrawal.findFirst({
      where: { id: withdrawalId },
      include: { wallet: true },
    });

    if (!withdrawal || withdrawal.wallet.storeId !== storeId) {
      throw new Error('Withdrawal not found');
    }

    await this.db.walletWithdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Clear pending amount
    await this.db.wallet.update({
      where: { id: withdrawal.walletId },
      data: {
        pendingWithdrawals: (withdrawal.wallet.pendingWithdrawals || 0) - withdrawal.amount,
      },
    });

    logger.info(`[Wallet] Withdrawal confirmed: ${withdrawalId}`);
    return { success: true };
  }

  /**
   * Generate unique account number
   */
  private generateAccountNumber(): string {
    // Generate 10-digit account number
    const prefix = '10'; // Start with 10
    const randomPart = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return prefix + randomPart;
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(storeId: string) {
    const [totalWallets, activeWallets, totalBalance, totalCredit, totalDebit] = await Promise.all([
      this.db.wallet.count({
        where: { storeId },
      }),
      this.db.wallet.count({
        where: { storeId, status: 'ACTIVE' },
      }),
      this.db.wallet.aggregate({
        where: { storeId },
        _sum: { balance: true },
      }),
      this.db.walletTransaction.aggregate({
        where: { wallet: { storeId }, type: 'CREDIT' },
        _sum: { amount: true },
      }),
      this.db.walletTransaction.aggregate({
        where: { wallet: { storeId }, type: 'DEBIT' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalWallets,
      activeWallets,
      totalBalance: totalBalance._sum.balance || 0,
      totalCredit: totalCredit._sum.amount || 0,
      totalDebit: totalDebit._sum.amount || 0,
      netFlow: (totalCredit._sum.amount || 0) - (totalDebit._sum.amount || 0),
    };
  }
}
