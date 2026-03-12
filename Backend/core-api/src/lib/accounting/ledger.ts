import { prisma, type Prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// Nigeria Tax Rates
export const NIGERIA_TAX_RATES = {
  VAT: 0.075, // 7.5% VAT
  WHT_SERVICES: 0.05, // 5% WHT on professional services
  WHT_CONTRACTS: 0.05, // 5% WHT on contracts
  WHT_DIVIDENDS: 0.10, // 10% WHT on dividends
  WHT_RENT: 0.10, // 10% WHT on rent
  COMPANY_TAX_SMALL: 0.20, // 20% for small companies (< ₦25M turnover)
  COMPANY_TAX_MEDIUM: 0.30, // 30% for medium/large companies
};

// Ledger account categories for Nigerian accounting
export enum LedgerCategory {
  // Revenue
  SALES_REVENUE = "SALES_REVENUE",
  SERVICE_REVENUE = "SERVICE_REVENUE",
  DISCOUNTS = "DISCOUNTS",
  
  // Cost of Goods Sold
  COGS_PRODUCTS = "COGS_PRODUCTS",
  COGS_SHIPPING = "COGS_SHIPPING",
  
  // Operating Expenses
  RENT = "RENT",
  SALARIES = "SALARIES",
  UTILITIES = "UTILITIES",
  MARKETING = "MARKETING",
  SOFTWARE = "SOFTWARE",
  PROFESSIONAL_SERVICES = "PROFESSIONAL_SERVICES",
  OFFICE_SUPPLIES = "OFFICE_SUPPLIES",
  
  // Platform Fees
  PAYOUT_FEES = "PAYOUT_FEES",
  PAYMENT_PROCESSING = "PAYMENT_PROCESSING",
  SUBSCRIPTION_FEES = "SUBSCRIPTION_FEES",
  
  // Tax Liabilities
  VAT_PAYABLE = "VAT_PAYABLE",
  VAT_RECOVERABLE = "VAT_RECOVERABLE",
  WHT_PAYABLE = "WHT_PAYABLE",
  COMPANY_TAX_PAYABLE = "COMPANY_TAX_PAYABLE",
  
  // Assets
  CASH = "CASH",
  BANK = "BANK",
  ACCOUNTS_RECEIVABLE = "ACCOUNTS_RECEIVABLE",
  INVENTORY = "INVENTORY",
  
  // Transfers
  TRANSFER = "TRANSFER",
}

export interface LedgerEntryData {
  id: string;
  storeId: string;
  referenceType: string;
  referenceId: string;
  direction: string;
  account: string;
  amount: number; // in NGN (decimal)
  currency: string;
  description?: string | null;
  occurredAt: Date;
  metadata?: Prisma.JsonValue | null;
  createdAt: Date;
}

export interface PLReport {
  period: string;
  startDate: Date;
  endDate: Date;
  revenue: {
    sales: number;
    services: number;
    total: number;
  };
  cogs: {
    products: number;
    shipping: number;
    total: number;
  };
  grossProfit: number;
  operatingExpenses: {
    rent: number;
    salaries: number;
    utilities: number;
    marketing: number;
    software: number;
    professionalServices: number;
    officeSupplies: number;
    platformFees: number;
    total: number;
  };
  netIncome: number;
}

export interface TaxSummary {
  period: string;
  startDate: Date;
  endDate: Date;
  vat: {
    outputVat: number; // VAT collected on sales
    inputVat: number; // VAT paid on purchases
    netVat: number; // VAT payable (output - input)
  };
  wht: {
    services: number;
    contracts: number;
    rent: number;
    total: number;
  };
  companyTax: {
    taxableIncome: number;
    rate: number;
    estimatedTax: number;
  };
  totalTaxLiability: number;
}

export interface BalanceSheet {
  asOfDate: Date;
  assets: {
    cash: number;
    bank: number;
    accountsReceivable: number;
    inventory: number;
    vatRecoverable: number;
    total: number;
  };
  liabilities: {
    vatPayable: number;
    whtPayable: number;
    companyTaxPayable: number;
    accountsPayable: number;
    total: number;
  };
  equity: {
    retainedEarnings: number;
    netIncome: number;
    total: number;
  };
  totalLiabilitiesAndEquity: number;
}

/**
 * Create a new ledger entry
 */
export async function createLedgerEntry(data: {
  storeId: string;
  referenceType: string;
  referenceId: string;
  direction: "debit" | "credit";
  account: string;
  amount: number;
  currency: string;
  description?: string;
  occurredAt?: Date;
  metadata?: Record<string, unknown>;
}): Promise<LedgerEntryData> {
  try {
    const metadata = (data.metadata || {}) as unknown as Prisma.InputJsonValue;
    const entry = await prisma.ledgerEntry.create({
      data: {
        storeId: data.storeId,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        direction: data.direction,
        account: data.account,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        occurredAt: data.occurredAt || new Date(),
        metadata,
      },
    });

    return {
      ...entry,
      amount: Number(entry.amount),
      description: entry.description,
      occurredAt: entry.occurredAt,
      createdAt: entry.createdAt,
    };
  } catch (error) {
    logger.error("Failed to create ledger entry", { error, storeId: data.storeId });
    throw error;
  }
}

/**
 * Get ledger entries for a store with filtering
 */
export async function getLedgerEntries(
  storeId: string,
  filters?: {
    account?: string;
    startDate?: Date;
    endDate?: Date;
    referenceType?: string;
    limit?: number;
  },
): Promise<LedgerEntryData[]> {
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      storeId,
      ...(filters?.account && { account: filters.account }),
      ...(filters?.referenceType && { referenceType: filters.referenceType }),
      ...(filters?.startDate && filters?.endDate && {
        occurredAt: { gte: filters.startDate, lte: filters.endDate },
      }),
    },
    orderBy: { occurredAt: "desc" },
    take: filters?.limit || 100,
  });

  return entries.map((e) => ({
    ...e,
    amount: Number(e.amount),
    occurredAt: e.occurredAt,
    createdAt: e.createdAt,
    description: e.description,
  }));
}

