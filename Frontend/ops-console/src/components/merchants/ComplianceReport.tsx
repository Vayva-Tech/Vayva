import React from "react";
import { CheckCircle, WarningCircle as AlertCircle, XCircle, Info } from "@phosphor-icons/react/ssr";

interface ComplianceReportProps {
  report: {
    isValid: boolean;
    checks: {
      legalPolicies: boolean;
      productReadiness: boolean;
      brandingReadiness: boolean;
      contentModeration: boolean;
    };
    details: {
      missingPolicies: string[];
      issueCount: number;
      prohibitedWordsFound: string[];
      productCount: number;
    };
  };
}

export function ComplianceReport({
  report,
}: ComplianceReportProps): React.JSX.Element {
  const { checks, details, isValid } = report;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div
        className={`p-4 flex items-center justify-between border-b ${isValid ? "bg-green-50" : "bg-red-50"}`}
      >
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="text-green-600" size={20} />
          ) : (
            <AlertCircle className="text-red-600" size={20} />
          )}
          <h3
            className={`font-bold ${isValid ? "text-green-900" : "text-red-900"}`}
          >
            Compliance Report
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {isValid ? "PASSED" : "ACTION REQUIRED"}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Check Items */}
        <div className="grid grid-cols-2 gap-4">
          <CheckItem label="Legal Policies" status={checks.legalPolicies} />
          <CheckItem
            label="Product Readiness"
            status={checks.productReadiness}
          />
          <CheckItem
            label="Branding Settings"
            status={checks.brandingReadiness}
          />
          <CheckItem
            label="Content Moderation"
            status={checks.contentModeration}
          />
        </div>

        {/* Details / Issues */}
        {!isValid && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
              Detailed Findings
            </h4>
            <ul className="space-y-2">
              {!checks.legalPolicies && (
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <XCircle
                    size={14}
                    className="text-red-500 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    Missing mandatory policies:{" "}
                    <span className="font-medium">
                      {details.missingPolicies.join(", ")}
                    </span>
                  </span>
                </li>
              )}
              {!checks.productReadiness && (
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <XCircle
                    size={14}
                    className="text-red-500 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    No active products found. Store must have at least 1 active
                    product.
                  </span>
                </li>
              )}
              {!checks.contentModeration && (
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <XCircle
                    size={14}
                    className="text-red-500 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    Prohibited content found:{" "}
                    <span className="font-medium">
                      {details.prohibitedWordsFound.join(", ")}
                    </span>
                  </span>
                </li>
              )}
              {!checks.brandingReadiness && (
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Info
                    size={14}
                    className="text-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <span>
                    Logo or Banner is missing. Highly recommended for a premium
                    experience.
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckItem({
  label,
  status,
}: {
  label: string;
  status: boolean;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      {status ? (
        <CheckCircle className="text-green-500" size={16} />
      ) : (
        <XCircle className="text-red-400" size={16} />
      )}
      <span className={`text-sm ${status ? "text-gray-700" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}
