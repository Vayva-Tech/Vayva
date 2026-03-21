import React from "react";
import { AccountOverview } from "@vayva/shared";
import { Icon, cn } from "@vayva/ui";

interface DependencyMatrixProps {
  blockingIssues: AccountOverview["blockingIssues"];
}

export const DependencyMatrix = ({ blockingIssues }: DependencyMatrixProps) => {
  if (blockingIssues.length === 0) {
    return (
      <div className="mt-8 bg-gradient-to-r from-green-50 to-green-50 rounded-2xl border border-green-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <Icon name="Check" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900">
              All Systems Operational
            </h3>
            <p className="text-green-700 text-sm">
              Your account is fully set up. No blocking issues detected.
            </p>
          </div>
        </div>
        <div className="text-green-800 text-xs font-mono bg-gray-50 px-3 py-1 rounded-full border border-green-200">
          STATUS: HEALTHY
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Icon name="Activity" size={16} />
        Action Required
      </h3>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-border/40 overflow-hidden">
        {blockingIssues.map((issue) => (
          <div
            key={issue.id}
            className="p-4 flex flex-col md:flex-row md:items-center gap-4 group hover:bg-red-50/10 transition-colors"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                issue.severity === "critical"
                  ? "bg-red-100 text-red-600"
                  : "bg-orange-100 text-orange-600",
              )}
            >
              <Icon
                name={issue.severity === "critical" ? "CircleX" : "Info"}
                size={20}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{issue.title}</h4>
              <p className="text-sm text-gray-400">{issue.description}</p>
            </div>
            <a
              href={issue.actionUrl}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              Fix Issue <Icon name="ArrowRight" size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
