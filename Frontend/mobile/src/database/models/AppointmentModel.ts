/**
 * Appointment Model - WatermelonDB Implementation
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export class AppointmentModel extends Model {
  static table = 'appointments';

  @field('patient_id') patientId!: string;
  @field('date') date!: Date;
  @field('duration') duration!: number;
  @field('status') status!: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  @field('notes') notes?: string;
  @field('practitioner_id') practitionerId?: string;

  // Relationships
  @relation('patients', 'patient_id') patient!: any;
}
