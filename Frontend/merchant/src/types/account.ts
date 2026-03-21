import { KYCStatus as SharedKYCStatus } from "@vayva/shared";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface StoreProfile {
  name: string;
  category: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  isPublished: boolean;
  logoUrl?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "removed";
  joinedAt: string;
}

export interface KYCState {
  status: SharedKYCStatus | string;
    documents?: any[];
  submittedAt?: string;
}

export interface SecuritySession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityState {
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  walletPinSet: boolean;
  activeSessions: SecuritySession[];
}

export interface NotificationSettings {
  email: {
    orders: boolean;
    payouts: boolean;
    waApprovals: boolean;
    lowStock: boolean;
  };
  whatsapp: {
    orders: boolean;
    payouts: boolean;
  };
}
