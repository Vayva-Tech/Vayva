export type PaystackInitArgs = {
    email: string;
    amountKobo: number;
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
};
export type PaystackInitResult = {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
};
export type PaystackVerifyResult = {
    status: "success" | "failed" | "abandoned" | "ongoing" | "reversed" | "unknown";
    amountKobo: number | null;
    paidAt: string | null;
    gatewayResponse: string | null;
    raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};
export type PaystackTransferRecipientResult = {
    recipientCode: string;
    raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};
export type PaystackTransferResult = {
    transferCode: string;
    status: string;
    raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};
export type PaystackRefundResult = {
    id: string;
    status: string;
    amount: number;
    currency: string;
    rawData: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};
export type PaystackBank = {
    id: number;
    name: string;
    slug: string;
    code: string;
    longcode: string;
    type: string;
    country: string;
    currency: string;
};
export type PaystackResolvedAccount = {
    account_number: string;
    account_name: string;
    bank_id: number;
};
export type PaystackCustomerCreateResult = {
    customerCode: string;
    raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};
export type PaystackDedicatedVirtualAccountResult = {
    accountNumber: string;
    accountName: string;
    bankName: string;
    providerRef: string;
    raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
};
/**
 * Standard Paystack API envelope.
 * Every Paystack endpoint returns `{ status, message, data }` at the top level.
 */
export interface PaystackApiResponse<T = Record<string, unknown>> {
    status: boolean;
    message: string;
    data: T;
}
export declare const Paystack: {
    createCustomer(args: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        metadata?: Record<string, unknown>;
    }): Promise<PaystackCustomerCreateResult>;
    createDedicatedVirtualAccount(args: {
        customerCode: string;
        preferredBank?: string;
    }): Promise<PaystackDedicatedVirtualAccountResult>;
    initializeTransaction(args: PaystackInitArgs): Promise<PaystackInitResult>;
    verifyTransaction(reference: string): Promise<PaystackVerifyResult>;
    createTransferRecipient(args: {
        name: string;
        accountNumber: string;
        bankCode: string;
    }): Promise<PaystackTransferRecipientResult>;
    initiateTransfer(args: {
        amountKobo: number;
        recipientCode: string;
        reference?: string;
        reason?: string;
    }): Promise<PaystackTransferResult>;
    verifyTransfer(reference: string): Promise<{
        status: string;
        transferCode: string | undefined;
        raw: PaystackApiResponse<Record<string, unknown> | unknown[] | null>;
    }>;
    getBanks(): Promise<PaystackBank[]>;
    resolveAccount(accountNumber: string, bankCode: string): Promise<PaystackResolvedAccount>;
    createRefund(args: {
        transaction: string;
        amount?: number;
        customer_note?: string;
        merchant_note?: string;
    }): Promise<PaystackRefundResult>;
};
//# sourceMappingURL=paystack.d.ts.map