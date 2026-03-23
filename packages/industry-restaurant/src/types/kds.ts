// @ts-nocheck
/**
 * Kitchen Display System (KDS) types
 * Real-time order management for kitchen operations
 */

export type KDSDisplayMode = 'queue' | 'course' | 'station';
export type KDSCourse = 'appetizer' | 'entree' | 'dessert' | 'drink';
export type KDSPriority = 'rush' | 'normal' | 'future';
export type KDSStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'bumped';

export interface KDSConfig {
  displayMode: KDSDisplayMode;
  colorCoding: boolean;
  soundAlerts: boolean;
  bumpBar: boolean;
  prepTimeTracking: boolean;
  autoBumpTimeout?: number; // minutes
  stations: KDSStation[];
}

export interface KDSStation {
  id: string;
  name: string;
  categories: string[]; // Menu categories this station handles
  printers?: string[];
  displayOrder: number;
}

export interface KDSOrder {
  id: string;
  orderNumber: string;
  items: KDSItem[];
  course: KDSCourse;
  priority: KDSPriority;
  receivedAt: Date;
  promisedTime?: Date;
  station: string;
  status: KDSStatus;
  modifiers: string[];
  allergies: string[];
  specialInstructions: string;
  serverName?: string;
  tableNumber?: string;
  guestCount?: number;
  // Timing tracking
  startedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  bumpedAt?: Date;
  prepTimeMinutes?: number;
}

export interface KDSItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  modifiers: KDSModifier[];
  status: KDSStatus;
  station: string;
  course: KDSCourse;
  notes?: string;
}

export interface KDSModifier {
  id: string;
  name: string;
  priceAdjustment: number;
  type: 'add' | 'remove' | 'substitute';
}

export interface KDSStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  avgPrepTimeMinutes: number;
  rushOrders: number;
  overdueOrders: number;
}

export interface KDSAlert {
  type: 'overdue' | 'rush' | 'allergy' | 'long-prep';
  orderId: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

export interface KDSEvent {
  type: 'order-received' | 'status-changed' | 'order-bumped' | 'alert';
  orderId: string;
  timestamp: Date;
  data: unknown;
}

// Widget Props
export interface KDSWidgetProps {
  config: KDSConfig;
  orders: KDSOrder[];
  stats: KDSStats;
  alerts: KDSAlert[];
  onOrderAction: (orderId: string, action: string) => void;
  onBumpOrder: (orderId: string) => void;
}
