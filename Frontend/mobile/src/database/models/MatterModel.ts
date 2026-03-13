/**
 * Matter Model - WatermelonDB Implementation (Legal Industry)
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export class MatterModel extends Model {
  static table = 'matters';

  @field('title') title!: string;
  @field('case_number') caseNumber!: string;
  @field('client_id') clientId!: string;
  @field('status') status!: 'open' | 'pending' | 'closed';
  @field('practice_area') practiceArea!: string;
  @field('description') description?: string;
  @field('assigned_attorney_id') assignedAttorneyId?: string;

  @relation('clients', 'client_id') client!: any;
}
