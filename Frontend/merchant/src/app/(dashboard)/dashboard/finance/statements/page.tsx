"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Calendar, TrendUp, CurrencyDollar as DollarSign } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { logger } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { useAuth } from "@/context/AuthContext";

interface Statement {
  id: string;
  month: string;
  year: number;
  url?: string;
  downloadUrl?: string;
  status: string;
  period?: { month?: string; year?: number };
}

interface StatementsResponse {
  statements: Statement[];
}

interface GenerateStatementResponse {
  url: string;
}

export default function StatementsPage() {
  const { merchant } = useAuth();
  const isPaidPlan = (() => {
    const v = String((merchant as any)?.plan || "")
      .trim()
      .toLowerCase();

    return (
      v === "starter" ||
      v === "pro" ||
      v === "growth" ||
      v === "business" ||
      v === "enterprise" ||
      v === "professional" ||
      v === "premium"
    );
  })();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatements() {
      try {
        setLoading(true);
        const data = await apiJson<StatementsResponse>(
          "/api/finance/statements",
        );
        const list: Statement[] = Array.isArray(data)
          ? (data as Statement[])
          : ((data as StatementsResponse)?.statements ?? []);

        if (list.length > 0) {
          setStatements(
            list.map((s) => ({
              id: s.id || `${s.year}-${s.month}`,
              month: s.month || s.period?.month || "",
              year: s.year || s.period?.year || 0,
              url: s.url || s.downloadUrl,
              status: (s as any).status || "AVAILABLE",
            })),
          );
        } else {
          setStatements(generatePastMonths(12));
        }
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[FETCH_STATEMENTS_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        setStatements(generatePastMonths(12));
      } finally {
        setLoading(false);
      }
    }
    void fetchStatements();
  }, []);

  const handleDownload = async (statement: Statement) => {
    if (statement.url) {
      window.open(statement.url, "_blank");
      return;
    }
    try {
      toast.success(
        `Generating statement for ${statement.month} ${statement.year}...`,
      );
      const data = await apiJson<GenerateStatementResponse>(
        "/api/finance/statements/generate",
        {
          method: "POST",
          body: JSON.stringify({
            month: statement.month,
            year: statement.year,
          }),
        },
      );
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[GENERATE_STATEMENT_ERROR]", {
        error: _errMsg,
        month: statement.month,
        year: statement.year,
        app: "merchant",
      });
      toast.error("Failed to generate statement");
    }
  };

  // Calculate metrics
  const totalStatements = statements.length;
  const currentYear = new Date().getFullYear();
  const lastYearCount = statements.filter(s => s.year === currentYear).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <span className="sr-only">Loading statements...</span>
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Statements</h1>
          <p className="text-sm text-gray-500 mt-1">Monthly and annual financial reports</p>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryWidget
          icon={<FileText size={18} />}
          label="Total Statements"
          value={String(totalStatements)}
          trend="available"
          positive
        />
        <SummaryWidget
          icon={<Calendar size={18} />}
          label={`${currentYear} Reports`}
          value={String(lastYearCount)}
          trend="this year"
          positive
        />
        <SummaryWidget
          icon={<TrendUp size={18} />}
          label="Coverage"
          value={`${totalStatements} months`}
          trend="historical"
          positive
        />
      </div>

      {/* Statements Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {statements.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No statements available</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Financial statements will appear here once generated.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {statements.map((statement) => (
              <div key={statement.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <FileText size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{statement.month} {statement.year}</h3>
                      <p className="text-xs text-gray-500 capitalize">Status: {statement.status.toLowerCase()}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(statement)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold"
                  >
                    <Download size={18} className="mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function generatePastMonths(count: number): Statement[] {
  const result: Statement[] = [];
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - 1);

  for (let i = 0; i < count; i++) {
    result.push({
      id: `${date.getFullYear()}-${date.getMonth() + 1}`,
      month: date.toLocaleString("default", { month: "long" }),
      year: date.getFullYear(),
      status: "AVAILABLE",
    });
    date.setMonth(date.getMonth() - 1);
  }
  return result;
}
