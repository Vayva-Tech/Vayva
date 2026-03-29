export declare function sendMerchantInvite(to: string, args: {
    storeName: string;
    inviterName: string;
    acceptUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendPasswordReset(to: string, args: {
    resetUrl: string;
    minutes: number;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendOrderConfirmed(to: string, args: {
    refCode: string;
    orderUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendPaymentReceived(to: string, args: {
    refCode: string;
    paymentReference: string;
    receiptUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendWelcome(to: string, args: {
    merchantName: string;
    storeName: string;
    dashboardUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendShippingUpdate(to: string, args: {
    refCode: string;
    status: string;
    trackingUrl?: string;
    orderUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendOrderCancelled(to: string, args: {
    refCode: string;
    reason?: string;
    orderUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendRefundProcessed(to: string, args: {
    refCode: string;
    amount: string;
    currency: string;
    orderUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendSubscriptionActivated(to: string, args: {
    planName: string;
    storeName: string;
    billingUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendTrialExpiring(to: string, args: {
    storeName: string;
    daysLeft: number;
    billingUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendLowStockAlert(to: string, args: {
    storeName: string;
    products: Array<{
        name: string;
        remaining: number;
    }>;
    inventoryUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendKycStatus(to: string, args: {
    storeName: string;
    status: "VERIFIED" | "REJECTED";
    reason?: string;
    dashboardUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendDisputeOpened(to: string, args: {
    refCode: string;
    reason: string;
    responseDeadline: string;
    disputeUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
export declare function sendRefundRequested(to: string, args: {
    refCode: string;
    customerName: string;
    amount: string;
    currency: string;
    reason?: string;
    orderUrl: string;
}): Promise<import("resend").CreateEmailResponse>;
/** Generic HTML email (e.g. compliance SLA alerts). */
export declare function sendEmail(args: {
    to: string | string[];
    cc?: string[];
    subject: string;
    html: string;
    tags?: string[];
}): Promise<import("resend").CreateEmailResponse>;
//# sourceMappingURL=send.d.ts.map