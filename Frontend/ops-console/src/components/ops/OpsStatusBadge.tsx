"use client";

import React from "react";
import { cn } from "@vayva/ui";

type BadgeVariant = "default" | "success" | "error" | "warning" | "info" | "pending";

interface OpsStatusBadgeProps {
  status: string;
  customVariants?: Record<string, { variant: BadgeVariant; label: string }>;
  className?: string;
}

const defaultVariants: Record<string, { variant: BadgeVariant; label: string }> = {
  // KYC Statuses
  PENDING: { variant: "pending", label: "Pending" },
  UNDER_REVIEW: { variant: "warning", label: "Under Review" },
  VERIFIED: { variant: "success", label: "Verified" },
  APPROVED: { variant: "success", label: "Approved" },
  REJECTED: { variant: "error", label: "Rejected" },
  NOT_SUBMITTED: { variant: "default", label: "Not Submitted" },

  // Merchant/Account Statuses
  ACTIVE: { variant: "success", label: "Active" },
  INACTIVE: { variant: "default", label: "Inactive" },
  SUSPENDED: { variant: "error", label: "Suspended" },
  SUSPEND: { variant: "error", label: "Suspended" },
  SUSPENDED_PENDING_REVIEW: { variant: "warning", label: "Under Review" },

  // Payment/Financial Statuses
  PAID: { variant: "success", label: "Paid" },
  UNPAID: { variant: "warning", label: "Unpaid" },
  REFUNDED: { variant: "error", label: "Refunded" },
  PARTIAL_REFUND: { variant: "warning", label: "Partial Refund" },
  PAYOUT_ENABLED: { variant: "success", label: "Enabled" },
  PAYOUT_DISABLED: { variant: "error", label: "Disabled" },

  // Order/Transaction Statuses
  COMPLETED: { variant: "success", label: "Completed" },
  PROCESSING: { variant: "info", label: "Processing" },
  SHIPPED: { variant: "info", label: "Shipped" },
  DELIVERED: { variant: "success", label: "Delivered" },
  CANCELLED: { variant: "error", label: "Cancelled" },
  FAILED: { variant: "error", label: "Failed" },

  // Support/Ticket Statuses
  OPEN: { variant: "warning", label: "Open" },
  IN_PROGRESS: { variant: "info", label: "In Progress" },
  RESOLVED: { variant: "success", label: "Resolved" },
  CLOSED: { variant: "default", label: "Closed" },
  ESCALATED: { variant: "error", label: "Escalated" },

  // Priority Levels
  LOW: { variant: "default", label: "Low" },
  MEDIUM: { variant: "info", label: "Medium" },
  HIGH: { variant: "warning", label: "High" },
  CRITICAL: { variant: "error", label: "Critical" },
  URGENT: { variant: "error", label: "Urgent" },

  // Alert/Risk Statuses
  FLAGGED: { variant: "error", label: "Flagged" },
  CLEAN: { variant: "success", label: "Clean" },
  WARNING: { variant: "warning", label: "Warning" },
  INFO: { variant: "info", label: "Info" },

  // Approval Statuses
  DRAFT: { variant: "default", label: "Draft" },
  PUBLISHED: { variant: "success", label: "Published" },
  ARCHIVED: { variant: "default", label: "Archived" },

  // Identity Verification
  NIN_VERIFIED: { variant: "success", label: "NIN Verified" },
  BVN_VERIFIED: { variant: "success", label: "BVN Verified" },
  CAC_VERIFIED: { variant: "success", label: "CAC Verified" },
  NIN_PENDING: { variant: "pending", label: "NIN Pending" },
  BVN_PENDING: { variant: "pending", label: "BVN Pending" },
  CAC_PENDING: { variant: "pending", label: "CAC Pending" },

  // Subscription/Plan Statuses
  FREE: { variant: "default", label: "Free" },
  STARTER: { variant: "info", label: "Starter" },
  PRO: { variant: "success", label: "Pro" },
  ENTERPRISE: { variant: "success", label: "Enterprise" },
  TRIAL: { variant: "warning", label: "Trial" },
  TRIAL_EXPIRED: { variant: "error", label: "Trial Expired" },

  // Onboarding Statuses
  ONBOARDING_COMPLETE: { variant: "success", label: "Complete" },
  ONBOARDING_IN_PROGRESS: { variant: "info", label: "In Progress" },
  STORE_SETUP: { variant: "warning", label: "Store Setup" },
  KYC_REQUIRED: { variant: "warning", label: "KYC Required" },
  PAYMENT_SETUP: { variant: "warning", label: "Payment Setup" },

  // Webhook/Integration Statuses
  CONNECTED: { variant: "success", label: "Connected" },
  DISCONNECTED: { variant: "error", label: "Disconnected" },
  SYNCING: { variant: "info", label: "Syncing" },
  ERROR: { variant: "error", label: "Error" },
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-green-100 text-green-700 border-green-200",
  error: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-orange-100 text-orange-700 border-orange-200",
};

export function OpsStatusBadge({
  status,
  customVariants,
  className,
}: OpsStatusBadgeProps): React.JSX.Element {
  const normalizedStatus = status.toUpperCase().replace(/-/g, "_");
  const variants = { ...defaultVariants, ...customVariants };
  const config = variants[normalizedStatus] || { variant: "default", label: status };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[config.variant],
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Specialized badge components for common use cases
interface KycStatusBadgeProps {
  status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "NOT_SUBMITTED" | string;
  className?: string;
}

export function KycStatusBadge({ status, className }: KycStatusBadgeProps): React.JSX.Element {
  return <OpsStatusBadge status={status} className={className} />;
}

interface MerchantStatusBadgeProps {
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "SUSPEND" | string;
  className?: string;
}

export function MerchantStatusBadge({ status, className }: MerchantStatusBadgeProps): React.JSX.Element {
  return <OpsStatusBadge status={status} className={className} />;
}

interface PaymentStatusBadgeProps {
  status: "PAID" | "UNPAID" | "REFUNDED" | "PARTIAL_REFUND" | string;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps): React.JSX.Element {
  return <OpsStatusBadge status={status} className={className} />;
}

interface PriorityBadgeProps {
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "URGENT" | string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps): React.JSX.Element {
  return <OpsStatusBadge status={priority} className={className} />;
}

interface RiskBadgeProps {
  risk: "CLEAN" | "FLAGGED" | "WARNING" | "LOW" | "MEDIUM" | "HIGH" | string;
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps): React.JSX.Element {
  // Map risk levels to status variants
  const riskStatus = risk === "CLEAN" ? "CLEAN" : risk === "FLAGGED" ? "FLAGGED" : risk;
  return <OpsStatusBadge status={riskStatus} className={className} />;
}
