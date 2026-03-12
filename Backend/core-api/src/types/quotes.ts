export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  items: QuoteItem[];
  total: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | string;
  validUntil: string;
  createdAt: string;
}

export interface QuotesResponse {
  quotes: Quote[];
}
