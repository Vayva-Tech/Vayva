import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class LedgerService {
  constructor(private readonly db = prisma) {}

  async getJournalEntries(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const account = filters.account;

    const where: any = {
      storeId,
      referenceType: 'manual',
      ...(account && { account }),
    };

    const entries = await this.db.ledgerEntry.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });

    return entries.map((e) => ({
      ...e,
      amount: Number(e.amount),
    }));
  }

  async createJournalEntry(
    storeId: string,
    userId: string,
    entryData: any
  ) {
    const {
      referenceId,
      direction,
      account,
      amount,
      currency = 'NGN',
      description,
      occurredAt,
      metadata,
    } = entryData;

    // Validate required fields
    if (!referenceId || !direction || !account || !amount) {
      throw new Error('Missing required fields: referenceId, direction, account, amount');
    }

    // Validate direction
    if (!['debit', 'credit'].includes(direction)) {
      throw new Error('Direction must be debit or credit');
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Create the ledger entry with audit metadata
    const entry = await this.db.ledgerEntry.create({
      data: {
        id: `le-${Date.now()}`,
        storeId,
        referenceType: 'manual',
        referenceId,
        direction,
        account,
        amount: BigInt(Math.round(amount * 100)),
        currency,
        description: description || `Manual journal entry - ${referenceId}`,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        metadata: {
          ...metadata,
          createdBy: userId,
          source: 'manual_journal_entry',
          createdAt: new Date().toISOString(),
        },
      },
    });

    // Create audit log
    await this.db.auditLog.create({
      data: {
        app: 'merchant',
        action: 'MANUAL_LEDGER_ENTRY_CREATED',
        targetType: 'system',
        targetId: entry.id,
        targetStoreId: storeId,
        actorUserId: userId,
        severity: 'HIGH',
        requestId: `manual-${storeId}-${Date.now()}`,
        metadata: {
          entryId: entry.id,
          account,
          direction,
          amount,
          referenceId,
          description,
        },
      },
    });

    logger.info(`[Ledger] Created journal entry ${entry.id}`);
    return entry;
  }
}
