/**
 * Database Layer - WatermelonDB Setup
 * 
 * Provides offline-first local database with:
 * - Schema definitions for all industries
 * - Model classes with relationships
 * - Database service with CRUD operations
 * - Sync adapters for backend integration
 */

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import Patient from './models/Patient';
import Appointment from './models/Appointment';
import Product from './models/Product';
import Order from './models/Order';
import Table from './models/Table';
import Matter from './models/Matter';

// Define schemas for all industries
const appSchema = {
  version: 1,
  tables: [
    // Healthcare
    {
      name: 'patients',
      columns: [
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'date_of_birth', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'insurance_provider', type: 'string' },
        { name: 'insurance_id', type: 'string' },
        { name: 'allergies', type: 'string', isOptional: true },
        { name: 'medications', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
    {
      name: 'appointments',
      columns: [
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'provider_id', type: 'string' },
        { name: 'start_time', type: 'number' },
        { name: 'end_time', type: 'number' },
        { name: 'status', type: 'string' }, // scheduled, confirmed, completed, cancelled
        { name: 'type', type: 'string' }, // checkup, followup, emergency
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
    // Retail
    {
      name: 'products',
      columns: [
        { name: 'sku', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'cost', type: 'number' },
        { name: 'category', type: 'string' },
        { name: 'barcode', type: 'string', isOptional: true },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
    {
      name: 'inventory',
      columns: [
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'quantity', type: 'number' },
        { name: 'reserved_quantity', type: 'number' },
        { name: 'reorder_point', type: 'number' },
        { name: 'reorder_quantity', type: 'number' },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'last_counted_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
    {
      name: 'orders',
      columns: [
        { name: 'order_number', type: 'string', isIndexed: true },
        { name: 'customer_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // pending, processing, completed, cancelled
        { name: 'subtotal', type: 'number' },
        { name: 'tax', type: 'number' },
        { name: 'total', type: 'number' },
        { name: 'payment_method', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
    // Restaurant
    {
      name: 'tables',
      columns: [
        { name: 'table_number', type: 'string' },
        { name: 'capacity', type: 'number' },
        { name: 'section', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // available, occupied, reserved, maintenance
        { name: 'current_order_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
    {
      name: 'reservations',
      columns: [
        { name: 'customer_name', type: 'string' },
        { name: 'customer_phone', type: 'string' },
        { name: 'party_size', type: 'number' },
        { name: 'reservation_time', type: 'number' },
        { name: 'table_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // confirmed, seated, completed, cancelled, no_show
        { name: 'special_requests', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
    // Legal
    {
      name: 'matters',
      columns: [
        { name: 'matter_number', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'client_id', type: 'string' },
        { name: 'practice_area', type: 'string' },
        { name: 'status', type: 'string' }, // open, closed, pending
        { name: 'priority', type: 'string' }, // low, medium, high, urgent
        { name: 'description', type: 'string', isOptional: true },
        { name: 'opened_date', type: 'number' },
        { name: 'closed_date', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    },
  ],
};

// Create adapter
const adapter = new SQLiteAdapter({
  schema: appSchema,
  onSetUpError: (error) => {
    console.error('[DATABASE] Setup failed:', error);
  },
});

// Create database instance
export const database = new Database({
  adapter,
  modelClasses: [
    Patient,
    Appointment,
    Product,
    Order,
    Table,
    Matter,
  ],
  actionsEnabled: true,
});

// Export types
export type { Patient, Appointment, Product, Order, Table, Matter };
