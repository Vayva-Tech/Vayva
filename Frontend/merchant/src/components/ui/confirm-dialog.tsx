"use client";

import { Button } from "@vayva/ui";
import { motion, AnimatePresence } from "framer-motion";
import { Warning as AlertTriangle } from "@phosphor-icons/react/ssr";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";
  const isWarning = variant === "warning";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-shadow/40  z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
          >
            <div className="bg-white border border-gray-100 rounded-2xl shadow-lg max-w-sm w-full p-6">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDanger
                      ? "bg-status-danger/10 text-status-danger"
                      : isWarning
                        ? "bg-status-warning/10 text-status-warning"
                        : "bg-green-500/10 text-green-500"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3
                    id="confirm-dialog-title"
                    className="text-base font-bold text-gray-900"
                  >
                    {title}
                  </h3>
                  <p
                    id="confirm-dialog-description"
                    className="text-sm text-gray-500 mt-1"
                  >
                    {description}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="rounded-xl px-4"
                >
                  {cancelLabel}
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isLoading}
                  isLoading={isLoading}
                  className={`rounded-xl px-4 ${
                    isDanger
                      ? "bg-status-danger hover:bg-status-danger/90 text-white"
                      : isWarning
                        ? "bg-status-warning hover:bg-status-warning/90 text-white"
                        : ""
                  }`}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
