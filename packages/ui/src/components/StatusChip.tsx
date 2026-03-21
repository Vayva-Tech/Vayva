import React from "react";
import { cn } from "../utils";

type StatusType = "success" | "warning" | "error" | "neutral" | "info";

interface StatusChipProps {
  status: string;
  type?: StatusType;
  className?: string;
}

export function StatusChip({
  status,
  type = "neutral",
  className,
}: StatusChipProps) {
  const styles = {
    success: "bg-green-50 text-green-600 border-green-200",
    warning: "bg-orange-50 text-orange-600 border-orange-200",
    error: "bg-red-50 text-red-600 border-red-200",
    neutral: "bg-gray-100 text-gray-600 border-gray-200 font-bold",
    info: "bg-blue-50 text-blue-600 border-blue-200",
  };

  // Simple auto-detection if type is not explicit
  const detectType = (s: string): StatusType => {
    const sl = s.toLowerCase();
    if (["paid", "active", "delivered", "completed", "verified"].includes(sl))
      return "success";
    if (["pending", "processing", "draft"].includes(sl)) return "warning";
    if (["failed", "cancelled", "rejected", "error"].includes(sl))
      return "error";
    return "neutral";
  };

  const finalType = type === "neutral" ? detectType(status) : type;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        styles[finalType],
        className,
      )}
    >
      {status}
    </span>
  );
}
