import { api } from "./api";
export const PaymentService = {
    listTransactions: async () => {
        const response = await api.get("/payments/transactions");
        return response.data;
    },
    // Wallet APIs
    getWalletSummary: async () => {
        const response = await api.get("/payments/wallet/summary");
        return response.data;
    },
    getLedger: async () => {
        const response = await api.get("/payments/wallet/ledger");
        return response.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPin: async (pin: any) => {
        const response = await api.post("/payments/wallet/pin/set", { pin });
        return response.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verifyPin: async (pin: any) => {
        const response = await api.post("/payments/wallet/pin/verify", { pin });
        return response.data;
    },
    createVirtualAccount: async () => {
        const response = await api.post("/payments/wallet/virtual-account/create");
        return response.data;
    },
    // Bank & Withdrawals
    listBanks: async () => {
        const response = await api.get("/payments/wallet/banks");
        return response.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addBank: async (bank: any) => {
        const response = await api.post("/payments/wallet/banks", bank);
        return response.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteBank: async (id: any) => {
        const response = await api.delete(`/payments/wallet/banks/${id}`);
        return response.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initiateWithdrawal: async (payload: any) => {
        const response = await api.post("/payments/wallet/withdraw/initiate", payload);
        return response.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    confirmWithdrawal: async (withdrawalId: any, otpCode: any) => {
        const response = await api.post("/payments/wallet/withdraw/confirm", {
            withdrawalId,
            otpCode,
        });
        return response.data;
    },
    // KYC Integration 4
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submitKyc: async (nin: any, bvn: any) => {
        const response = await api.post("/payments/kyc/submit", { nin, bvn });
        return response.data;
    },
    getKycStatus: async () => {
        const response = await api.get("/payments/kyc/status");
        return response.data;
    },
};
