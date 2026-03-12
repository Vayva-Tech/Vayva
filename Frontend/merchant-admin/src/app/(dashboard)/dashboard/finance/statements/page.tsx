"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  DownloadSimple as Download,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { Button, EmptyState } from "@vayva/ui";
import { motion } from "framer-motion";
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
      toast.error(_errMsg || "Failed to generate statement");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin w-8 h-8 text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto space-y-8 pb-20">
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        </div>
      )}

      <div>
        <div className="text-sm text-text-secondary">Finance</div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
          Statements
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Monthly financial statements for accounting.
        </p>
      </div>

      {statements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card p-12"
        >
          <EmptyState
            title="No statements available"
            icon="FileText"
            description="Statements will be generated as your store processes transactions."
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl overflow-hidden"
        >
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border/40">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {statements.map((stmt) => (
                <tr
                  key={stmt.id}
                  className="hover:bg-background/20 transition-colors"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-text-primary">
                      {stmt.month} {stmt.year}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary">PDF, CSV</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => handleDownload(stmt)}
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 hover:bg-primary/5 font-bold text-xs h-8 rounded-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
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
