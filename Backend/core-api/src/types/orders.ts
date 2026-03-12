export interface OrderCustomer {
  name: string;
  email: string | null;
  phone: string | null;
}

export interface OrderPayment {
  reference: string;
  paidAt: string | null;
}

export interface OrderShipment {
  status: string;
  carrier: string;
  trackingId: string | null;
}

export interface OrderRow {
  id: string;
  refCode: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  customer: OrderCustomer;
  payment: OrderPayment | null;
  shipment: OrderShipment | null;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
}

export interface OrdersApiResponse {
  data: OrderRow[];
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
  // Legacy support if needed, but we should standardize
  items?: OrderRow[];
  nextCursor?: string | null;
}