/**
 * Generate Profit & Loss report
 */
export async function generatePLReport(
  storeId: string,
  startDate: Date,
  endDate: Date,
): Promise<PLReport> {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        storeId,
        occurredAt: { gte: startDate, lte: endDate },
      },
    });

    // Calculate revenue (debits to revenue accounts are negative, credits are positive)
    const salesRevenue = sumByAccountAndDirection(entries, "SALES_REVENUE", "credit") - 
                         sumByAccountAndDirection(entries, "SALES_REVENUE", "debit");
    
    const serviceRevenue = sumByAccountAndDirection(entries, "SERVICE_REVENUE", "credit") -
                           sumByAccountAndDirection(entries, "SERVICE_REVENUE", "debit");

    const discounts = sumByAccountAndDirection(entries, "DISCOUNTS", "debit") -
                      sumByAccountAndDirection(entries, "DISCOUNTS", "credit");

    const totalRevenue = salesRevenue + serviceRevenue - discounts;

    // Calculate COGS
    const cogsProducts = sumByAccountAndDirection(entries, "COGS_PRODUCTS", "debit") -
                         sumByAccountAndDirection(entries, "COGS_PRODUCTS", "credit");

    const cogsShipping = sumByAccountAndDirection(entries, "COGS_SHIPPING", "debit") -
                         sumByAccountAndDirection(entries, "COGS_SHIPPING", "credit");

    const totalCOGS = cogsProducts + cogsShipping;
    const grossProfit = totalRevenue - totalCOGS;

    // Operating expenses
    const rent = sumByAccountAndDirection(entries, "RENT", "debit") -
                 sumByAccountAndDirection(entries, "RENT", "credit");
    const salaries = sumByAccountAndDirection(entries, "SALARIES", "debit") -
                     sumByAccountAndDirection(entries, "SALARIES", "credit");
    const utilities = sumByAccountAndDirection(entries, "UTILITIES", "debit") -
                      sumByAccountAndDirection(entries, "UTILITIES", "credit");
    const marketing = sumByAccountAndDirection(entries, "MARKETING", "debit") -
                      sumByAccountAndDirection(entries, "MARKETING", "credit");
    const software = sumByAccountAndDirection(entries, "SOFTWARE", "debit") -
                     sumByAccountAndDirection(entries, "SOFTWARE", "credit");
    const professionalServices = sumByAccountAndDirection(entries, "PROFESSIONAL_SERVICES", "debit") -
                                 sumByAccountAndDirection(entries, "PROFESSIONAL_SERVICES", "credit");
    const officeSupplies = sumByAccountAndDirection(entries, "OFFICE_SUPPLIES", "debit") -
                           sumByAccountAndDirection(entries, "OFFICE_SUPPLIES", "credit");
    
    const platformFees = sumByAccountsAndDirection(entries, 
      ["PAYOUT_FEES", "PAYMENT_PROCESSING", "SUBSCRIPTION_FEES"], "debit") -
      sumByAccountsAndDirection(entries, 
        ["PAYOUT_FEES", "PAYMENT_PROCESSING", "SUBSCRIPTION_FEES"], "credit");

    const totalOperatingExpenses = rent + salaries + utilities + marketing + 
      software + professionalServices + officeSupplies + platformFees;

    const netIncome = grossProfit - totalOperatingExpenses;

    return {
      period: `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
      startDate,
      endDate,
      revenue: {
        sales: salesRevenue,
        services: serviceRevenue,
        total: totalRevenue,
      },
      cogs: {
        products: cogsProducts,
        shipping: cogsShipping,
        total: totalCOGS,
      },
      grossProfit,
      operatingExpenses: {
        rent,
        salaries,
        utilities,
        marketing,
        software,
        professionalServices,
        officeSupplies,
        platformFees,
        total: totalOperatingExpenses,
      },
      netIncome,
    };
  } catch (error) {
    logger.error("Failed to generate P&L report", { error, storeId });
    throw error;
  }
}

/**
 * Generate Tax Summary report
 */
export async function generateTaxSummary(
  storeId: string,
  startDate: Date,
  endDate: Date,
): Promise<TaxSummary> {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        storeId,
        occurredAt: { gte: startDate, lte: endDate },
      },
    });

    // VAT calculations
    const outputVat = sumByAccountAndDirection(entries, "VAT_PAYABLE", "credit") -
                      sumByAccountAndDirection(entries, "VAT_PAYABLE", "debit");

    const inputVat = sumByAccountAndDirection(entries, "VAT_RECOVERABLE", "debit") -
                     sumByAccountAndDirection(entries, "VAT_RECOVERABLE", "credit");

    const netVat = outputVat - inputVat;

    // WHT calculations (estimated from expenses)
    const professionalServicesExp = sumByAccountAndDirection(entries, "PROFESSIONAL_SERVICES", "debit") -
                                    sumByAccountAndDirection(entries, "PROFESSIONAL_SERVICES", "credit");
    const whtServices = professionalServicesExp * NIGERIA_TAX_RATES.WHT_SERVICES;

    const cogsProducts = sumByAccountAndDirection(entries, "COGS_PRODUCTS", "debit") -
                         sumByAccountAndDirection(entries, "COGS_PRODUCTS", "credit");
    const whtContracts = cogsProducts * NIGERIA_TAX_RATES.WHT_CONTRACTS;

    const rentExp = sumByAccountAndDirection(entries, "RENT", "debit") -
                    sumByAccountAndDirection(entries, "RENT", "credit");
    const whtRent = rentExp * NIGERIA_TAX_RATES.WHT_RENT;

    const totalWHT = whtServices + whtContracts + whtRent;

    // Company Tax estimation
    const plReport = await generatePLReport(storeId, startDate, endDate);
    const taxableIncome = Math.max(0, plReport.netIncome);
    const taxRate = NIGERIA_TAX_RATES.COMPANY_TAX_MEDIUM;
    const estimatedCompanyTax = taxableIncome * taxRate;

    const totalTaxLiability = Math.max(0, netVat) + totalWHT + estimatedCompanyTax;

    return {
      period: `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
      startDate,
      endDate,
      vat: {
        outputVat,
        inputVat,
        netVat,
      },
      wht: {
        services: whtServices,
        contracts: whtContracts,
        rent: whtRent,
        total: totalWHT,
      },
      companyTax: {
        taxableIncome,
        rate: taxRate,
        estimatedTax: estimatedCompanyTax,
      },
      totalTaxLiability,
    };
  } catch (error) {
    logger.error("Failed to generate tax summary", { error, storeId });
    throw error;
  }
}

