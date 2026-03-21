export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
export type CreditTransactionType = 'charge' | 'payment' | 'adjustment' | 'interest';
export type RequisitionStatus = 'pending' | 'approved' | 'rejected' | 'ordered';
export type RequisitionUrgency = 'low' | 'normal' | 'high' | 'urgent';

export interface Quote {
  id: string;
  storeId: string;
  customerId: string;
  quoteNumber: string;
  status: QuoteStatus;
  expiryDate: Date;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  terms: string | null;
  notes: string | null;
  convertedToOrderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: QuoteItem[];
  customerName?: string;
}

export interface CreateQuoteInput {
  customerId: string;
  expiryDate: Date;
  terms?: string;
  notes?: string;
  items: CreateQuoteItemInput[];
}

export interface UpdateQuoteInput {
  status?: QuoteStatus;
  expiryDate?: Date;
  terms?: string;
  notes?: string;
  convertedToOrderId?: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  productName?: string;
  productImage?: string;
}

export interface CreateQuoteItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreditAccount {
  id: string;
  storeId: string;
  customerId: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  paymentTerms: string;
  interestRate: number;
  isActive: boolean;
  approvedBy: string;
  approvedAt: Date;
  transactions: CreditTransaction[];
  customerName?: string;
}

export interface CreateCreditAccountInput {
  customerId: string;
  creditLimit: number;
  paymentTerms?: string;
  interestRate?: number;
}

export interface UpdateCreditAccountInput {
  creditLimit?: number;
  paymentTerms?: string;
  interestRate?: number;
  isActive?: boolean;
}

export interface CreditTransaction {
  id: string;
  accountId: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  referenceId: string | null;
  description: string;
  createdAt: Date;
  createdBy: string;
}

export interface CreateCreditTransactionInput {
  type: CreditTransactionType;
  amount: number;
  referenceId?: string;
  description: string;
}

export interface Requisition {
  id: string;
  storeId: string;
  customerId: string;
  requesterName: string;
  requesterEmail: string;
  approverId: string | null;
  status: RequisitionStatus;
  urgency: RequisitionUrgency;
  neededBy: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: RequisitionItem[];
  customerName?: string;
}

export interface CreateRequisitionInput {
  customerId: string;
  requesterName: string;
  requesterEmail: string;
  urgency?: RequisitionUrgency;
  neededBy?: Date;
  notes?: string;
  items: CreateRequisitionItemInput[];
}

export interface UpdateRequisitionInput {
  status?: RequisitionStatus;
  approverId?: string;
  urgency?: RequisitionUrgency;
  neededBy?: Date;
  notes?: string;
}

export interface RequisitionItem {
  id: string;
  requisitionId: string;
  productId: string;
  quantity: number;
  maxPrice: number | null;
  notes: string | null;
  productName?: string;
  productImage?: string;
}

export interface CreateRequisitionItemInput {
  productId: string;
  quantity: number;
  maxPrice?: number;
  notes?: string;
}

export interface CustomerHierarchy {
  id: string;
  parentId: string;
  childId: string;
  relationship: 'subsidiary' | 'franchise' | 'branch';
  createdAt: Date;
}

export interface CreateCustomerHierarchyInput {
  parentId: string;
  childId: string;
  relationship: 'subsidiary' | 'franchise' | 'branch';
}

export interface B2BAnalytics {
  totalQuotes: number;
  quotesByStatus: Record<QuoteStatus, number>;
  quoteConversionRate: number;
  averageQuoteValue: number;
  totalCreditExtended: number;
  outstandingCredit: number;
  creditUtilizationRate: number;
  overdueAccounts: number;
  totalRequisitions: number;
  requisitionsByStatus: Record<RequisitionStatus, number>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalRevenue: number;
    creditLimit: number;
    currentBalance: number;
    availableCredit: number;
  }>;
  pendingApprovals: number;
  recentActivity: Array<{
    type: 'quote' | 'credit' | 'requisition';
    action: string;
    customerName: string;
    amount?: number;
    date: Date;
  }>;
}

export interface QuoteFilters {
  status?: QuoteStatus;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface RequisitionFilters {
  status?: RequisitionStatus;
  customerId?: string;
  urgency?: RequisitionUrgency;
}

export interface CreditAccountFilters {
  customerId?: string;
  isActive?: boolean;
  hasBalance?: boolean;
}
