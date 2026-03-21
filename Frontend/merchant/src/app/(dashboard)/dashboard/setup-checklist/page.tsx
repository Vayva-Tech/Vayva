"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Icon, type IconName } from "@vayva/ui";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";

import { apiJson } from "@/lib/api-client-shared";

interface ReadinessIssue {
  code: string;
  title: string;
  description: string;
  severity: "blocker" | "warning";
  actionUrl?: string;
}

interface ReadinessData {
  level: "ready" | "not_ready";
  issues: ReadinessIssue[];
}

export default function SetupChecklistPage() {
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReadiness = async () => {
      try {
        setLoading(true);
        const data = await apiJson<ReadinessData>("/api/merchant/readiness");
        setReadiness(data);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("[LOAD_READINESS_ERROR]", {
          error: message,
          app: "merchant",
        });
      } finally {
        setLoading(false);
      }
    };
    void loadReadiness();
  }, []);

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="animate-spin h-5 w-5" /> Loading setup status...
      </div>
    );

  const issues = readiness?.issues || [];
  const isReady = readiness?.level === "ready";

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-4">Store Setup Checklist</h1>
      <p className="text-gray-500 mb-8">
        Complete these steps to unlock your storefront and go live.
      </p>

      {isReady ? (
        <div className="bg-green-50 border border-green-100 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name={"Check"} size={32} />
          </div>
          <h2 className="text-xl font-bold text-green-800">
            You are ready to go live!
          </h2>
          <p className="text-green-600 mt-2">
            All systems systems operational.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.code}
              className={`p-6 rounded-xl border flex gap-4 ${
                issue.severity === "blocker"
                  ? "bg-red-50 border-red-100"
                  : "bg-yellow-50 border-yellow-100"
              }`}
            >
              <div
                className={`mt-1 ${issue.severity === "blocker" ? "text-red-500" : "text-yellow-500"}`}
              >
                <Icon
                  name={
                    (issue.severity === "blocker"
                      ? "AlertOctagon"
                      : "AlertTriangle") as IconName
                  }
                  size={24}
                />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-bold ${
                    issue.severity === "blocker"
                      ? "text-red-900"
                      : "text-yellow-900"
                  }`}
                >
                  {issue.title}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    issue.severity === "blocker"
                      ? "text-red-700"
                      : "text-yellow-700"
                  }`}
                >
                  {issue.description}
                </p>
              </div>
              <div className="flex items-center">
                {issue.actionUrl && (
                  <a
                    href={issue.actionUrl}
                    className="px-4 py-2 bg-white  border border-gray-200 shadow-sm rounded-lg text-sm font-bold hover:bg-white"
                  >
                    Fix Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