/**
 * Generate Balance Sheet
 */
export async function generateBalanceSheet(
  storeId: string,
  asOfDate: Date,
): Promise<BalanceSheet> {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        storeId,
        occurredAt: { lte: asOfDate },
      },
    });

    // Assets
    const cash = sumByAccountAndDirection(entries, "CASH", "debit") -
                 sumByAccountAndDirection(entries, "CASH", "credit");
    const bank = sumByAccountAndDirection(entries, "BANK", "debit") -
                 sumByAccountAndDirection(entries, "BANK", "credit");
    const accountsReceivable = sumByAccountAndDirection(entries, "ACCOUNTS_RECEIVABLE", "debit") -
                               sumByAccountAndDirection(entries, "ACCOUNTS_RECEIVABLE", "credit");
    const inventory = sumByAccountAndDirection(entries, "INVENTORY", "debit") -
                      sumByAccountAndDirection(entries, "INVENTORY", "credit");
    const vatRecoverable = sumByAccountAndDirection(entries, "VAT_RECOVERABLE", "debit") -
                           sumByAccountAndDirection(entries, "VAT_RECOVERABLE", "credit");

    const totalAssets = Math.max(0, cash + bank + accountsReceivable + inventory + vatRecoverable);

    // Liabilities
    const vatPayable = Math.max(0, sumByAccountAndDirection(entries, "VAT_PAYABLE", "credit") -
                       sumByAccountAndDirection(entries, "VAT_PAYABLE", "debit"));
    const whtPayable = Math.max(0, sumByAccountAndDirection(entries, "WHT_PAYABLE", "credit") -
                       sumByAccountAndDirection(entries, "WHT_PAYABLE", "debit"));
    const companyTaxPayable = Math.max(0, sumByAccountAndDirection(entries, "COMPANY_TAX_PAYABLE", "credit") -
                              sumByAccountAndDirection(entries, "COMPANY_TAX_PAYABLE", "debit"));

    const totalLiabilities = vatPayable + whtPayable + companyTaxPayable;

    // Equity (simplified)
    // Calculate retained earnings from revenue - expenses
    const revenueAccounts = ["SALES_REVENUE", "SERVICE_REVENUE"];
    const expenseAccounts = ["COGS_PRODUCTS", "COGS_SHIPPING", "RENT", "SALARIES", 
      "UTILITIES", "MARKETING", "SOFTWARE", "PROFESSIONAL_SERVICES", "OFFICE_SUPPLIES",
      "PAYOUT_FEES", "PAYMENT_PROCESSING", "SUBSCRIPTION_FEES"];

    const totalRevenue = sumAccountsNet(entries, revenueAccounts);
    const totalExpenses = sumAccountsNet(entries, expenseAccounts);

    const netIncome = totalRevenue - totalExpenses;
    const retainedEarnings = Math.max(0, netIncome);
    const totalEquity = retainedEarnings;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return {
      asOfDate,
      assets: {
        cash: Math.max(0, cash),
        bank: Math.max(0, bank),
        accountsReceivable: Math.max(0, accountsReceivable),
        inventory: Math.max(0, inventory),
        vatRecoverable: Math.max(0, vatRecoverable),
        total: totalAssets,
      },
      liabilities: {
        vatPayable,
        whtPayable,
        companyTaxPayable,
        accountsPayable: 0,
        total: totalLiabilities,
      },
      equity: {
        retainedEarnings,
        netIncome,
        total: totalEquity,
      },
      totalLiabilitiesAndEquity,
    };
  } catch (error) {
    logger.error("Failed to generate balance sheet", { error, storeId });
    throw error;
  }
}

