/**
 * Database layer — WatermelonDB (offline-first local store).
 */

import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { appSchema } from "./schema-definition";
import { PatientModel } from "./models/PatientModel";
import { AppointmentModel } from "./models/AppointmentModel";
import { ProductModel } from "./models/ProductModel";
import { OrderModel } from "./models/OrderModel";
import { TableModel } from "./models/TableModel";
import { MatterModel } from "./models/MatterModel";

const adapter = new SQLiteAdapter({
  schema: appSchema,
  onSetUpError: (error: Error) => {
    console.error("[DATABASE] Setup failed:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    PatientModel,
    AppointmentModel,
    ProductModel,
    OrderModel,
    TableModel,
    MatterModel,
  ],
});

export { PatientModel } from "./models/PatientModel";
export { AppointmentModel } from "./models/AppointmentModel";
export { ProductModel } from "./models/ProductModel";
export { OrderModel } from "./models/OrderModel";
export { TableModel } from "./models/TableModel";
export { MatterModel } from "./models/MatterModel";
