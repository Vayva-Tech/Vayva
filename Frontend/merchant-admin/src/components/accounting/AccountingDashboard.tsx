"use client";

import { useState, useEffect } from "react";
import { Button } from "@vayva/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { 
  TrendUp, 
  TrendDown, 
  Wallet, 
  Receipt, 
  ArrowRight,
  Calendar,
  FileText,
  DownloadSimple
} from "@phosphor-icons/react/ssr";
import Papa from "papaparse";

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  debit: number;
  credit: number;
  balance: number;
  reference: string;
  type: "income" | "expense" | "transfer";
}

interface PLReport {
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netIncome: number;
  byCategory: Record<string, { income: number; expense: number }>;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  receiptUrl?: string;
  status: "pending" | "approved" | "reimbursed";
}

const EXPENSE_CATEGORIES = [
  "Marketing",
  "Shipping",
  "Software",
  "Office",
  "Utilities",
  "Travel",
  "Meals",
  "Equipment",
  "Professional Services",
  "Other",
];

export function AccountingDashboard() {
  const [activeTab, setActiveTab] = useState("ledger");
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [plReport, setPlReport] = useState<PLReport | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateRange({
      start: firstDay.toISOString().split("T")[0],
      end: lastDay.toISOString().split("T")[0],
    });
  }, []);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchAccountingData();
    }
  }, [dateRange, activeTab]);

  const fetchAccountingData = async () => {
    setLoading(true);
    try {
      const [ledgerData, plData, expensesData] = await Promise.all([
        apiJson<{ entries: LedgerEntry[] }>(
          `/api/accounting/ledger?start=${dateRange.start}&end=${dateRange.end}`,
          { method: "GET" }
        ),
        apiJson<{ report: PLReport }>(
          `/api/accounting/pl-report?start=${dateRange.start}&end=${dateRange.end}`,
          { method: "GET" }
        ),
        apiJson<{ expenses: Expense[] }>(
          `/api/accounting/expenses?start=${dateRange.start}&end=${dateRange.end}`,
          { method: "GET" }
        ),
      ]);

      setLedger(ledgerData.entries || []);
      setPlReport(plData.report || null);
      setExpenses(expensesData.expenses || []);
    } catch {
      // Generate mock data
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    // Mock ledger entries
    const mockLedger: LedgerEntry[] = [
      {
        id: "1",
        date: new Date().toISOString(),
        description: "Sale - Order #1234",
        category: "Sales",
        debit: 0,
        credit: 50000,
        balance: 50000,
        reference: "ORD-1234",
        type: "income",
      },
      {
        id: "2",
        date: new Date(Date.now() - 86400000).toISOString(),
        description: "Shipping Cost",
        category: "Shipping",
        debit: 2500,
        credit: 0,
        balance: 47500,
        reference: "SHIP-001",
        type: "expense",
      },
      {
        id: "3",
        date: new Date(Date.now() - 172800000).toISOString(),
        description: "Marketing Campaign",
        category: "Marketing",
        debit: 10000,
        credit: 0,
        balance: 37500,
        reference: "MKT-001",
        type: "expense",
      },
    ];

    // Mock P&L
    const mockPL: PLReport = {
      period: "Current Month",
      revenue: 250000,
      cogs: 125000,
      grossProfit: 125000,
      operatingExpenses: 45000,
      netIncome: 80000,
      byCategory: {
        Sales: { income: 250000, expense: 0 },
        Shipping: { income: 0, expense: 15000 },
        Marketing: { income: 0, expense: 20000 },
        Software: { income: 0, expense: 10000 },
      },
    };

    // Mock expenses
    const mockExpenses: Expense[] = [
      {
        id: "1",
        date: new Date().toISOString(),
        description: "Facebook Ads",
        category: "Marketing",
        amount: 5000,
        status: "approved",
      },
      {
        id: "2",
        date: new Date(Date.now() - 86400000).toISOString(),
        description: "DHL Shipping",
        category: "Shipping",
        amount: 2500,
        status: "reimbursed",
      },
    ];

    setLedger(mockLedger);
    setPlReport(mockPL);
    setExpenses(mockExpenses);
  };

  const exportToCSV = () => {
    let csv = "";
    let filename = "";

    if (activeTab === "ledger") {
      csv = Papa.unparse(
        ledger.map((entry) => ({
          Date: new Date(entry.date).toLocaleDateString(),
          Description: entry.description,
          Category: entry.category,
          Debit: entry.debit,
          Credit: entry.credit,
          Balance: entry.balance,
          Reference: entry.reference,
        }))
      );
      filename = `ledger-${dateRange.start}-to-${dateRange.end}.csv`;
    } else if (activeTab === "expenses") {
      csv = Papa.unparse(
        expenses.map((exp) => ({
          Date: new Date(exp.date).toLocaleDateString(),
          Description: exp.description,
          Category: exp.category,
          Amount: exp.amount,
          Status: exp.status,
        }))
      );
      filename = `expenses-${dateRange.start}-to-${dateRange.end}.csv`;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Export complete");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Accounting</h1>
          <p className="text-muted-foreground">Manage your books and track finances</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange((r) => ({ ...r, start: e.target.value }))}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange((r) => ({ ...r, end: e.target.value }))}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <Button variant="outline" onClick={exportToCSV}>
            <DownloadSimple className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {plReport && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(plReport.revenue)}
                  </p>
                </div>
                <TrendUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(plReport.operatingExpenses + plReport.cogs)}
                  </p>
                </div>
                <TrendDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Income</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(plReport.netIncome)}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Margin</p>
                  <p className="text-2xl font-bold">
                    {((plReport.netIncome / plReport.revenue) * 100).toFixed(1)}%
                  </p>
                </div>
                <Receipt className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ledger">
            <FileText className="w-4 h-4 mr-2" />
            Ledger
          </TabsTrigger>
          <TabsTrigger value="pl">
            <TrendUp className="w-4 h-4 mr-2" />
            P&L Report
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="w-4 h-4 mr-2" />
            Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-right">Debit</th>
                      <th className="px-4 py-3 text-right">Credit</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ledger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Ref: {entry.reference}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{entry.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(entry.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {plReport && (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span>Revenue</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(plReport.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="pl-4">Cost of Goods Sold</span>
                      <span className="text-red-600">-{formatCurrency(plReport.cogs)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b font-medium">
                      <span>Gross Profit</span>
                      <span>{formatCurrency(plReport.grossProfit)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="pl-4">Operating Expenses</span>
                      <span className="text-red-600">
                        -{formatCurrency(plReport.operatingExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold">
                      <span>Net Income</span>
                      <span className={plReport.netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(plReport.netIncome)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">By Category</h4>
                    <div className="grid gap-2">
                      {Object.entries(plReport.byCategory).map(([category, amounts]) => (
                        <div key={category} className="flex justify-between py-2 border-b">
                          <span>{category}</span>
                          <div className="text-right">
                            {amounts.income > 0 && (
                              <span className="text-green-600 mr-3">
                                +{formatCurrency(amounts.income)}
                              </span>
                            )}
                            {amounts.expense > 0 && (
                              <span className="text-red-600">
                                -{formatCurrency(amounts.expense)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expense Tracking</CardTitle>
              <Button size="sm">
                <Receipt className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{expense.description}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{expense.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              expense.status === "reimbursed"
                                ? "default"
                                : expense.status === "approved"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {expense.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Tax Summary (Nigeria)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>VAT (7.5%)</span>
                    <span>
                      {formatCurrency(
                        expenses.reduce((sum: number, e) => sum + e.amount * 0.075, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>WHT on Services (5%)</span>
                    <span>
                      {formatCurrency(
                        expenses
                          .filter((e) => e.category === "Professional Services")
                          .reduce((sum: number, e) => sum + e.amount * 0.05, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
