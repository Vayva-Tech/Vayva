"use client";

import { Badge } from "@vayva/ui";

export type StatusVariant = "default" | "success" | "error" | "warning" | "info";

interface StatusBadgeProps {
  status: string;
  variants?: Record<string, { variant: StatusVariant; label: string }>;
}

const defaultVariants: Record<string, { variant: StatusVariant; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  APPROVED: { variant: "success", label: "Approved" },
  REJECTED: { variant: "error", label: "Rejected" },
  PROCESSED: { variant: "success", label: "Processed" },
  DRAFT: { variant: "warning", label: "Draft" },
  PUBLISHED: { variant: "success", label: "Published" },
  ARCHIVED: { variant: "default", label: "Archived" },
  ACTIVE: { variant: "success", label: "Active" },
  INACTIVE: { variant: "default", label: "Inactive" },
  COMPLETED: { variant: "success", label: "Completed" },
  CANCELLED: { variant: "error", label: "Cancelled" },
  PAID: { variant: "success", label: "Paid" },
  UNPAID: { variant: "warning", label: "Unpaid" },
  REFUNDED: { variant: "error", label: "Refunded" },
  OPEN: { variant: "warning", label: "Open" },
  CLOSED: { variant: "default", label: "Closed" },
  CONFIRMED: { variant: "success", label: "Confirmed" },
  SOLD: { variant: "success", label: "Sold" },
  RENTED: { variant: "success", label: "Rented" },
  AVAILABLE: { variant: "success", label: "Available" },
  MAINTENANCE: { variant: "warning", label: "Maintenance" },
  RESERVED: { variant: "info", label: "Reserved" },
  VERIFIED: { variant: "success", label: "Verified" },
  UNVERIFIED: { variant: "warning", label: "Unverified" },
  // Rescue incident statuses
  REPORTED: { variant: "warning", label: "Reported" },
  DISPATCHED: { variant: "info", label: "Dispatched" },
  IN_PROGRESS: { variant: "warning", label: "In Progress" },
  RESOLVED: { variant: "success", label: "Resolved" },
  // Priority levels
  LOW: { variant: "default", label: "Low" },
  MEDIUM: { variant: "info", label: "Medium" },
  HIGH: { variant: "warning", label: "High" },
  URGENT: { variant: "error", label: "Urgent" },
};

export function StatusBadge({ status, variants = defaultVariants }: StatusBadgeProps) {
  const config = variants[status.toUpperCase()] || { variant: "default", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
