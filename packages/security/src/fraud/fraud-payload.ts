/** Serialized into `FraudCheck.recommendation` (JSON string). */
export type StoredFraudPayload = {
  v: 1;
  orderId: string;
  userAgent: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  paymentMethod: string;
  status: 'pending' | 'approved' | 'declined' | 'review';
  rulesTriggered: unknown[];
  velocityData?: {
    ordersLastHour: number;
    ordersLastDay: number;
    amountLastHour: number;
    uniqueCountries24h: number;
  };
  decision?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

export function parseFraudPayload(raw: string | null | undefined): Partial<StoredFraudPayload> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && (parsed as { v?: number }).v === 1) {
      return parsed as Partial<StoredFraudPayload>;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export function stringifyFraudPayload(payload: StoredFraudPayload): string {
  return JSON.stringify(payload);
}
