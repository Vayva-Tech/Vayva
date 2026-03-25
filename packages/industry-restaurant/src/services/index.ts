export type { Order, Reservation, Table } from '../types';

/**
 * Restaurant Industry Services
 * 
 * Complete suite of restaurant management services:
 * - KDS (Kitchen Display System)
 * - Dashboard & Analytics
 * - 86 Board Management
 * - Table Management
 * - Recipe Costing
 * - Reservations
 * - Delivery Integration
 * - Staff Management
 * - Finance
 * - AI-Powered Features
 */

// Traditional Services
export * from './kds-service';
export * from './dashboard-service';
export * from './86-board-service';
export * from './table-service';
export * from './recipe-costing-service';
export * from './reservation-service';
export * from './delivery-service';
export * from './staff-service';
export * from './finance-service';

// AI-Powered Services
export { LaborForecastingService } from './labor-forecasting.service';
export type { LaborForecastInput } from './labor-forecasting.service';

export { ReservationNoShowService } from './reservation-no-show.service';
export type { ReservationNoShowInput } from './reservation-no-show.service';

export { CustomerPreferenceService } from './customer-preference.service';
export type { CustomerPreferenceInput } from './customer-preference.service';