// Helper functions
function sumByAccountAndDirection(
  entries: Array<{ account: string; direction: string; amount: unknown }>,
  account: string,
  direction: string,
): number {
  return entries
    .filter((e) => e.account === account && e.direction === direction)
    .reduce((sum, e) => sum + Number(e.amount), 0);
}

function sumByAccountsAndDirection(
  entries: Array<{ account: string; direction: string; amount: unknown }>,
  accounts: string[],
  direction: string,
): number {
  return accounts.reduce((total, account) => 
    total + sumByAccountAndDirection(entries, account, direction), 0);
}

function sumAccountsNet(
  entries: Array<{ account: string; direction: string; amount: unknown }>,
  accounts: string[],
): number {
  return accounts.reduce((total, account) => {
    const debits = sumByAccountAndDirection(entries, account, "debit");
    const credits = sumByAccountAndDirection(entries, account, "credit");
    return total + (debits - credits);
  }, 0);
}

/**
 * Auto-create ledger entries from Paystack webhooks
 */
export async function createLedgerEntryFromPaystackEvent(
  storeId: string,
  event: {
    event: string;
    data: {
      reference: string;
      amount: number;
      fees?: number;
      metadata?: Record<string, unknown>;
    };
  },
): Promise<void> {
  try {
    const { event: eventType, data } = event;
    const amount = data.amount / 100; // Convert from kobo to NGN
    const fees = (data.fees || 0) / 100;

    switch (eventType) {
      case "charge.success":
        // Record sale
        await createLedgerEntry({
          storeId,
          referenceType: "order",
          referenceId: data.reference,
          direction: "credit",
          account: "SALES_REVENUE",
          amount,
          currency: "NGN",
          description: `Sale - ${data.reference}`,
          metadata: { event: "charge.success", ...data.metadata },
        });

        // Record payment processing fee
        if (fees > 0) {
          await createLedgerEntry({
            storeId,
            referenceType: "order",
            referenceId: data.reference,
            direction: "debit",
            account: "PAYMENT_PROCESSING",
            amount: fees,
            currency: "NGN",
            description: `Payment processing fee - ${data.reference}`,
            metadata: { event: "charge.success", fee: fees },
          });
        }
        break;

      case "transfer.success":
        // Record payout
        await createLedgerEntry({
          storeId,
          referenceType: "payout",
          referenceId: data.reference,
          direction: "credit",
          account: "BANK",
          amount,
          currency: "NGN",
          description: `Payout - ${data.reference}`,
          metadata: { event: "transfer.success" },
        });
        break;

      default:
        logger.info("Unhandled Paystack event for ledger", { eventType, storeId });
    }
  } catch (error) {
    logger.error("Failed to create ledger entry from Paystack event", { error, storeId, event });
  }
}

/**
 * Bulk import ledger entries from CSV/JSON
 */
export async function bulkImportLedgerEntries(
  storeId: string,
  entries: Array<{
    referenceType: string;
    referenceId: string;
    direction: "debit" | "credit";
    account: string;
    amount: number;
    currency: string;
    description?: string;
    occurredAt?: string;
    metadata?: Record<string, unknown>;
  }>,
): Promise<{ success: number; failed: number; errors: string[] }> {
  const result = { success: 0, failed: 0, errors: [] as string[] };

  for (const entry of entries) {
    try {
      await createLedgerEntry({
        storeId,
        referenceType: entry.referenceType,
        referenceId: entry.referenceId,
        direction: entry.direction,
        account: entry.account,
        amount: entry.amount,
        currency: entry.currency,
        description: entry.description,
        occurredAt: entry.occurredAt ? new Date(entry.occurredAt) : new Date(),
        metadata: entry.metadata,
      });
      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push(`Failed to import ${entry.referenceId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return result;
}
