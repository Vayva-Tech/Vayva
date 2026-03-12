import { PDFDocument, PDFFont, PDFPage, RGB, rgb, StandardFonts } from "pdf-lib";
import { logger } from "@vayva/shared";
import { PLReport, TaxSummary, BalanceSheet } from "./ledger";

// Nigerian Naira formatter
const formatNGN = (amount: number): string => {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Date formatter
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
};

// PDF Theme Colors (Vayva Brand)
const COLORS = {
  primary: rgb(0.12, 0.58, 0.95), // Vayva blue
  dark: rgb(0.1, 0.1, 0.1),
  gray: rgb(0.5, 0.5, 0.5),
  lightGray: rgb(0.9, 0.9, 0.9),
  white: rgb(1, 1, 1),
  green: rgb(0.2, 0.7, 0.3),
  red: rgb(0.9, 0.2, 0.2),
};

interface PDFContext {
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  y: number;
  margin: number;
  pageWidth: number;
  pageHeight: number;
}

/**
 * Generate Profit & Loss PDF Report
 */
export async function generatePLPDF(
  report: PLReport,
  storeName: string
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([612, 792]); // US Letter
    const { width, height } = page.getSize();
    
    const ctx: PDFContext = {
      page,
      font,
      boldFont,
      y: height - 50,
      margin: 50,
      pageWidth: width,
      pageHeight: height,
    };

    // Header
    drawHeader(ctx, `Profit & Loss Statement - ${storeName}`);
    drawSubHeader(ctx, `Period: ${formatDate(report.startDate)} - ${formatDate(report.endDate)}`);
    
    ctx.y -= 30;

    // Revenue Section
    drawSectionHeader(ctx, "REVENUE");
    drawRow(ctx, "Sales Revenue", report.revenue.sales, "normal");
    drawRow(ctx, "Service Revenue", report.revenue.services, "normal");
    drawRow(ctx, "Total Revenue", report.revenue.total, "bold", COLORS.green);
    
    ctx.y -= 15;

    // COGS Section
    drawSectionHeader(ctx, "COST OF GOODS SOLD");
    drawRow(ctx, "Products", report.cogs.products, "normal");
    drawRow(ctx, "Shipping", report.cogs.shipping, "normal");
    drawRow(ctx, "Total COGS", report.cogs.total, "bold", COLORS.red);
    
    ctx.y -= 15;

    // Gross Profit
    drawRow(ctx, "GROSS PROFIT", report.grossProfit, "bold", 
      report.grossProfit >= 0 ? COLORS.green : COLORS.red);
    
    ctx.y -= 20;

    // Operating Expenses
    drawSectionHeader(ctx, "OPERATING EXPENSES");
    drawRow(ctx, "Rent", report.operatingExpenses.rent, "normal");
    drawRow(ctx, "Salaries & Wages", report.operatingExpenses.salaries, "normal");
    drawRow(ctx, "Utilities", report.operatingExpenses.utilities, "normal");
    drawRow(ctx, "Marketing", report.operatingExpenses.marketing, "normal");
    drawRow(ctx, "Software", report.operatingExpenses.software, "normal");
    drawRow(ctx, "Professional Services", report.operatingExpenses.professionalServices, "normal");
    drawRow(ctx, "Office Supplies", report.operatingExpenses.officeSupplies, "normal");
    drawRow(ctx, "Platform Fees", report.operatingExpenses.platformFees, "normal");
    drawRow(ctx, "Total Operating Expenses", report.operatingExpenses.total, "bold", COLORS.red);
    
    ctx.y -= 20;

    // Net Income
    drawRow(ctx, "NET INCOME", report.netIncome, "bold", 
      report.netIncome >= 0 ? COLORS.green : COLORS.red);

    // Footer
    drawFooter(ctx, storeName);

    return await pdfDoc.save();
  } catch (error) {
    logger.error("Failed to generate P&L PDF", { error });
    throw error;
  }
}

/**
 * Generate Tax Summary PDF Report
 */
