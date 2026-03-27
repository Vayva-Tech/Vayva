import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class HealthcareService {
  constructor(private readonly db = prisma) {}

  async getPatients(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { mrn: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [patients, total] = await Promise.all([
      this.db.patient.findMany({
        where,
        select: {
          id: true,
          mrn: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          status: true,
          createdAt: true,
        },
        orderBy: { lastName: 'asc' },
        take: limit,
        skip: offset,
      }),
      this.db.patient.count({ where }),
    ]);

    return {
      patients,
      total,
      limit,
      offset,
    };
  }

  async createPatient(storeId: string, patientData: any) {
    const {
      mrn,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactEmail,
      contactPhone,
      address,
      emergencyContact,
      bloodType,
      allergies,
      medications,
    } = patientData;

    const existing = await this.db.patient.findFirst({
      where: { storeId, mrn },
    });

    if (existing) {
      throw new Error('Patient with this MRN already exists');
    }

    const patient = await this.db.patient.create({
      data: {
        id: `patient-${Date.now()}`,
        storeId,
        mrn,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender: gender || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        bloodType: bloodType || null,
        allergies: allergies || [],
        medications: medications || [],
        status: 'active',
      },
    });

    logger.info(`[Healthcare] Created patient ${patient.id} (MRN: ${mrn})`);
    return patient;
  }

  async getPatientById(patientId: string, storeId: string) {
    return await this.db.patient.findFirst({
      where: { id: patientId, storeId },
      include: {
        appointments: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        medicalRecords: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updatePatient(patientId: string, storeId: string, updates: any) {
    const patient = await this.db.patient.findFirst({
      where: { id: patientId, storeId },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const updated = await this.db.patient.update({
      where: { id: patientId },
      data: updates,
    });

    logger.info(`[Healthcare] Updated patient ${patientId}`);
    return updated;
  }

  async getPatientHistory(patientId: string, storeId: string) {
    const records = await this.db.medicalRecord.findMany({
      where: { patientId },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records;
  }

  async getConsentForms(patientId: string, storeId: string) {
    const consents = await this.db.consentForm.findMany({
      where: { patientId },
      orderBy: { signedAt: 'desc' },
    });

    return consents;
  }

  async getAppointments(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.date) {
      const date = new Date(filters.date);
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    if (filters.status) where.status = filters.status;
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.providerId) where.providerId = filters.providerId;

    const [appointments, total] = await Promise.all([
      this.db.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              contactPhone: true,
            },
          },
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
        orderBy: { date: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.appointment.count({ where }),
    ]);

    return {
      appointments,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async createAppointment(storeId: string, appointmentData: any) {
    const {
      patientId,
      providerId,
      date,
      duration = 30,
      type = 'consultation',
      reason,
      notes,
    } = appointmentData;

    const appointment = await this.db.appointment.create({
      data: {
        id: `apt-${Date.now()}`,
        storeId,
        patientId,
        providerId,
        date: new Date(date),
        duration,
        type,
        reason: reason || null,
        notes: notes || null,
        status: 'scheduled',
      },
      include: {
        patient: true,
        provider: true,
      },
    });

    logger.info(`[Healthcare] Created appointment ${appointment.id}`);
    return appointment;
  }

  async checkinAppointment(appointmentId: string, storeId: string) {
    const appointment = await this.db.appointment.findFirst({
      where: { id: appointmentId, storeId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const updated = await this.db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'checked_in',
        checkInTime: new Date(),
      },
    });

    logger.info(`[Healthcare] Checked in appointment ${appointmentId}`);
    return updated;
  }

  async cancelAppointment(appointmentId: string, storeId: string, reason?: string) {
    const appointment = await this.db.appointment.findFirst({
      where: { id: appointmentId, storeId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const updated = await this.db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'cancelled',
        cancellationReason: reason || null,
        cancelledAt: new Date(),
      },
    });

    logger.info(`[Healthcare] Cancelled appointment ${appointmentId}`);
    return updated;
  }

  async getLabs(storeId: string) {
    const labs = await this.db.lab.findMany({
      where: { storeId, active: true },
      orderBy: { name: 'asc' },
    });

    return labs;
  }

  async createLab(storeId: string, labData: any) {
    const { name, address, phone, email, specialties } = labData;

    const lab = await this.db.lab.create({
      data: {
        id: `lab-${Date.now()}`,
        storeId,
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        specialties: specialties || [],
        active: true,
      },
    });

    logger.info(`[Healthcare] Created lab ${lab.id}`);
    return lab;
  }

  async getHealthcareStats(storeId: string) {
    const [
      totalPatients,
      activePatients,
      totalAppointments,
      todayAppointments,
      pendingLabs,
    ] = await Promise.all([
      this.db.patient.count({ where: { storeId } }),
      this.db.patient.count({ where: { storeId, status: 'active' } }),
      this.db.appointment.count({ where: { storeId } }),
      this.db.appointment.count({
        where: {
          storeId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.db.labOrder.count({
        where: { storeId, status: 'pending' },
      }),
    ]);

    return {
      patients: {
        total: totalPatients,
        active: activePatients,
      },
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
      },
      labs: {
        pending: pendingLabs,
      },
    };
  }
}
