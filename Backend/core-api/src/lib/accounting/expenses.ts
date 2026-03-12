import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { createLedgerEntry } from "./ledger";

export enum ExpenseCategory {
  RENT = "RENT",
  UTILITIES = "UTILITIES",
  SALARIES = "SALARIES",
  SUPPLIES = "SUPPLIES",
  MARKETING = "MARKETING",
  SOFTWARE = "SOFTWARE",
  PROFESSIONAL_SERVICES = "PROFESSIONAL_SERVICES",
  TRANSPORTATION = "TRANSPORTATION",
  MEALS = "MEALS",
  INSURANCE = "INSURANCE",
  TAXES = "TAXES",
  MAINTENANCE = "MAINTENANCE",
  EQUIPMENT = "EQUIPMENT",
  SUBSCRIPTIONS = "SUBSCRIPTIONS",
  OTHER = "OTHER",
}

export enum ExpenseStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REIMBURSED = "REIMBURSED",
  CANCELLED = "CANCELLED",
}

export interface ExpenseInput {
  storeId: string;
  merchantId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  incurredAt: Date;
  receiptUrl?: string;
  receiptS3Key?: string;
  vendor?: string;
  isReimbursable?: boolean;
  isBillable?: boolean;
  projectCode?: string;
  vatAmount?: number;
  whtAmount?: number;
  tags?: string[];
}

