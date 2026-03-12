import { User } from "../types";

/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        [key: string]: unknown;
    };
}

/**
 * Common API Error Codes
 */
export enum ApiErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    UNAUTHENTICATED = "UNAUTHENTICATED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

/**
 * Auth Domain Interfaces
 */
export interface LoginRequest {
    email: string;
    password?: string;
    otp?: string;
    rememberMe?: boolean;
}

export interface RegisterRequest {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
}

export interface AuthResponseData {
    user: User;
    token?: string;
}

/**
 * Staff Domain Interfaces
 */
export interface InviteStaffRequest {
    email: string;
    role: string;
}

export interface AcceptInviteRequest {
    token: string;
    password?: string;
}

/**
 * Dispute Domain Interfaces
 */
export interface DisputeResponseData {
    disputeId: string;
}

/**
 * Search Domain Interfaces
 */
export interface SearchResult {
    id: string;
    title: string;
    price: number;
    currency: string;
    category: string;
    location: string;
    image: string;
    mode: "CHECKOUT" | "REQUEST_QUOTE";
    merchant: {
        name: string;
        isVerified: boolean;
    };
    isPromoted: boolean;
    isChinaBulk: boolean;
    moq: number | null;
}

export interface SearchResponseData {
    results: SearchResult[];
}

/**
 * Product Domain Interfaces
 */
export interface ProductResponseData {
    product: Record<string, unknown>;
}

/**
 * Merchant Ops Domain Interfaces
 */
export interface MerchantListItem {
    id: string;
    name: string;
    slug: string;
    ownerEmail: string;
    plan: string;
    kycStatus: string;
    createdAt: string;
    lastActive: string;
}

export interface MerchantListResponseData {
    merchants: MerchantListItem[];
}

/**
 * KYC Domain Interfaces
 */
export interface KycListItem {
    id: string;
    storeId: string;
    storeName: string;
    ownerName: string;
    method: string;
    provider: string;
    status: string;
    attemptTime: string;
    plan: string;
}

export interface KycListResponseData {
    records: KycListItem[];
}

/**
 * Ops Users Domain Interfaces
 */
export interface OpsUserListItem {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
}

export interface UserCreateResult {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    tempPassword?: string;
}

/**
 * Ops Auth Domain Interfaces
 */
export interface OpsLoginResponseData {
    success: boolean;
    role: string;
}

/**
 * Support Domain Interfaces
 */
export interface TicketResponseData {
    id: string;
    subject: string;
    status: string;
    store?: {
        name: string;
        category: string;
    };
    handoffEvents: unknown[];
}

