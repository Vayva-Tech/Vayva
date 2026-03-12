"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@vayva/ui";
import { Shield, UserCheck, AlertTriangle, X, Check, Loader2 } from "lucide-react";

interface TwoPersonApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (approverId: string, approverName: string) => Promise<void>;
  action: string;
  description: string;
  approvers: Array<{ id: string; name: string; email: string; role: string }>;
  currentUserId: string;
  riskLevel: "ultra" | "critical";
}

export function TwoPersonApprovalDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  description,
  approvers,
  currentUserId,
  riskLevel = "ultra",
}: TwoPersonApprovalDialogProps): React.ReactPortal | null {
  const [selectedApprover, setSelectedApprover] = useState<string>("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const filteredApprovers = approvers.filter(
    (a) => a.id !== currentUserId && ["OPS_OWNER", "SUPERVISOR", "OPS_ADMIN"].includes(a.role)
  );

  const handleSubmit = async () => {
    if (!selectedApprover) {
      setError("Please select an approver");
      return;
    }

    if (step === 1) {
      setStep(2);
      setError(null);
      return;
    }

    if (confirmationCode.length < 6) {
      setError("Confirmation code must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const approver = approvers.find((a) => a.id === selectedApprover);
      if (!approver) throw new Error("Approver not found");
      await onConfirm(approver.id, approver.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get approval");
    } finally {
      setIsLoading(false);
    }
  };

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">
                {riskLevel === "ultra" ? "Ultra-High Risk Action" : "Critical Action"}
              </h2>
              <p className="text-red-100 mt-1 text-sm">
                2-Person Approval Required
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Action Description */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">{action}</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{description}</p>
              </div>
            </div>
          </div>

          {/* Step 1: Select Approver */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Approving Officer
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredApprovers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    No eligible approvers found. Requires OPS_OWNER, SUPERVISOR, or OPS_ADMIN role.
                  </div>
                ) : (
                  filteredApprovers.map((approver) => (
                    <button
                      key={approver.id}
                      onClick={() => setSelectedApprover(approver.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                        selectedApprover === approver.id
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-red-200"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold">
                        {approver.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {approver.name}
                        </p>
                        <p className="text-xs text-gray-500">{approver.email}</p>
                        <span className="text-xs font-medium text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {approver.role}
                        </span>
                      </div>
                      {selectedApprover === approver.id && (
                        <Check className="w-5 h-5 text-red-500" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Confirmation Code */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <UserCheck className="w-5 h-5" />
                <span>
                  {approvers.find((a) => a.id === selectedApprover)?.name} must provide their approval code
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Approval Confirmation Code
                </label>
                <input
                  type="password"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter approver's confirmation code"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  The approver must enter their personal confirmation code to authorize this action.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (step === 1 && !selectedApprover)}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2",
                isLoading || (step === 1 && !selectedApprover)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : step === 1 ? (
                "Continue"
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Confirm 2-Person Approval
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
