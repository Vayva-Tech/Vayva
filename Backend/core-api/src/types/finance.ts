export interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  reference: string;
  destination: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
}

export interface PayoutResponse {
  payouts: Payout[];
}

export interface Transaction {
  id: string;
  reference: string;
  type: "CHARGE" | "REFUND" | "PAYOUT";
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  date: string;
  provider: string;
}

export interface TransactionsResponse {
  data: Transaction[];
}