export async function generateTaxSummaryPDF(
  report: TaxSummary,
  storeName: string
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    const ctx: PDFContext = {
      page,
      font,
      boldFont,
      y: height - 50,
      margin: 50,
      pageWidth: width,
      pageHeight: height,
    };

    // Header
    drawHeader(ctx, `Tax Summary Report - ${storeName}`);
    drawSubHeader(ctx, `Period: ${formatDate(report.startDate)} - ${formatDate(report.endDate)}`);
    drawSubHeader(ctx, "Nigeria Tax Compliance Report (VAT 7.5%, WHT 5-10%)");
    
    ctx.y -= 30;

    // VAT Section
    drawSectionHeader(ctx, "VALUE ADDED TAX (VAT) - 7.5%");
    drawRow(ctx, "Output VAT (Collected)", report.vat.outputVat, "normal", COLORS.green);
    drawRow(ctx, "Input VAT (Paid)", report.vat.inputVat, "normal", COLORS.red);
    drawRow(ctx, "Net VAT Payable", report.vat.netVat, "bold", 
      report.vat.netVat >= 0 ? COLORS.red : COLORS.green);
    
    ctx.y -= 15;

    // WHT Section
    drawSectionHeader(ctx, "WITHHOLDING TAX (WHT)");
    drawNote(ctx, "Estimated based on expense categories:");
    drawRow(ctx, "Services (5%)", report.wht.services, "normal");
    drawRow(ctx, "Contracts (5%)", report.wht.contracts, "normal");
    drawRow(ctx, "Rent (10%)", report.wht.rent, "normal");
    drawRow(ctx, "Total WHT Payable", report.wht.total, "bold", COLORS.red);
    
    ctx.y -= 15;

    // Company Tax Section
    drawSectionHeader(ctx, "COMPANY INCOME TAX");
    drawRow(ctx, "Taxable Income", report.companyTax.taxableIncome, "normal");
    drawRow(ctx, "Tax Rate", `${(report.companyTax.rate * 100).toFixed(0)}%`, "normal");
    drawRow(ctx, "Estimated Tax", report.companyTax.estimatedTax, "bold", COLORS.red);
    
    ctx.y -= 20;

    // Total Tax Liability
    drawRow(ctx, "TOTAL TAX LIABILITY", report.totalTaxLiability, "bold", COLORS.red);

    // Compliance Notes
    ctx.y -= 30;
    drawNote(ctx, "Compliance Notes:");
    drawNote(ctx, "• VAT returns due monthly by 21st of following month");
    drawNote(ctx, "• WHT returns due monthly by 21st of following month");
    drawNote(ctx, "• Company tax returns due annually within 6 months of year-end");
    drawNote(ctx, "• All amounts in Nigerian Naira (NGN)");

    // Footer
    drawFooter(ctx, storeName);

    return await pdfDoc.save();
  } catch (error) {
    logger.error("Failed to generate Tax Summary PDF", { error });
    throw error;
  }
}

/**
 * Generate Balance Sheet PDF Report
 */
export async function generateBalanceSheetPDF(
  report: BalanceSheet,
  storeName: string
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    const ctx: PDFContext = {
      page,
      font,
      boldFont,
      y: height - 50,
      margin: 50,
      pageWidth: width,
      pageHeight: height,
    };

    // Header
    drawHeader(ctx, `Balance Sheet - ${storeName}`);
    drawSubHeader(ctx, `As of ${formatDate(report.asOfDate)}`);
    
    ctx.y -= 30;

    // Assets Section
    drawSectionHeader(ctx, "ASSETS");
    drawRow(ctx, "Cash", report.assets.cash, "normal");
    drawRow(ctx, "Bank", report.assets.bank, "normal");
    drawRow(ctx, "Accounts Receivable", report.assets.accountsReceivable, "normal");
    drawRow(ctx, "Inventory", report.assets.inventory, "normal");
    drawRow(ctx, "VAT Recoverable", report.assets.vatRecoverable, "normal");
    drawRow(ctx, "TOTAL ASSETS", report.assets.total, "bold", COLORS.dark);
    
    ctx.y -= 20;

    // Liabilities Section
    drawSectionHeader(ctx, "LIABILITIES");
    drawRow(ctx, "VAT Payable", report.liabilities.vatPayable, "normal");
    drawRow(ctx, "WHT Payable", report.liabilities.whtPayable, "normal");
    drawRow(ctx, "Company Tax Payable", report.liabilities.companyTaxPayable, "normal");
    drawRow(ctx, "Accounts Payable", report.liabilities.accountsPayable, "normal");
    drawRow(ctx, "TOTAL LIABILITIES", report.liabilities.total, "bold", COLORS.red);
    
    ctx.y -= 20;

    // Equity Section
    drawSectionHeader(ctx, "EQUITY");
    drawRow(ctx, "Retained Earnings", report.equity.retainedEarnings, "normal");
    drawRow(ctx, "Net Income (Current Period)", report.equity.netIncome, "normal");
    drawRow(ctx, "TOTAL EQUITY", report.equity.total, "bold", COLORS.dark);
    
    ctx.y -= 20;

    // Total Liabilities & Equity
    drawRow(ctx, "TOTAL LIABILITIES & EQUITY", report.totalLiabilitiesAndEquity, "bold", COLORS.dark);

    // Verification
    ctx.y -= 30;
    const balanced = Math.abs(report.assets.total - report.totalLiabilitiesAndEquity) < 0.01;
    if (balanced) {
      drawNote(ctx, "✓ Balance Sheet Balanced (Assets = Liabilities + Equity)");
    } else {
      drawNote(ctx, "⚠ Balance Sheet Discrepancy Detected");
    }

    // Footer
    drawFooter(ctx, storeName);

    return await pdfDoc.save();
  } catch (error) {
    logger.error("Failed to generate Balance Sheet PDF", { error });
    throw error;
  }
}

/**
 * Generate Expense Report PDF
 */
