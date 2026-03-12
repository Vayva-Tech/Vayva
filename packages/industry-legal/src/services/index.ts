/**
 * @vayva/industry-legal - Service Layer
 * 
 * Business logic and operations for Legal & Law Firm Platform
 * Phase 3: Class-based service wrappers
 */

// Export class-based services
export { MatterManagementService } from './matter-management.service.js';
export type { MatterData } from './matter-management.service.js';

export { DocumentAutomationService } from './document-automation.service.js';
export type { DocumentTemplate, DocumentAssemblyData } from './document-automation.service.js';

export { DeadlineCalendarService } from './deadline-calendar.service.js';
export type { DeadlineData, CourtRule } from './deadline-calendar.service.js';

export { ConflictCheckService } from './conflict-check.service.js';
export type { ConflictCheckData, ConflictSearchResult } from './conflict-check.service.js';

export { TrustAccountingService } from './trust-accounting.service.js';
export type { TrustTransactionData } from './trust-accounting.service.js';

export { BillingInvoicingService } from './billing-invoicing.service.js';
export type { TimeEntryData, InvoiceData } from './billing-invoicing.service.js';

// Phase 4: AI-Powered Services
export { ContractAnalysisService } from './contract-analysis.service.js';
export type { ContractAnalysisInput } from './contract-analysis.service.js';

export { LegalResearchService } from './legal-research.service.js';
export type { LegalResearchInput } from './legal-research.service.js';

export { DocumentAutomationService as AIDocumentAutomationService } from './document-automation.service.js';
export type { DocumentGenerationInput } from './document-automation.service.js';

// ============================================================================
// CASE MANAGEMENT SERVICES
// ============================================================================

