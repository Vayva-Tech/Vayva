"use client";

import { useState } from "react";
import { Button } from "@vayva/ui";
import { Flag } from "@phosphor-icons/react/ssr";

export function ReportProductDialog({
  productId,
}: {
  productId: string;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "PRODUCT",
          entityId: productId,
          reason,
          details,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch {
      alert("Failed to report");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    if (!isOpen) return <ReportTrigger onClick={() => setIsOpen(true)} />;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
          <h3 className="font-bold text-lg mb-2">Thank you</h3>
          <p className="text-gray-600">
            We will review this product within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReportTrigger onClick={() => setIsOpen(true)} />

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="font-bold text-lg mb-4">Report this Product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="report-reason"
                  className="block text-sm font-medium mb-1"
                >
                  Reason
                </label>
                <select
                  id="report-reason"
                  className="w-full p-2 border rounded"
                  value={reason}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => setReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="PROHIBITED">
                    Prohibited Item (Drugs, Weapons)
                  </option>
                  <option value="OFFENSIVE">Offensive / Hateful Content</option>
                  <option value="FRAUD">Fraud / Scam</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="report-details"
                  className="block text-sm font-medium mb-1"
                >
                  Details
                </label>
                <textarea
                  id="report-details"
                  className="w-full p-2 border rounded"
                  rows={3}
                  value={details}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => setDetails(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  isLoading={submitting}
                  disabled={!reason}
                >
                  Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ReportTrigger({
  onClick,
}: {
  onClick: () => void;
}): React.JSX.Element {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors mt-6 h-auto p-0"
    >
      <Flag size={12} />
      <span>Report this product</span>
    </Button>
  );
}
