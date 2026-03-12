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
  setPin: async (pin: string) => {
    const response = await api.post("/payments/wallet/pin/set", { pin });
    return response.data;
  },
  verifyPin: async (pin: string) => {
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
  addBank: async (bank: Record<string, unknown>) => {
    const response = await api.post("/payments/wallet/banks", bank);
    return response.data;
  },
  deleteBank: async (id: string) => {
    const response = await api.delete(`/payments/wallet/banks/${id}`);
    return response.data;
  },
  initiateWithdrawal: async (payload: Record<string, unknown>) => {
    const response = await api.post(
      "/payments/wallet/withdraw/initiate",
      payload,
    );
    return response.data;
  },
  confirmWithdrawal: async (withdrawalId: string, otpCode: string) => {
    const response = await api.post("/payments/wallet/withdraw/confirm", {
      withdrawalId,
      otpCode,
    });
    return response.data;
  },
  // KYC Integration 4
  submitKyc: async (nin: string, bvn: string) => {
    const response = await api.post("/payments/kyc/submit", { nin, bvn });
    return response.data;
  },
  getKycStatus: async () => {
    const response = await api.get("/payments/kyc/status");
    return response.data;
  },
};