export interface ExpenseWithLedger {
  id: string;
  storeId: string;
  merchantId: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  category: string;
  status: string;
  incurredAt: Date;
  receiptUrl: string | null;
  receiptS3Key: string | null;
  vendor: string | null;
  isReimbursable: boolean;
  isBillable: boolean;
  projectCode: string | null;
  vatAmount: number | null;
  whtAmount: number | null;
  tags: string[];
  ledgerEntryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new expense and optionally create a ledger entry
 */
export async function createExpense(
  input: ExpenseInput,
  options: { createLedgerEntry?: boolean } = {}
): Promise<ExpenseWithLedger> {
  try {
    // Check if Expense model exists in Prisma
    const expense = await (prisma as unknown as { expense: { create: (args: unknown) => Promise<unknown> } }).expense.create({
      data: {
        storeId: input.storeId,
        merchantId: input.merchantId,
        title: input.title,
        description: input.description,
        amount: input.amount,
        currency: input.currency,
        category: input.category,
        status: ExpenseStatus.PENDING,
        incurredAt: input.incurredAt,
        receiptUrl: input.receiptUrl,
        receiptS3Key: input.receiptS3Key,
        vendor: input.vendor,
        isReimbursable: input.isReimbursable ?? false,
        isBillable: input.isBillable ?? false,
        projectCode: input.projectCode,
        vatAmount: input.vatAmount,
        whtAmount: input.whtAmount,
        tags: input.tags || [],
      },
    }) as ExpenseWithLedger;

    // Optionally create ledger entry
    if (options.createLedgerEntry && expense) {
      const ledgerAccount = mapExpenseCategoryToLedgerAccount(input.category);
      
      const ledgerEntry = await createLedgerEntry({
        storeId: input.storeId,
        referenceType: "expense",
        referenceId: expense.id,
        direction: "debit",
        account: ledgerAccount,
        amount: input.amount,
        currency: input.currency,
        description: `Expense: ${input.title}${input.vendor ? ` - ${input.vendor}` : ""}`,
        occurredAt: input.incurredAt,
        metadata: {
          expenseId: expense.id,
          category: input.category,
          vendor: input.vendor,
          receiptUrl: input.receiptUrl,
          vatAmount: input.vatAmount,
          whtAmount: input.whtAmount,
        },
      });

      // Update expense with ledger entry ID
      await (prisma as unknown as { expense: { update: (args: unknown) => Promise<unknown> } }).expense.update({
        where: { id: expense.id },
        data: { ledgerEntryId: ledgerEntry.id },
      });

      expense.ledgerEntryId = ledgerEntry.id;
    }

    return expense;
  } catch (error) {
    logger.error("Failed to create expense", { error, storeId: input.storeId });
    throw error;
  }
}

/**
 * Get expenses for a store with filtering
 */
export async function getExpenses(
  storeId: string,
  filters?: {
    category?: ExpenseCategory;
    status?: ExpenseStatus;
    startDate?: Date;
    endDate?: Date;
    merchantId?: string;
    isReimbursable?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ expenses: ExpenseWithLedger[]; total: number }> {
  try {
    const where = {
      storeId,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.merchantId && { merchantId: filters.merchantId }),
      ...(filters?.isReimbursable !== undefined && { isReimbursable: filters.isReimbursable }),
      ...(filters?.startDate && filters?.endDate && {
        incurredAt: { gte: filters.startDate, lte: filters.endDate },
      }),
    };

    const [expenses, total] = await Promise.all([
      (prisma as unknown as { expense: { findMany: (args: unknown) => Promise<ExpenseWithLedger[]> } }).expense.findMany({
        where,
        orderBy: { incurredAt: "desc" },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      (prisma as unknown as { expense: { count: (args: unknown) => Promise<number> } }).expense.count({ where }),
    ]);

    return { expenses, total };
  } catch (error) {
    logger.error("Failed to get expenses", { error, storeId });
    throw error;
  }
}

/**
 * Update expense status
 */
export async function updateExpenseStatus(
  expenseId: string,
  status: ExpenseStatus,
  updatedBy: string
): Promise<ExpenseWithLedger> {
  try {
    const expense = await (prisma as unknown as { expense: { update: (args: unknown) => Promise<ExpenseWithLedger> } }).expense.update({
      where: { id: expenseId },
      data: { 
        status,
        updatedAt: new Date(),
      },
    });

    return expense;
  } catch (error) {
    logger.error("Failed to update expense status", { error, expenseId, status });
    throw error;
  }
}

/**
 * Get expense summary by category
 */
export async function getExpenseSummary(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<{
  category: string;
  count: number;
  totalAmount: number;
  vatAmount: number;
  whtAmount: number;
}>> {
  try {
    // Aggregate expenses by category
    const result = await (prisma as unknown as { 
      $queryRaw: (template: TemplateStringsArray, ...values: unknown[]) => Promise<unknown> 
    }).$queryRaw`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as totalAmount,
        COALESCE(SUM(vatAmount), 0) as vatAmount,
        COALESCE(SUM(whtAmount), 0) as whtAmount
      FROM "Expense"
      WHERE storeId = ${storeId}
        AND incurredAt >= ${startDate}
        AND incurredAt <= ${endDate}
        AND status != 'CANCELLED'
      GROUP BY category
      ORDER BY totalAmount DESC
    ` as Array<{
      category: string;
      count: bigint;
      totalAmount: unknown;
      vatAmount: unknown;
      whtAmount: unknown;
    }>;

    return result.map(r => ({
      category: r.category,
      count: Number(r.count),
      totalAmount: Number(r.totalAmount) || 0,
      vatAmount: Number(r.vatAmount) || 0,
      whtAmount: Number(r.whtAmount) || 0,
    }));
  } catch (error) {
    logger.error("Failed to get expense summary", { error, storeId });
    // Return empty array if query fails (e.g., Expense table doesn't exist)
    return [];
  }
}

/**
 * Map expense category to ledger account
 */
function mapExpenseCategoryToLedgerAccount(category: ExpenseCategory): string {
  const mapping: Record<ExpenseCategory, string> = {
    [ExpenseCategory.RENT]: "RENT",
    [ExpenseCategory.UTILITIES]: "UTILITIES",
    [ExpenseCategory.SALARIES]: "SALARIES",
    [ExpenseCategory.SUPPLIES]: "OFFICE_SUPPLIES",
    [ExpenseCategory.MARKETING]: "MARKETING",
    [ExpenseCategory.SOFTWARE]: "SOFTWARE",
    [ExpenseCategory.PROFESSIONAL_SERVICES]: "PROFESSIONAL_SERVICES",
    [ExpenseCategory.TRANSPORTATION]: "UTILITIES",
    [ExpenseCategory.MEALS]: "OFFICE_SUPPLIES",
    [ExpenseCategory.INSURANCE]: "PROFESSIONAL_SERVICES",
    [ExpenseCategory.TAXES]: "COMPANY_TAX_PAYABLE",
    [ExpenseCategory.MAINTENANCE]: "OFFICE_SUPPLIES",
    [ExpenseCategory.EQUIPMENT]: "OFFICE_SUPPLIES",
    [ExpenseCategory.SUBSCRIPTIONS]: "SUBSCRIPTION_FEES",
    [ExpenseCategory.OTHER]: "OFFICE_SUPPLIES",
  };

  return mapping[category] || "OFFICE_SUPPLIES";
}

/**
 * Get expenses with missing receipts
 */
export async function getExpensesMissingReceipts(
  storeId: string,
  limit: number = 20
): Promise<ExpenseWithLedger[]> {
  try {
    const expenses = await (prisma as unknown as { 
      expense: { findMany: (args: unknown) => Promise<ExpenseWithLedger[]> } 
    }).expense.findMany({
      where: {
        storeId,
        receiptUrl: null,
        status: { not: ExpenseStatus.CANCELLED },
      },
      orderBy: { incurredAt: "desc" },
      take: limit,
    });

    return expenses;
  } catch (error) {
    logger.error("Failed to get expenses missing receipts", { error, storeId });
    return [];
  }
}

/**
 * Bulk update expense tags
 */
export async function updateExpenseTags(
  expenseId: string,
  tags: string[]
): Promise<void> {
  try {
    await (prisma as unknown as { expense: { update: (args: unknown) => Promise<unknown> } }).expense.update({
      where: { id: expenseId },
      data: { tags },
    });
  } catch (error) {
    logger.error("Failed to update expense tags", { error, expenseId });
    throw error;
  }
}