export async function getCasesByPracticeArea(storeId: string) {
  const cases = await prisma.case.findMany({
    where: { storeId, status: 'active' },
    include: {
      practiceArea: true,
    },
  });

  const grouped = cases.reduce((acc, caseItem) => {
    const pa = caseItem.practiceArea;
    if (!acc[pa.code]) {
      acc[pa.code] = {
        practiceArea: pa.name,
        code: pa.code,
        count: 0,
        totalValue: 0,
      };
    }
    acc[pa.code].count++;
    if (caseItem.actualValue) {
      acc[pa.code].totalValue += caseItem.actualValue;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).map((item: any) => ({
    ...item,
    percentage: Math.round((item.count / cases.length) * 100),
    avgValue: item.count > 0 ? item.totalValue / item.count : 0,
  }));
}

export async function updateCaseStage(caseId: string, stage: string) {
  return prisma.case.update({
    where: { id: caseId },
    data: { stage },
  });
}

export async function closeCase(caseId: string, reason?: string) {
  return prisma.case.update({
    where: { id: caseId },
    data: {
      status: 'closed',
      closedDate: new Date(),
      closedReason: reason,
    },
  });
}

export async function getPendingConflictsChecks(storeId: string) {
  return prisma.conflictCheck.findMany({
    where: { storeId, status: 'pending' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function runConflictsCheck(data: {
  storeId: string;
  prospectiveClientName: string;
  matterDescription: string;
  partiesChecked: string[];
  checkedBy: string;
}) {
  // Search existing matters for conflicts
  const existingCases = await prisma.case.findMany({
    where: {
      storeId: data.storeId,
      OR: [
        { clientNames: { hasSome: data.partiesChecked } },
        { opposingParties: { path: ['name'], string_contains: data.partiesChecked[0] } },
      ],
    },
  });

  const conflictsFound = existingCases.length > 0;

  return prisma.conflictCheck.create({
    data: {
      ...data,
      conflictsFound,
      conflictDetails: conflictsFound
        ? `Found ${existingCases.length} potential conflicts in existing matters`
        : null,
      status: conflictsFound ? 'blocked' : 'cleared',
      clearedDate: conflictsFound ? null : new Date(),
    },
  });
}

export async function clearConflictsCheck(id: string, clearedBy: string, waiverReason?: string) {
  return prisma.conflictCheck.update({
    where: { id },
    data: {
      status: 'cleared',
      clearedBy,
      clearedDate: new Date(),
      waiverReason,
    },
  });
}

export async function getCaseWinRate(storeId: string, practiceAreaId?: string) {
  const where: any = {
    storeId,
    winLoss: { not: null },
  };

  if (practiceAreaId) {
    where.practiceAreaId = practiceAreaId;
  }

  const cases = await prisma.case.findMany({
    where,
    select: { winLoss: true },
  });

  const won = cases.filter((c) => c.winLoss === 'won').length;
  const settled = cases.filter((c) => c.winLoss === 'settled').length;
  const lost = cases.filter((c) => c.winLoss === 'lost').length;
  const total = won + settled + lost;

  return {
    winRate: total > 0 ? ((won + settled) / total) * 100 : 0,
    won,
    settled,
    lost,
    total,
  };
}

// ============================================================================
// TIME & BILLING SERVICES
// ============================================================================

export async function getMonthlyBillingSummary(storeId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      case: { storeId },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      case: true,
    },
  });

  const billed = timeEntries
    .filter((t) => t.status === 'invoiced')
    .reduce((sum, t) => sum + t.amount, 0);

  const wip = timeEntries
    .filter((t) => t.status === 'approved' || t.status === 'submitted')
    .reduce((sum, t) => sum + t.amount, 0);

  const writeOffs = await prisma.writeOff.aggregate({
    where: {
      case: { storeId },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: { amount: true },
  });

  return {
    billed,
    wip,
    writeOffs: writeOffs._sum.amount || 0,
    totalHours: timeEntries.reduce((sum, t) => sum + t.duration, 0),
    entryCount: timeEntries.length,
  };
}

export async function getWIP(storeId: string) {
  const entries = await prisma.timeEntry.findMany({
    where: {
      case: { storeId },
      status: { in: ['submitted', 'approved'] },
    },
    include: {
      case: {
        select: {
          caseNumber: true,
          clientNames: true,
        },
      },
    },
  });

  return {
    total: entries.reduce((sum, t) => sum + t.amount, 0),
    hours: entries.reduce((sum, t) => sum + t.duration, 0),
    entries,
  };
}

export async function approveWriteOff(id: string, approvedBy: string) {
  const writeOff = await prisma.writeOff.update({
    where: { id },
    data: {
      status: 'approved',
      approvedBy,
      approvedDate: new Date(),
    },
  });

  // Update time entry status
  if (writeOff.timeEntryId) {
    await prisma.timeEntry.update({
      where: { id: writeOff.timeEntryId },
      data: { status: 'written_off' },
    });
  }

  return writeOff;
}

export async function rejectWriteOff(id: string, reason: string) {
  return prisma.writeOff.update({
    where: { id },
    data: {
      status: 'rejected',
      rejectionReason: reason,
    },
  });
}

export async function calculateRealizationRate(storeId: string, periodMonths: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - periodMonths);

  const entries = await prisma.timeEntry.findMany({
    where: {
      case: { storeId },
      date: { gte: startDate },
      category: 'billable',
    },
  });

  const totalWorked = entries.reduce((sum, t) => sum + t.amount, 0);
  const totalBilled = entries
    .filter((t) => t.status === 'invoiced')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    realizationRate: totalWorked > 0 ? (totalBilled / totalWorked) * 100 : 0,
    totalWorked,
    totalBilled,
  };
}

export async function calculateCollectionRate(storeId: string, periodMonths: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - periodMonths);

  const cases = await prisma.case.findMany({
    where: { storeId },
    select: { amountBilled: true, amountCollected: true },
  });

  const totalBilled = cases.reduce((sum, c) => sum + c.amountBilled, 0);
  const totalCollected = cases.reduce((sum, c) => sum + c.amountCollected, 0);

  return {
    collectionRate: totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0,
    totalBilled,
    totalCollected,
  };
}

// ============================================================================
// TRUST ACCOUNTING SERVICES
// ============================================================================

export async function getTrustAccounts(storeId: string) {
  return prisma.trustAccount.findMany({
    where: { storeId, isActive: true },
    include: {
      clientLedgers: {
        where: { balance: { gt: 0 } },
      },
    },
  });
}

export async function getTrustAccountBalance(accountId: string) {
  const account = await prisma.trustAccount.findUnique({
    where: { id: accountId },
    select: {
      currentBalance: true,
      ledgerBalance: true,
      reconciliationStatus: true,
    },
  });

  return account;
}

export async function getClientLedger(clientId: string) {
  return prisma.clientLedger.findMany({
    where: { clientId },
    include: {
      transactions: {
        orderBy: { transactionDate: 'desc' },
      },
    },
  });
}

export async function recordTrustReceipt(data: {
  accountId: string;
  clientId: string;
  caseId: string;
  amount: number;
  description: string;
  checkNumber?: string;
  referenceNumber?: string;
  processedBy: string;
}) {
  const account = await prisma.trustAccount.findUnique({
    where: { id: data.accountId },
  });

  if (!account) {
    throw new Error('Trust account not found');
  }

  // Create transaction
  const transaction = await prisma.trustTransaction.create({
    data: {
      ...data,
      type: 'deposit',
      balance: account.currentBalance + data.amount,
      status: 'completed',
    },
  });

  // Update account balance
  await prisma.trustAccount.update({
    where: { id: data.accountId },
    data: { currentBalance: transaction.balance },
  });

  // Update/create client ledger
  const ledger = await prisma.clientLedger.upsert({
    where: {
      accountId_clientId: {
        accountId: data.accountId,
        clientId: data.clientId,
      },
    },
    update: {
      balance: { increment: data.amount },
      totalDeposits: { increment: data.amount },
      lastActivity: new Date(),
    },
    create: {
      accountId: data.accountId,
      clientId: data.clientId,
      caseId: data.caseId,
      caseNumber: '',
      clientName: '',
      balance: data.amount,
      totalDeposits: data.amount,
      totalDisbursements: 0,
      totalTransfers: 0,
      lastActivity: new Date(),
    },
  });

  return { transaction, ledger };
}

export async function recordTrustDisbursement(data: {
  accountId: string;
  clientId: string;
  caseId: string;
  amount: number;
  description: string;
  payee: string;
  checkNumber?: string;
  processedBy: string;
  approvedBy: string;
}) {
  const account = await prisma.trustAccount.findUnique({
    where: { id: data.accountId },
  });

  const ledger = await prisma.clientLedger.findFirst({
    where: {
      accountId: data.accountId,
      clientId: data.clientId,
    },
  });

  if (!ledger || ledger.balance < data.amount) {
    throw new Error('Insufficient trust balance');
  }

  const newBalance = account!.currentBalance - data.amount;

  const transaction = await prisma.trustTransaction.create({
    data: {
      ...data,
      type: 'disbursement',
      balance: newBalance,
      status: 'pending',
    },
  });

  await prisma.trustAccount.update({
    where: { id: data.accountId },
    data: { currentBalance: newBalance },
  });

  await prisma.clientLedger.update({
    where: { id: ledger.id },
    data: {
      balance: { decrement: data.amount },
      totalDisbursements: { increment: data.amount },
      lastActivity: new Date(),
      alerts: ledger.balance - data.amount < 0 ? ['negative_balance'] : [],
    },
  });

  return transaction;
}

export async function transferTrustToOperating(data: {
  accountId: string;
  clientId: string;
  caseId: string;
  amount: number;
  description: string;
  processedBy: string;
}) {
  return recordTrustDisbursement({
    ...data,
    type: 'transfer_to_operating' as any,
    payee: 'Operating Account',
    approvedBy: data.processedBy,
  });
}

export async function generateThreeWayReconciliation(accountId: string) {
  const account = await prisma.trustAccount.findUnique({
    where: { id: accountId },
    include: {
      clientLedgers: true,
      transactions: {
        where: {
          transactionDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      },
    },
  });

  if (!account) {
    throw new Error('Trust account not found');
  }

  const totalLedgerBalances = account.clientLedgers.reduce(
    (sum, ledger) => sum + ledger.balance,
    0
  );

  const cashBalance = account.currentBalance;

  const discrepancy = cashBalance - totalLedgerBalances;

  return {
    accountId: account.id,
    accountName: account.name,
    cashBalance,
    totalLedgerBalances,
    discrepancy,
    isReconciled: Math.abs(discrepancy) < 0.01,
    clientLedgers: account.clientLedgers.map((l) => ({
      clientName: l.clientName,
      caseNumber: l.caseNumber,
      balance: l.balance,
    })),
    reconciledAt: new Date(),
  };
}

export async function getNegativeBalanceAlerts(storeId: string) {
  const ledgers = await prisma.clientLedger.findMany({
    where: {
      account: { storeId },
      balance: { lt: 0 },
    },
    include: {
      account: true,
    },
  });

  return ledgers.map((l) => ({
    clientId: l.clientId,
    clientName: l.clientName,
    caseNumber: l.caseNumber,
    balance: l.balance,
    accountId: l.accountId,
    accountName: l.account.name,
  }));
}

// ============================================================================
// DEADLINE CALCULATION SERVICE
// ============================================================================

export function calculateBusinessDays(
  startDate: Date,
  days: number,
  excludeHolidays: boolean = true,
  holidays?: Date[]
): Date {
  const result = new Date(startDate);
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);

    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Not weekend
      if (!excludeHolidays || !holidays?.some((h) => h.toDateString() === result.toDateString())) {
        added++;
      }
    }
  }

  return result;
}

export function calculateCourtDeadline(
  hearingDate: Date,
  daysBefore: number,
  courtRules: { excludeWeekends: boolean; excludeHolidays: boolean; holidays?: Date[] }
): Date {
  if (courtRules.excludeWeekends) {
    return calculateBusinessDays(hearingDate, -daysBefore, courtRules.excludeHolidays, courtRules.holidays);
  }

  const result = new Date(hearingDate);
  result.setDate(result.getDate() - daysBefore);
  return result;
}
