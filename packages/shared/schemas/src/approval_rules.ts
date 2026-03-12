import { ApprovalType, Role } from "./enums";

export const ApprovalRules = {
  [ApprovalType.REFUND]: {
    requiresApproval: true,
    autoApproveThreshold: 0, // Always requires approval
    approverRoles: [Role.OWNER, Role.ADMIN],
    expiryHours: 24,
  },
  [ApprovalType.DISCOUNT]: {
    requiresApproval: true,
    autoApproveThreshold: 5000, // Amounts under 5000 NGN might auto-approve (example logic)
    approverRoles: [Role.OWNER, Role.ADMIN],
    expiryHours: 24,
  },
  [ApprovalType.DELIVERY_SCHEDULE]: {
    requiresApproval: true, // Verification of weird slots
    autoApproveThreshold: null,
    approverRoles: [Role.OWNER, Role.ADMIN, Role.OPS_ADMIN],
    expiryHours: 4, // Tighter window for logistics
  },
  [ApprovalType.STATUS_CHANGE]: {
    requiresApproval: true,
    autoApproveThreshold: null,
    approverRoles: [Role.OPS_ADMIN, Role.OPS_AGENT], // Internal ops only
    expiryHours: 48,
  },
};

export const DEFAULT_APPROVAL_EXPIRY_HOURS = 24;
