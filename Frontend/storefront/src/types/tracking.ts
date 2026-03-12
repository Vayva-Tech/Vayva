export interface TrackingInfo {
  code: string;
  status: string;
  statusLabel: string;
  statusDescription: string;
  provider: string;
  estimatedDelivery: string | null;
  timeline: TrackingEvent[];
  recipient: {
    name: string | null;
    phone: string | null;
    address: {
      line1: string | null;
      city: string | null;
      state: string | null;
    };
  };
  order: {
    refCode: string;
    total: number;
    createdAt: string;
  };
  store: {
    name: string;
    slug: string;
  };
  externalTrackingUrl: string | null;
  lastUpdated: string;
}

export interface TrackingEvent {
  status: string;
  location: string | null;
  note: string | null;
  timestamp: string;
}
