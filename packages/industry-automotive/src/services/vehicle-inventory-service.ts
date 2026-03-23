// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Vehicle,
  VehicleStatus,
  VehicleCondition,
  TestDrive,
  TestDriveStatus,
  FinancingApplication,
  FinancingStatus,
  ServiceAppointment,
  ServiceType,
  AutomotiveAnalytics,
} from '../types';

export interface VehicleFilters {
  condition?: VehicleCondition;
  status?: VehicleStatus;
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
}

/**
 * VehicleInventoryService - Manages dealership vehicle inventory
 * Handles vehicle listings, test drives, financing, and service
 */
export class VehicleInventoryService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // ─── Vehicle Inventory ──────────────────────────────────────────────────────

  async getVehicles(tenantId: string, filters: VehicleFilters = {}): Promise<Vehicle[]> {
    const where: Record<string, unknown> = { tenantId };

    if (filters.condition) where['condition'] = filters.condition;
    if (filters.status) where['status'] = filters.status;
    if (filters.make) where['make'] = { contains: filters.make, mode: 'insensitive' };
    if (filters.model) where['model'] = { contains: filters.model, mode: 'insensitive' };
    if (filters.fuelType) where['fuelType'] = filters.fuelType;
    if (filters.transmission) where['transmission'] = filters.transmission;
    if (filters.bodyType) where['bodyType'] = filters.bodyType;
    if (filters.minYear || filters.maxYear) {
      where['year'] = {
        ...(filters.minYear ? { gte: filters.minYear } : {}),
        ...(filters.maxYear ? { lte: filters.maxYear } : {}),
      };
    }
    if (filters.minPrice || filters.maxPrice) {
      where['price'] = {
        ...(filters.minPrice ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return this.db.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } }) as Promise<Vehicle[]>;
  }

  async addVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const now = new Date();
    const vehicle: Vehicle = {
      ...data,
      id: `veh_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.db.vehicle.create({ data: vehicle });
    return vehicle;
  }

  async updateVehicleStatus(vehicleId: string, status: VehicleStatus): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.db.vehicle.update({
      where: { id: vehicleId },
      data: { status, updatedAt: new Date() },
    });
  }

  // ─── Test Drives ────────────────────────────────────────────────────────────

  async scheduleTestDrive(data: Omit<TestDrive, 'id' | 'createdAt'>): Promise<TestDrive> {
    const testDrive: TestDrive = {
      ...data,
      id: `td_${Date.now()}`,
      createdAt: new Date(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.db.testDrive.create({ data: testDrive });

    // Reserve the vehicle
    await this.updateVehicleStatus(data.vehicleId, 'reserved');
    return testDrive;
  }

  async updateTestDriveStatus(testDriveId: string, status: TestDriveStatus, feedback?: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.db.testDrive.update({
      where: { id: testDriveId },
      data: { status, feedback },
    });

    // If cancelled/no_show, release vehicle back to available
    if (status === 'cancelled' || status === 'no_show') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const td = await this.db.testDrive.findUnique({ where: { id: testDriveId } });
      if (td) await this.updateVehicleStatus(td.vehicleId as string, 'available');
    }
  }

  async getUpcomingTestDrives(tenantId: string, date: Date): Promise<TestDrive[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return this.db.testDrive.findMany({
      where: {
        tenantId,
        status: 'scheduled',
        scheduledAt: { gte: start, lte: end },
      },
      orderBy: { scheduledAt: 'asc' },
    }) as Promise<TestDrive[]>;
  }

  // ─── Financing ──────────────────────────────────────────────────────────────

  async submitFinancingApplication(
    data: Omit<FinancingApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Promise<FinancingApplication> {
    const now = new Date();
    const application: FinancingApplication = {
      ...data,
      id: `fin_${Date.now()}`,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.db.financingApplication.create({ data: application });
    return application;
  }

  async updateFinancingStatus(
    applicationId: string,
    status: FinancingStatus,
    details?: { approvedAmount?: number; interestRate?: number; monthlyPayment?: number; rejectionReason?: string },
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.db.financingApplication.update({
      where: { id: applicationId },
      data: {
        status,
        ...(details?.approvedAmount !== undefined ? { approvedAmount: details.approvedAmount } : {}),
        ...(details?.interestRate !== undefined ? { interestRate: details.interestRate } : {}),
        ...(details?.monthlyPayment !== undefined ? { monthlyPayment: details.monthlyPayment } : {}),
        ...(details?.rejectionReason ? { rejectionReason: details.rejectionReason } : {}),
        ...(status === 'approved' ? { approvalDate: new Date() } : {}),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Calculate estimated monthly payment
   */
  calculateMonthlyPayment(loanAmount: number, annualRate: number, termMonths: number): number {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return loanAmount / termMonths;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  // ─── Service Appointments ───────────────────────────────────────────────────

  async scheduleService(data: Omit<ServiceAppointment, 'id' | 'createdAt'>): Promise<ServiceAppointment> {
    const appointment: ServiceAppointment = {
      ...data,
      id: `svc_${Date.now()}`,
      createdAt: new Date(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.db.serviceAppointment.create({ data: appointment });
    return appointment;
  }

  async getServiceAppointments(tenantId: string, date: Date): Promise<ServiceAppointment[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return this.db.serviceAppointment.findMany({
      where: {
        tenantId,
        scheduledAt: { gte: start, lte: end },
      },
      orderBy: { scheduledAt: 'asc' },
    }) as Promise<ServiceAppointment[]>;
  }

  // ─── Analytics ──────────────────────────────────────────────────────────────

  async getAnalytics(tenantId: string): Promise<AutomotiveAnalytics> {
    void tenantId;

    return {
      totalInventory: 0,
      newVehicles: 0,
      usedVehicles: 0,
      vehiclesSoldThisMonth: 0,
      totalRevenue: 0,
      revenueThisMonth: 0,
      averageSalePrice: 0,
      testDrivesThisMonth: 0,
      testDriveToSaleConversionRate: 0,
      pendingFinancingApplications: 0,
      approvedFinancingRate: 0,
      serviceAppointmentsToday: 0,
      topSellingMakes: [],
    };
  }
}
