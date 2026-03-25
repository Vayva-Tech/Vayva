/**
 * Petcare Industry Core Service
 * Main service orchestrator for the petcare industry engine
 */

import { prisma } from '../db/petcare-prisma';
import { 
  Pet, 
  PetOwner, 
  PetAppointment, 
  VaccinationRecord, 
  MedicalRecord 
} from '../types';

export class PetcareCoreService {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  /**
   * Pet Management
   */
  async createPet(data: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.pet.create({
      data: {
        ...data,
        storeId: this.storeId,
      },
    });
  }

  async getPets(filters?: {
    ownerId?: string;
    species?: string;
    isActive?: boolean;
  }) {
    const where: any = { 
      owner: { storeId: this.storeId }
    };
    
    if (filters?.ownerId) where.ownerId = filters.ownerId;
    if (filters?.species) where.species = filters.species;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return await prisma.pet.findMany({
      where,
      include: {
        owner: true,
        appointments: {
          where: { status: { not: 'cancelled' } },
          take: 5,
          orderBy: { startDate: 'desc' },
        },
        vaccinationRecords: {
          orderBy: { administeredDate: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPetById(id: string) {
    return await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: true,
        appointments: {
          where: { status: { not: 'cancelled' } },
          orderBy: { startDate: 'desc' },
        },
        vaccinationRecords: {
          orderBy: { administeredDate: 'desc' },
        },
        medicalRecords: {
          orderBy: { date: 'desc' },
        },
        weightRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });
  }

  async updatePet(id: string, data: Partial<Pet>) {
    return await prisma.pet.update({
      where: { id },
      data,
    });
  }

  /**
   * Pet Owner Management
   */
  async createPetOwner(data: Omit<PetOwner, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.petOwner.create({
      data: {
        ...data,
        storeId: this.storeId,
      },
    });
  }

  async getPetOwners(filters?: { isActive?: boolean }) {
    const where: any = { storeId: this.storeId };
    
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return await prisma.petOwner.findMany({
      where,
      include: {
        pets: true,
        _count: {
          select: {
            appointments: true,
            boardingReservations: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getPetOwnerById(id: string) {
    return await prisma.petOwner.findUnique({
      where: { id },
      include: {
        pets: true,
        appointments: {
          orderBy: { startDate: 'desc' },
          take: 10,
        },
        boardingReservations: {
          orderBy: { startDate: 'desc' },
          take: 5,
        },
      },
    });
  }

  /**
   * Appointment Management
   */
  async createAppointment(data: Omit<PetAppointment, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus'>) {
    // Validate pet exists and is active
    const pet = (await prisma.pet.findUnique({
      where: { id: data.petId },
    })) as { isActive?: boolean } | null;

    if (!pet || !pet.isActive) {
      throw new Error('Pet not found or inactive');
    }

    // Check for conflicts
    const conflicts = await prisma.petAppointment.findFirst({
      where: {
        petId: data.petId,
        startDate: { lt: data.endDate },
        endDate: { gt: data.startDate },
        status: { not: 'cancelled' },
      },
    });

    if (conflicts) {
      throw new Error('Time slot is already booked for this pet');
    }

    return await prisma.petAppointment.create({
      data: {
        ...data,
        storeId: this.storeId,
        status: 'scheduled',
        paymentStatus: 'pending',
      },
    });
  }

  async getAppointments(filters?: {
    status?: string;
    petId?: string;
    ownerId?: string;
    appointmentType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = { storeId: this.storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.petId) where.petId = filters.petId;
    if (filters?.ownerId) where.ownerId = filters.ownerId;
    if (filters?.appointmentType) where.appointmentType = filters.appointmentType;
    if (filters?.dateFrom || filters?.dateTo) {
      where.startDate = {};
      if (filters.dateFrom) where.startDate.gte = filters.dateFrom;
      if (filters.dateTo) where.startDate.lte = filters.dateTo;
    }

    return await prisma.petAppointment.findMany({
      where,
      include: {
        pet: true,
        owner: true,
        veterinarian: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async updateAppointmentStatus(appointmentId: string, status: string, notes?: string) {
    return await prisma.petAppointment.update({
      where: { id: appointmentId },
      data: { 
        status,
        notes: notes || undefined,
      },
    });
  }

  /**
   * Vaccination Management
   */
  async recordVaccination(data: Omit<VaccinationRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
    const vaccination = await prisma.vaccinationRecord.create({
      data: {
        ...data,
        status: 'up_to_date',
      },
    });

    // Update pet's vaccination status
    await this.updatePetVaccinationStatus(data.petId);

    return vaccination;
  }

  async getVaccinationRecords(petId: string) {
    return await prisma.vaccinationRecord.findMany({
      where: { petId },
      include: {
        veterinarian: true,
      },
      orderBy: { administeredDate: 'desc' },
    });
  }

  async getOverdueVaccinations() {
    const now = new Date();
    return await prisma.vaccinationRecord.findMany({
      where: {
        nextDueDate: { lte: now },
        status: { in: ['due_soon', 'overdue'] },
        pet: {
          owner: { storeId: this.storeId }
        }
      },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  private async updatePetVaccinationStatus(petId: string) {
    const vaccinations = (await prisma.vaccinationRecord.findMany({
      where: { petId },
      orderBy: { nextDueDate: 'asc' },
    })) as Array<{ nextDueDate?: Date | null }>;

    if (vaccinations.length === 0) return;

    const now = new Date();
    let status: any = 'up_to_date';

    for (const vac of vaccinations) {
      if (vac.nextDueDate && vac.nextDueDate <= now) {
        status = 'overdue';
        break;
      } else if (vac.nextDueDate && vac.nextDueDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        status = 'due_soon';
      }
    }

    await prisma.vaccinationRecord.updateMany({
      where: { petId },
      data: { status },
    });
  }

  /**
   * Medical Records
   */
  async createMedicalRecord(data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.medicalRecord.create({
      data: {
        ...data,
      },
    });
  }

  async getMedicalRecords(petId: string) {
    return await prisma.medicalRecord.findMany({
      where: { petId },
      include: {
        veterinarian: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Analytics & Reporting
   */
  async getPetcareStats(period: 'day' | 'week' | 'month' = 'month') {
    const dateFrom = new Date();
    switch (period) {
      case 'day':
        dateFrom.setDate(dateFrom.getDate() - 1);
        break;
      case 'week':
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case 'month':
        dateFrom.setMonth(dateFrom.getMonth() - 1);
        break;
    }

    const [totalPets, activePets, appointments, revenueRaw] = await Promise.all([
      prisma.pet.count({
        where: {
          owner: { storeId: this.storeId }
        },
      }),
      prisma.pet.count({
        where: {
          owner: { storeId: this.storeId },
          isActive: true,
        },
      }),
      prisma.petAppointment.count({
        where: {
          storeId: this.storeId,
          startDate: { gte: dateFrom },
          status: { not: 'cancelled' },
        },
      }),
      prisma.petAppointment.aggregate({
        where: {
          storeId: this.storeId,
          status: 'completed',
          startDate: { gte: dateFrom },
        },
        _sum: { cost: true },
      }),
    ]);

    const revenue = revenueRaw as { _sum: { cost: number | null } };

    return {
      totalPets,
      activePets,
      appointments,
      revenue: revenue._sum.cost || 0,
    };
  }

  async getPopularServices() {
    const services = (await prisma.petAppointment.groupBy({
      by: ['appointmentType'],
      where: {
        storeId: this.storeId,
        status: 'completed',
      },
      _count: true,
      orderBy: {
        _count: { appointmentType: 'desc' },
      },
      take: 5,
    })) as Array<{ appointmentType: string; _count: number }>;

    return services.map((service) => ({
      type: service.appointmentType,
      count: service._count,
    }));
  }
}