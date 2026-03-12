export interface NightlifeMetrics {
  revenue: number;
  revenueChange?: number;
  covers: number;
  coversChange?: number;
  vipCount: number;
  vipCountChange?: number;
  bottleSales: number;
  bottleSalesChange?: number;
  occupancyRate: number;
  occupancyChange?: number;
  waitTime?: string;
  walksCount: number;
}

export interface VenueStatus {
  isOpen: boolean;
  capacity: number;
  currentOccupancy: number;
  nextEvent?: {
    name: string;
    startTime: Date;
  };
  staffOnDuty: number;
  securityActive: boolean;
}

export interface Table {
  id: string;
  venueId: string;
  tableNumber: string;
  capacity: number;
  minSpend: number;
  tableType: 'standard' | 'vip' | 'booth' | 'stage_front' | 'private_room';
  location?: string;
  status: 'available' | 'reserved' | 'occupied' | 'offline';
  currentRevenue: number;
  isAvailable?: boolean;
}

export interface VIPGuest {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  email?: string;
  category: 'celebrity' | 'high_roller' | 'special_occasion' | 'regular_vip';
  tableId?: string;
  tableName?: string;
  guestCount: number;
  minimumSpend?: number;
  depositPaid: number;
  specialRequests?: string;
  isOnList: boolean;
  hasArrived: boolean;
  checkedInAt?: Date;
  promoterId?: string;
  occasion?: string;
}

export interface BottleOrder {
  id: string;
  tableId: string;
  tableName: string;
  items: Array<{
    bottle: {
      id: string;
      name: string;
      brand: string;
      type: string;
      price: number;
      quantity: number;
    };
    quantity: number;
    mixers?: Array<{
      name: string;
      quantity: number;
      brand?: string;
    }>;
  }>;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'delivered' | 'completed';
  notes?: string;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface PromoterSale {
  id: string;
  promoterId: string;
  promoterName: string;
  eventId: string;
  guestCount: number;
  barRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  date: Date;
}

export interface SecurityIncident {
  id: string;
  eventId: string;
  venueId: string;
  type: 'intoxication' | 'fake_id' | 'altercation' | 'medical' | 'noise' | 'other';
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved' | 'escalated';
  officerName: string;
  officerId: string;
  involvedPersons?: string[];
  actionsTaken?: string;
  resolvedAt?: Date;
  reportedAt: Date;
}

export interface DoorEntry {
  id: string;
  eventId: string;
  venueId: string;
  timestamp: Date;
  gender: 'male' | 'female' | 'other';
  ageGroup: '21-25' | '26-30' | '31-35' | '35+';
  entryType: 'general' | 'vip' | 'guest_list' | 'comp';
  coverCharge: number;
  idVerified: boolean;
  denied: boolean;
  denialReason?: string;
}
