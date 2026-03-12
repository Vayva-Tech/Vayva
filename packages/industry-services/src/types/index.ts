// ============================================================================
// Services Industry Types
// ============================================================================

export interface Service {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  price: number;
  category?: string;
  active: boolean;
  bookingBuffer: number; // buffer time in minutes
}

export interface Booking {
  id: string;
  storeId: string;
  customerId: string;
  serviceId: string;
  staffId?: string;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes?: string;
  reminderSent?: boolean;
  createdAt: Date;
}

export interface StaffMember {
  id: string;
  storeId: string;
  name: string;
  role: string;
  servicesOffered: string[];
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breaks?: Array<{ start: string; end: string }>;
  }>;
  utilizationRate?: number;
}

export interface ServicesMetrics {
  bookingsToday: number;
  revenue: number;
  utilizationRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageServiceValue: number;
}
