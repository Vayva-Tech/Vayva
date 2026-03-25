/**
 * Patient model — WatermelonDB
 */

import { Model } from "@nozbe/watermelondb";
import { children, field } from "@nozbe/watermelondb/decorators";

export class PatientModel extends Model {
  static table = "patients";

  @field("first_name") firstName!: string;
  @field("last_name") lastName!: string;
  @field("date_of_birth") dateOfBirth?: string;
  @field("email") email?: string;
  @field("phone") phone?: string;
  @field("insurance_provider") insuranceProvider?: string;
  @field("insurance_id") insuranceId?: string;
  @field("allergies") allergies?: string;
  @field("medications") medications?: string;
  @field("created_at") createdAtRaw!: number;
  @field("updated_at") updatedAtRaw!: number;

  @children("appointments") appointments!: unknown;
}
