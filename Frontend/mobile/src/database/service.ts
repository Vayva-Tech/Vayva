/**
 * Database Service - CRUD Operations
 * Provides a clean API for database operations across all industries
 */

import { Database, Q, type Model } from '@nozbe/watermelondb';
import { Observable } from 'rxjs';

// Type definitions
export interface BaseRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient extends BaseRecord {
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  medicalHistory?: string;
}

export interface Appointment extends BaseRecord {
  patientId: string;
  date: Date;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  practitionerId?: string;
}

export interface Product extends BaseRecord {
  name: string;
  sku: string;
  price: number;
  cost?: number;
  stockQuantity: number;
  category?: string;
  description?: string;
}

export interface Order extends BaseRecord {
  customerId: string;
  tableId?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface Table extends BaseRecord {
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location?: string;
}

export interface Matter extends BaseRecord {
  title: string;
  caseNumber: string;
  clientId: string;
  status: 'open' | 'pending' | 'closed';
  practiceArea: string;
  description?: string;
  assignedAttorneyId?: string;
}

// Database Service Class
export class DatabaseService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  // Generic CRUD operations
  async findAll<T>(collectionName: string): Promise<T[]> {
    const collection = this.db.get(collectionName);
    const records = await collection.query().fetch();
    return records as unknown as T[];
  }

  async findById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const record = await this.db.get(collectionName).find(id);
      return record as unknown as T;
    } catch {
      return null;
    }
  }

  async create<T extends BaseRecord>(
    collectionName: string,
    data: Partial<T>
  ): Promise<T> {
    const collection = this.db.get(collectionName);
    
    const dataRecord = data as Record<string, unknown>;
    const record = await collection.create((rec: Model) => {
      const r = rec as unknown as Record<string, unknown>;
      Object.keys(data).forEach((key) => {
        if (key !== "id" && key !== "createdAt" && key !== "updatedAt") {
          r[key] = dataRecord[key];
        }
      });
    });

    return record as unknown as T;
  }

  async update<T extends BaseRecord>(
    collectionName: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const record = await this.db.get(collectionName).find(id);
    
    const dataRecord = data as Record<string, unknown>;
    await record.update((updated: Model) => {
      const u = updated as unknown as Record<string, unknown>;
      Object.keys(data).forEach((key) => {
        if (key !== "id" && key !== "createdAt" && key !== "updatedAt") {
          u[key] = dataRecord[key];
        }
      });
    });

    return record as unknown as T;
  }

  async delete(collectionName: string, id: string): Promise<void> {
    const record = await this.db.get(collectionName).find(id);
    await record.destroyPermanently();
  }

  // Query helpers
  async query<T>(
    collectionName: string,
    filters: { field: string; op: string; value: unknown }[]
  ): Promise<T[]> {
    const collection = this.db.get(collectionName);
    const clauses: ReturnType<typeof Q.where>[] = [];

    filters.forEach(({ field, op, value }) => {
      const col = field as never;
      switch (op) {
        case "eq":
          clauses.push(Q.where(col, value as never));
          break;
        case "ne":
          clauses.push(Q.where(col, Q.notEq(value as never)));
          break;
        case "gt":
          clauses.push(Q.where(col, Q.gt(value as never)));
          break;
        case "gte":
          clauses.push(Q.where(col, Q.gte(value as never)));
          break;
        case "lt":
          clauses.push(Q.where(col, Q.lt(value as never)));
          break;
        case "lte":
          clauses.push(Q.where(col, Q.lte(value as never)));
          break;
        case "in":
          clauses.push(Q.where(col, Q.oneOf(value as never[])));
          break;
        case "contains":
          clauses.push(Q.where(col, Q.like(`%${value}%`)));
          break;
      }
    });

    const query =
      clauses.length > 0 ? collection.query(...clauses) : collection.query();

    const results = await query.fetch();
    return results as unknown as T[];
  }

  // Observable for real-time updates
  observe<T>(collectionName: string): Observable<T[]> {
    const collection = this.db.get(collectionName);
    return collection.query().observe() as Observable<T[]>;
  }

  // Batch operations
  async batchCreate<T extends BaseRecord>(
    collectionName: string,
    dataItems: Partial<T>[]
  ): Promise<T[]> {
    const collection = this.db.get(collectionName);
    
    await this.db.batch(
      ...dataItems.map(data => 
        collection.prepareCreate((record: Model) => {
          const r = record as unknown as Record<string, unknown>;
          const dataRecord = data as Record<string, unknown>;
          Object.keys(data).forEach((key) => {
            if (key !== "id" && key !== "createdAt" && key !== "updatedAt") {
              r[key] = dataRecord[key];
            }
          });
        })
      )
    );

    return this.findAll<T>(collectionName);
  }

  // Industry-specific queries
  
  // Healthcare queries
  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return this.query<Appointment>('appointments', [
      { field: 'patient_id', op: 'eq', value: patientId }
    ]);
  }

  async getUpcomingAppointments(): Promise<Appointment[]> {
    const now = new Date();
    return this.query<Appointment>('appointments', [
      { field: 'date', op: 'gte', value: now },
      { field: 'status', op: 'eq', value: 'scheduled' }
    ]);
  }

  // Retail queries
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return this.query<Product>('products', [
      { field: 'stock_quantity', op: 'lte', value: threshold }
    ]);
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    const products = await this.query<Product>('products', [
      { field: 'sku', op: 'eq', value: sku }
    ]);
    return products[0] || null;
  }

  // Restaurant queries
  async getAvailableTables(): Promise<Table[]> {
    return this.query<Table>('tables', [
      { field: 'status', op: 'eq', value: 'available' }
    ]);
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    return this.query<Order>('orders', [
      { field: 'table_id', op: 'eq', value: tableId }
    ]);
  }

  // Legal queries
  async getMattersByClient(clientId: string): Promise<Matter[]> {
    return this.query<Matter>('matters', [
      { field: 'client_id', op: 'eq', value: clientId }
    ]);
  }

  async getOpenMatters(): Promise<Matter[]> {
    return this.query<Matter>('matters', [
      { field: 'status', op: 'eq', value: 'open' }
    ]);
  }
}

// Export singleton instance (to be initialized in database/index.ts)
export let databaseService: DatabaseService | null = null;

export function initializeDatabaseService(db: Database): DatabaseService {
  databaseService = new DatabaseService(db);
  return databaseService;
}

export function getDatabaseService(): DatabaseService {
  if (!databaseService) {
    throw new Error('DatabaseService not initialized. Call initializeDatabaseService first.');
  }
  return databaseService;
}
