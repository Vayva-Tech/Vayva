export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  metadata?: Record<string, unknown>;
}

export interface CreateBookingData {
  serviceId: string;
  startsAt: Date;
  endsAt?: Date;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  notes?: string;
}

export interface UpdateBookingData extends Partial<CreateBookingData> {
  status?: string;
}

// Result of findMany with include
export interface BookingWithDetails {
  id: string;
  storeId: string;
  serviceId: string;
  customerId: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  notes: string | null;
  service: {
    id: string;
    title: string;
    price: unknown; // Prisma.Decimal (Legacy any kept for build stability in dashboard-industry)
    metadata: Record<string, unknown>;
  };
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}
