import {
    PaystackTransactionInitialize,
    PaystackTransactionVerify,
    PaystackAccountResolve
} from "@/types/billing";
import { Paystack } from "@vayva/payments";

interface PaystackMetadata {
    [key: string]: string | number | boolean | undefined;
}

interface PaystackVerificationResult {
    raw?: {
        data?: PaystackTransactionVerify;
    };
}

export const PaystackService = {
    async initializeTransaction(
        email: string, 
        amount: number,
        reference: string, 
        callbackUrl: string, 
        metadata: PaystackMetadata = {}
    ): Promise<PaystackTransactionInitialize> {
        const init = await Paystack.initializeTransaction({
            email,
            amountKobo: amount,
            reference,
            callbackUrl,
            metadata,
        });
        return {
            authorization_url: init.authorizationUrl,
            access_code: init.accessCode,
            reference: init.reference,
        };
    },
    
    async verifyTransaction(reference: string): Promise<PaystackTransactionVerify> {
        const verified = await Paystack.verifyTransaction(reference);
        return ((verified as unknown as PaystackVerificationResult).raw?.data as unknown as PaystackTransactionVerify) ?? null;
    },
    
    async resolveBankAccount(accountNumber: string, bankCode: string): Promise<PaystackAccountResolve> {
        const data = await Paystack.resolveAccount(accountNumber, bankCode);
        return data as PaystackAccountResolve;
    },
};
