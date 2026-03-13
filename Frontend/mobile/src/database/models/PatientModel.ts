/**
 * Patient Model - WatermelonDB Implementation
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation, children } from '@nozbe/watermelondb/decorators';

export class PatientModel extends Model {
  static table = 'patients';

  @field('name') name!: string;
  @field('email') email?: string;
  @field('phone') phone?: string;
  @field('date_of_birth') dateOfBirth?: Date;
  @field('medical_history') medicalHistory?: string;

  // Relationships
  @children('appointments') appointments!: any;
}