export async function generateExpenseReportPDF(
  expenses: Array<{
    title: string;
    category: string;
    amount: number;
    incurredAt: Date;
    vendor?: string;
    status: string;
  }>,
  storeName: string,
  startDate: Date,
  endDate: Date
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    const ctx: PDFContext = {
      page,
      font,
      boldFont,
      y: height - 50,
      margin: 50,
      pageWidth: width,
      pageHeight: height,
    };

    // Header
    drawHeader(ctx, `Expense Report - ${storeName}`);
    drawSubHeader(ctx, `Period: ${formatDate(startDate)} - ${formatDate(endDate)}`);
    
    ctx.y -= 30;

    // Expense Table Header
    drawTableHeader(ctx, ["Date", "Category", "Vendor", "Description", "Amount"]);

    // Expense Rows
    let total = 0;
    for (const expense of expenses) {
      total += expense.amount;
      drawTableRow(ctx, [
        formatDate(expense.incurredAt),
        expense.category,
        expense.vendor || "-",
        expense.title,
        formatNGN(expense.amount),
      ]);
      
      if (ctx.y < 100) {
        // Add new page if running out of space
        const newPage = pdfDoc.addPage([612, 792]);
        ctx.page = newPage;
        ctx.y = height - 50;
        drawTableHeader(ctx, ["Date", "Category", "Vendor", "Description", "Amount"]);
      }
    }

    ctx.y -= 15;
    drawRow(ctx, "TOTAL", total, "bold", COLORS.red);

    // Footer
    drawFooter(ctx, storeName);

    return await pdfDoc.save();
  } catch (error) {
    logger.error("Failed to generate Expense Report PDF", { error });
    throw error;
  }
}

// Helper drawing functions
function drawHeader(ctx: PDFContext, text: string): void {
  ctx.page.drawText(text, {
    x: ctx.margin,
    y: ctx.y,
    size: 18,
    font: ctx.boldFont,
    color: COLORS.primary,
  });
  ctx.y -= 25;
}

function drawSubHeader(ctx: PDFContext, text: string): void {
  ctx.page.drawText(text, {
    x: ctx.margin,
    y: ctx.y,
    size: 10,
    font: ctx.font,
    color: COLORS.gray,
  });
  ctx.y -= 15;
}

function drawSectionHeader(ctx: PDFContext, text: string): void {
  // Background
  ctx.page.drawRectangle({
    x: ctx.margin,
    y: ctx.y - 5,
    width: ctx.pageWidth - 2 * ctx.margin,
    height: 18,
    color: COLORS.lightGray,
  });
  
  ctx.page.drawText(text, {
    x: ctx.margin + 5,
    y: ctx.y,
    size: 10,
    font: ctx.boldFont,
    color: COLORS.dark,
  });
  ctx.y -= 25;
}

function drawRow(
  ctx: PDFContext,
  label: string,
  value: number | string,
  style: "normal" | "bold",
  color?: RGB
): void {
  const font = style === "bold" ? ctx.boldFont : ctx.font;
  const displayValue = typeof value === "number" ? formatNGN(value) : value;
  
  ctx.page.drawText(label, {
    x: ctx.margin,
    y: ctx.y,
    size: style === "bold" ? 11 : 10,
    font,
    color: color || COLORS.dark,
  });
  
  ctx.page.drawText(displayValue, {
    x: ctx.pageWidth - ctx.margin - 120,
    y: ctx.y,
    size: style === "bold" ? 11 : 10,
    font,
    color: color || COLORS.dark,
  });
  
  ctx.y -= 18;
}

function drawNote(ctx: PDFContext, text: string): void {
  ctx.page.drawText(text, {
    x: ctx.margin,
    y: ctx.y,
    size: 9,
    font: ctx.font,
    color: COLORS.gray,
  });
  ctx.y -= 14;
}

function drawTableHeader(ctx: PDFContext, columns: string[]): void {
  const colWidth = (ctx.pageWidth - 2 * ctx.margin) / columns.length;
  
  ctx.page.drawRectangle({
    x: ctx.margin,
    y: ctx.y - 5,
    width: ctx.pageWidth - 2 * ctx.margin,
    height: 18,
    color: COLORS.primary,
  });
  
  columns.forEach((col, i) => {
    ctx.page.drawText(col, {
      x: ctx.margin + i * colWidth + 5,
      y: ctx.y,
      size: 9,
      font: ctx.boldFont,
      color: COLORS.white,
    });
  });
  
  ctx.y -= 22;
}

function drawTableRow(ctx: PDFContext, values: string[]): void {
  const colWidth = (ctx.pageWidth - 2 * ctx.margin) / values.length;
  
  values.forEach((val, i) => {
    ctx.page.drawText(val.substring(0, 20), {
      x: ctx.margin + i * colWidth + 5,
      y: ctx.y,
      size: 9,
      font: ctx.font,
      color: COLORS.dark,
    });
  });
  
  ctx.y -= 16;
}

function drawFooter(ctx: PDFContext, storeName: string): void {
  ctx.page.drawText(`Generated by Vayva Accounting for ${storeName}`, {
    x: ctx.margin,
    y: 30,
    size: 8,
    font: ctx.font,
    color: COLORS.gray,
  });
  
  ctx.page.drawText(`Generated on ${formatDate(new Date())}`, {
    x: ctx.pageWidth - ctx.margin - 100,
    y: 30,
    size: 8,
    font: ctx.font,
    color: COLORS.gray,
  });
}
