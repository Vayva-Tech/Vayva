import { z } from 'zod';
import type { 
  MedicalRecord, 
  Prescription, 
  Patient, 
  Doctor 
} from '../types';

// ─── Enhanced Medical Records Types ───────────────────────────────────────────

export const MedicalRecordCategory = z.enum([
  'consultation_note',
  'diagnostic_report',
  'lab_result',
  'imaging_study',
  'prescription',
  'surgical_report',
  'discharge_summary',
  'progress_note',
  'referral_letter',
  'consent_form',
  'immunization_record',
  'allergy_document'
]);
export type MedicalRecordCategory = z.infer<typeof MedicalRecordCategory>;

export const DocumentFormat = z.enum([
  'text',
  'pdf',
  'image',
  'dicom',
  'fhir',
  'hl7'
]);
export type DocumentFormat = z.infer<typeof DocumentFormat>;

export interface MedicalRecordQuery {
  patientId?: string;
  doctorId?: string;
  category?: MedicalRecordCategory;
  dateFrom?: Date;
  dateTo?: Date;
  keywords?: string[];
  includeConfidential?: boolean;
}

export interface DocumentAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number; // bytes
  url: string;
  uploadedAt: Date;
  uploadedBy: string; // userId
}

export interface LabResult {
  id: string;
  testName: string;
  resultValue: string | number;
  unit: string;
  referenceRange: string;
  interpretation: 'normal' | 'abnormal' | 'critical';
  performedAt: Date;
  performedBy: string; // lab technician id
}

export interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  bmi: number;
  recordedAt: Date;
  recordedBy: string;
}

export interface Immunization {
  id: string;
  vaccineName: string;
  manufacturer: string;
  lotNumber: string;
  doseNumber: number;
  seriesTotal: number;
  administeredAt: Date;
  administeredBy: string;
  nextDueDate?: Date;
  site: string; // injection site
  route: string; // administration route
}

export interface Allergy {
  id: string;
  allergen: string;
  type: 'food' | 'medication' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  reaction: string;
  diagnosedAt: Date;
  diagnosedBy: string;
  status: 'active' | 'resolved' | 'inactive';
}

export interface MedicationHistory {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribingDoctorId: string;
  status: 'active' | 'completed' | 'discontinued';
  reason?: string;
}

export interface MedicalRecordVersion {
  id: string;
  recordId: string;
  versionNumber: number;
  content: string;
  changes: string;
  createdBy: string;
  createdAt: Date;
}

export interface AccessLog {
  id: string;
  recordId: string;
  userId: string;
  userName: string;
  userType: 'doctor' | 'nurse' | 'admin' | 'patient';
  action: 'view' | 'edit' | 'download' | 'share';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  reason?: string;
}

// ─── Medical Records Service ──────────────────────────────────────────────────

export class MedicalRecordsService {
  private db: any;

  constructor(db?: any) {
    this.db = db;
  }

  async initialize(): Promise<void> {}

  /**
   * Create a new medical record
   */
  async createMedicalRecord(data: {
    patientId: string;
    doctorId: string;
    category: MedicalRecordCategory;
    title: string;
    content: string;
    attachments?: Omit<DocumentAttachment, 'id' | 'uploadedAt'>[];
    confidential?: boolean;
    relatedAppointmentId?: string;
    vitalSigns?: VitalSigns;
    labResults?: Omit<LabResult, 'id' | 'performedAt'>[];
  }): Promise<MedicalRecord> {
    // Validate patient and doctor exist
    const [patient, doctor] = await Promise.all([
      this.getPatient(data.patientId),
      this.getDoctor(data.doctorId)
    ]);

    if (!patient) {
      throw new Error(`Patient ${data.patientId} not found`);
    }

    if (!doctor) {
      throw new Error(`Doctor ${data.doctorId} not found`);
    }

    // Create the medical record
    const record = await this.db.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.relatedAppointmentId,
        type: data.category,
        title: data.title,
        content: data.content,
        attachments: data.attachments || [],
        confidential: data.confidential || false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Store vital signs if provided
    if (data.vitalSigns) {
      await this.storeVitalSigns(record.id, data.vitalSigns);
    }

    // Store lab results if provided
    if (data.labResults) {
      await Promise.all(
        data.labResults.map(result => 
          this.storeLabResult(record.id, result)
        )
      );
    }

    // Log the creation
    await this.logAccess(record.id, data.doctorId, 'doctor', 'create');

    return record as MedicalRecord;
  }

