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
    subtotal: number;
    shippingTotal: number;
    paymentStatus: string;
    createdAt: string;
  };
  store: {
    name: string;
    slug: string;
  };
  externalTrackingUrl: string | null;
  payment?: {
    cod: { amount: number | null; includesDelivery: boolean } | null;
  };
  live?: {
    provider: string;
    rider: { name: string | null; phone: string | null; location: LatLng | null } | null;
    pickup: { location: LatLng | null } | null;
    delivery: { location: LatLng | null } | null;
    rawStatus: string | number | null;
    lastSyncAt: string;
  } | null;
  lastUpdated: string;
}

export interface TrackingEvent {
  status: string;
  location: string | null;
  note: string | null;
  timestamp: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}
