/**
 * Database Schema Definition
 * WatermelonDB schema for all industry models
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const appSchema = appSchema({
  version: 1,
  tables: [
    // Healthcare - Patients
    tableSchema({
      name: 'patients',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'date_of_birth', type: 'string', isOptional: true },
        { name: 'medical_history', type: 'string', isOptional: true },
      ],
    }),

    // Healthcare - Appointments
    tableSchema({
      name: 'appointments',
      columns: [
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'date', type: 'string' },
        { name: 'duration', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'practitioner_id', type: 'string', isOptional: true },
      ],
    }),

    // Retail - Products
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'sku', type: 'string', isIndexed: true },
        { name: 'price', type: 'number' },
        { name: 'cost', type: 'number', isOptional: true },
        { name: 'stock_quantity', type: 'number' },
        { name: 'category', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
      ],
    }),

    // Restaurant/Retail - Orders
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'customer_id', type: 'string', isIndexed: true },
        { name: 'table_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'items', type: 'string' }, // JSON stringified array
        { name: 'subtotal', type: 'number' },
        { name: 'tax', type: 'number' },
        { name: 'total', type: 'number' },
        { name: 'payment_method', type: 'string', isOptional: true },
      ],
    }),

    // Restaurant - Tables
    tableSchema({
      name: 'tables',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'capacity', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'location', type: 'string', isOptional: true },
      ],
    }),

    // Legal - Matters
    tableSchema({
      name: 'matters',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'case_number', type: 'string', isIndexed: true },
        { name: 'client_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'practice_area', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'assigned_attorney_id', type: 'string', isOptional: true },
      ],
    }),
  ],
});
