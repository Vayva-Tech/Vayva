/**
 * Table Reservation Manager Service
 * Handles VIP table bookings and bottle service
 */

import { z } from 'zod';

export interface TableReservation {
  id: string;
  eventId: string;
  customerName: string;
  contactPhone: string;
  tableNumber: string;
  partySize: number;
  reservationTime: Date;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  minimumSpend: number;
  depositPaid: number;
  bottlesReserved?: number;
  specialRequests?: string;
}

export interface BottlePackage {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  tier: 'standard' | 'premium' | 'luxury';
}

export interface ReservationConfig {
  requireDeposit?: boolean;
  depositPercentage?: number;
  autoConfirm?: boolean;
}

const TableReservationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  customerName: z.string(),
  contactPhone: z.string(),
  tableNumber: z.string(),
  partySize: z.number().min(1),
  reservationTime: z.date(),
  status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'cancelled']),
  minimumSpend: z.number().min(0),
  depositPaid: z.number().min(0),
  bottlesReserved: z.number().optional(),
  specialRequests: z.string().optional(),
});

export class TableReservationManagerService {
  private reservations: Map<string, TableReservation>;
  private bottlePackages: Map<string, BottlePackage>;
  private config: ReservationConfig;

  constructor(config: ReservationConfig = {}) {
    this.config = {
      requireDeposit: true,
      depositPercentage: 20,
      autoConfirm: false,
      ...config,
    };
    this.reservations = new Map();
    this.bottlePackages = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[TABLE_RESERVATION] Initializing service...');
    
    // Initialize bottle packages
    this.addBottlePackage({
      id: 'bp_1',
      name: 'House Selection',
      brand: 'Grey Goose',
      quantity: 1,
      price: 450,
      tier: 'standard',
    });
    this.addBottlePackage({
      id: 'bp_2',
      name: 'Premium Duo',
      brand: 'Don Julio 1942',
      quantity: 2,
      price: 1200,
      tier: 'premium',
    });

    console.log('[TABLE_RESERVATION] Service initialized');
  }

  addBottlePackage(pkg: BottlePackage): void {
    this.bottlePackages.set(pkg.id, pkg);
  }

  createReservation(eventId: string, data: Partial<TableReservation>): TableReservation {
    const deposit = this.config.requireDeposit 
      ? (data.minimumSpend || 0) * (this.config.depositPercentage! / 100)
      : 0;

    const reservation: TableReservation = {
      ...data,
      id: data.id || `res_${Date.now()}`,
      status: this.config.autoConfirm ? 'confirmed' : 'pending',
      depositPaid: data.depositPaid || deposit,
    } as TableReservation;

    TableReservationSchema.parse(reservation);
    this.reservations.set(reservation.id, reservation);
    return reservation;
  }

  updateReservationStatus(id: string, status: TableReservation['status']): boolean {
    const reservation = this.reservations.get(id);
    if (!reservation) return false;

    reservation.status = status;
    return true;
  }

  getAvailableTables(eventId: string): string[] {
    const allTables = ['T1', 'T2', 'T3', 'T4', 'T5', 'VIP1', 'VIP2'];
    const reservedTables = Array.from(this.reservations.values())
      .filter(r => r.eventId === eventId && r.status !== 'cancelled')
      .map(r => r.tableNumber);
    
    return allTables.filter(t => !reservedTables.includes(t));
  }

  getReservationsByEvent(eventId: string): TableReservation[] {
    return Array.from(this.reservations.values()).filter(r => r.eventId === eventId);
  }

  getStatistics(eventId: string): {
    totalReservations: number;
    pendingConfirmation: number;
    confirmed: number;
    seated: number;
    totalRevenue: number;
    averagePartySize: number;
  } {
    const reservations = this.getReservationsByEvent(eventId);
    const revenue = reservations.reduce((sum, r) => sum + r.minimumSpend, 0);
    
    return {
      totalReservations: reservations.length,
      pendingConfirmation: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      seated: reservations.filter(r => r.status === 'seated').length,
      totalRevenue: Math.round(revenue * 100) / 100,
      averagePartySize: reservations.length > 0 
        ? Math.round(reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length)
        : 0,
    };
  }
}
