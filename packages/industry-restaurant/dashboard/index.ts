/**
 * Restaurant Dashboard Components
 * 
 * Dashboard configuration and components for:
 * - Front of House (FOH) Dashboard
 * - Kitchen Display System (KDS)
 * - Analytics & Reporting
 */

import {
  restaurantDashboardService,
  KDSService,
  TableManagementService,
  ReservationService,
  StaffManagementService,
  RestaurantFinanceService,
} from '../services';

export { 
  restaurantDashboardService, 
  KDSService, 
  TableManagementService, 
  ReservationService,
  StaffManagementService,
  RestaurantFinanceService,
};

// Dashboard configuration presets
export const DASHBOARD_PRESETS = {
  FOH_BOLD_ENERGY: {
    theme: 'bold-orange',
    layout: 'grid',
    components: [
      'service-overview',
      'kpi-row',
      'live-order-feed',
      'table-status',
      'menu-performance',
      'staff-activity',
      'reservations-timeline',
      'delivery-integration',
    ],
  },
  KDS_MODERN_DARK: {
    theme: 'cyan-tech',
    layout: 'kanban',
    components: [
      'ticket-grid',
      'station-selector',
      'prep-list',
      'timer-display',
    ],
  },
};