  /**
   * Get medical records with advanced querying
   */
  async getMedicalRecords(query: MedicalRecordQuery): Promise<MedicalRecord[]> {
    const where: Record<string, unknown> = {};

    if (query.patientId) where['patientId'] = query.patientId;
    if (query.doctorId) where['doctorId'] = query.doctorId;
    if (query.category) where['type'] = query.category;
    
    if (query.dateFrom || query.dateTo) {
      where['createdAt'] = {
        ...(query.dateFrom ? { gte: query.dateFrom } : {}),
        ...(query.dateTo ? { lte: query.dateTo } : {})
      };
    }

    const records = await this.db.medicalRecord.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true
          }
        },
        doctor: {
          select: {
            name: true,
            specialty: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter by keywords if provided
    let filteredRecords = records;
    if (query.keywords && query.keywords.length > 0) {
      filteredRecords = records.filter((record: any) =>
        query.keywords!.some(keyword =>
          record.title.toLowerCase().includes(keyword.toLowerCase()) ||
          record.content.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Remove confidential records if not explicitly requested
    if (!query.includeConfidential) {
      filteredRecords = filteredRecords.filter((record: any) => !record.confidential);
    }

    return filteredRecords as MedicalRecord[];
  }

  /**
   * Get patient's complete medical history
   */
  async getPatientMedicalHistory(
    patientId: string,
    options?: {
      includeAllergies?: boolean;
      includeMedications?: boolean;
      includeImmunizations?: boolean;
      timelineView?: boolean;
    }
  ): Promise<{
    records: MedicalRecord[];
    allergies: Allergy[];
    medications: MedicationHistory[];
    immunizations: Immunization[];
    vitalSignsTimeline: VitalSigns[];
  }> {
    const patient = await this.getPatient(patientId);
    if (!patient) {
      throw new Error(`Patient ${patientId} not found`);
    }

    // Get all medical records for the patient
    const records = await this.getMedicalRecords({ patientId });

    // Get allergies
    const allergies = options?.includeAllergies 
      ? await this.getAllergies(patientId)
      : [];

    // Get current medications
    const medications = options?.includeMedications
      ? await this.getActiveMedications(patientId)
      : [];

    // Get immunization history
    const immunizations = options?.includeImmunizations
      ? await this.getImmunizations(patientId)
      : [];

    // Get vital signs timeline
    const vitalSignsTimeline = await this.getVitalSignsTimeline(patientId);

    return {
      records,
      allergies,
      medications,
      immunizations,
      vitalSignsTimeline
    };
  }

  /**
   * Update medical record
   */
  async updateMedicalRecord(
    recordId: string,
    updates: {
      title?: string;
      content?: string;
      confidential?: boolean;
      attachments?: DocumentAttachment[];
    },
    updatedBy: string
  ): Promise<MedicalRecord> {
    const record = await this.db.medicalRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      throw new Error(`Medical record ${recordId} not found`);
    }

    // Create version history
    await this.createVersion(recordId, updates, updatedBy);

    // Update the record
    const updatedRecord = await this.db.medicalRecord.update({
      where: { id: recordId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    // Log the update
    await this.logAccess(recordId, updatedBy, 'doctor', 'edit');

    return updatedRecord as MedicalRecord;
  }

  /**
   * Securely share medical record with another provider
   */
  async shareMedicalRecord(data: {
    recordId: string;
    sharedWithDoctorId: string;
    sharingDoctorId: string;
    purpose: string;
    expiresAt?: Date;
  }): Promise<void> {
    const [record, sharingDoctor, sharedWithDoctor] = await Promise.all([
      this.db.medicalRecord.findUnique({ where: { id: data.recordId } }),
      this.getDoctor(data.sharingDoctorId),
      this.getDoctor(data.sharedWithDoctorId)
    ]);

    if (!record) {
      throw new Error(`Medical record ${data.recordId} not found`);
    }

    if (!sharingDoctor) {
      throw new Error(`Doctor ${data.sharingDoctorId} not found`);
    }

    if (!sharedWithDoctor) {
      throw new Error(`Doctor ${data.sharedWithDoctorId} not found`);
    }

    // Create sharing record
    await this.db.recordSharing.create({
      data: {
        recordId: data.recordId,
        sharedByDoctorId: data.sharingDoctorId,
        sharedWithDoctorId: data.sharedWithDoctorId,
        purpose: data.purpose,
        expiresAt: data.expiresAt,
        createdAt: new Date()
      }
    });

    // Log the sharing action
    await this.logAccess(data.recordId, data.sharingDoctorId, 'doctor', 'share');
  }

  /**
   * Get audit trail for a medical record
   */
  async getAuditTrail(recordId: string): Promise<AccessLog[]> {
    return await this.db.accessLog.findMany({
      where: { recordId },
      orderBy: { timestamp: 'desc' }
    }) as AccessLog[];
  }

  /**
   * Create prescription
   */
  async createPrescription(data: {
    patientId: string;
    doctorId: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
      refillsAllowed?: number;
    }>;
    issuedAt?: Date;
    expiresAt?: Date;
    relatedAppointmentId?: string;
  }): Promise<Prescription> {
    const [patient, doctor] = await Promise.all([
      this.getPatient(data.patientId),
      this.getDoctor(data.doctorId)
    ]);

    if (!patient) {
      throw new Error(`Patient ${data.patientId} not found`);
    }

    if (!doctor) {
      throw new Error(`Doctor ${data.doctorId} not found`);
    }

    const prescription = await this.db.prescription.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.relatedAppointmentId,
        medications: data.medications.map(med => ({
          ...med,
          refillsAllowed: med.refillsAllowed || 0
        })),
        issuedAt: data.issuedAt || new Date(),
        expiresAt: data.expiresAt,
        refillsAllowed: Math.max(...data.medications.map(m => m.refillsAllowed || 0)),
        refillsUsed: 0,
        status: 'active'
      }
    });

    // Log the prescription creation
    await this.logAccess(prescription.id, data.doctorId, 'doctor', 'create');

    return prescription as Prescription;
  }

  /**
   * Get patient's allergy profile
   */
  async getAllergyProfile(patientId: string): Promise<{
    allergies: Allergy[];
    alerts: string[];
  }> {
    const allergies = await this.getAllergies(patientId);
    const alerts = allergies
      .filter(allergy => allergy.status === 'active')
      .map(allergy => `${allergy.allergen} (${allergy.severity})`);

    return { allergies, alerts };
  }

  // ─── Private Helper Methods ─────────────────────────────────────────────────

  private async getPatient(patientId: string): Promise<Patient | null> {
    return await this.db.patient.findUnique({
      where: { id: patientId }
    });
  }

  private async getDoctor(doctorId: string): Promise<Doctor | null> {
    return await this.db.doctor.findUnique({
      where: { id: doctorId }
    });
  }

  private async storeVitalSigns(recordId: string, vitalSigns: VitalSigns): Promise<void> {
    await this.db.vitalSigns.create({
      data: {
        recordId,
        ...vitalSigns
      }
    });
  }

  private async storeLabResult(
    recordId: string, 
    labResult: Omit<LabResult, 'id' | 'performedAt'>
  ): Promise<void> {
    await this.db.labResult.create({
      data: {
        recordId,
        ...labResult,
        performedAt: new Date()
      }
    });
  }

  private async getAllergies(patientId: string): Promise<Allergy[]> {
    return await this.db.allergy.findMany({
      where: { 
        patientId,
        status: 'active'
      },
      orderBy: { diagnosedAt: 'desc' }
    }) as Allergy[];
  }

  private async getActiveMedications(patientId: string): Promise<MedicationHistory[]> {
    return await this.db.medicationHistory.findMany({
      where: {
        patientId,
        status: 'active'
      },
      orderBy: { startDate: 'desc' }
    }) as MedicationHistory[];
  }

  private async getImmunizations(patientId: string): Promise<Immunization[]> {
    return await this.db.immunization.findMany({
      where: { patientId },
      orderBy: { administeredAt: 'desc' }
    }) as Immunization[];
  }

  private async getVitalSignsTimeline(patientId: string): Promise<VitalSigns[]> {
    const records = await this.db.medicalRecord.findMany({
      where: { 
        patientId,
        type: 'consultation_note'
      },
      select: {
        vitalSigns: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return records
      .filter((r: any) => r.vitalSigns)
      .map((r: any) => ({
        ...r.vitalSigns,
        recordedAt: r.createdAt
      })) as VitalSigns[];
  }

  private async createVersion(
    recordId: string,
    changes: Record<string, unknown>,
    createdBy: string
  ): Promise<void> {
    const record = await this.db.medicalRecord.findUnique({
      where: { id: recordId }
    });

    if (record) {
      const versionCount = await this.db.medicalRecordVersion.count({
        where: { recordId }
      });

      await this.db.medicalRecordVersion.create({
        data: {
          recordId,
          versionNumber: versionCount + 1,
          content: record.content,
          changes: JSON.stringify(changes),
          createdBy,
          createdAt: new Date()
        }
      });
    }
  }

  private async logAccess(
    recordId: string,
    userId: string,
    userType: 'doctor' | 'nurse' | 'admin' | 'patient',
    action: 'view' | 'edit' | 'download' | 'share' | 'create'
  ): Promise<void> {
    // In production, this would capture real IP and user agent
    await this.db.accessLog.create({
      data: {
        recordId,
        userId,
        userName: `User-${userId}`, // Would get real name in production
        userType,
        action,
        ipAddress: '127.0.0.1',
        userAgent: 'Vayva Healthcare System',
        timestamp: new Date()
      }
    });
  }
}

export const medicalRecords = new MedicalRecordsService({} as any);