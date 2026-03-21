/**
 * Route Optimizer Types
 * Mobile Services - Operational Excellence Tools
 */

export type RouteStatus = 'planned' | 'active' | 'completed' | 'cancelled';
export type StopStatus = 'pending' | 'arrived' | 'completed' | 'skipped' | 'delayed';
export type VehicleType = 'car' | 'van' | 'bike' | 'truck';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteStop {
  id: string;
  routeId: string;
  orderId: string | null;
  bookingId: string | null;
  customerId: string | null;
  address: string;
  coordinates: LatLng | null;
  stopNumber: number;
  estimatedArrival: Date;
  actualArrival: Date | null;
  serviceDuration: number; // minutes
  windowStart: Date | null;
  windowEnd: Date | null;
  status: StopStatus;
  notes: string | null;
  // Computed fields
  customerName?: string;
  customerPhone?: string;
  serviceType?: string;
}

export interface RoutePlan {
  id: string;
  storeId: string;
  name: string;
  date: Date;
  status: RouteStatus;
  stops: RouteStop[];
  totalDistance: number; // km
  estimatedDuration: number; // minutes
  actualDuration: number | null;
  fuelCost: number | null;
  assignedVehicleId: string | null;
  assignedDriverId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  storeId: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  fuelEfficiency: number | null; // km per liter
  capacity: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStopInput {
  id: string;
  address: string;
  coordinates?: LatLng;
  serviceDuration: number;
  windowStart?: Date;
  windowEnd?: Date;
  priority?: number;
}

export interface RouteOptimizationInput {
  stops: RouteStopInput[];
  startLocation: LatLng;
  endLocation?: LatLng;
  vehicleType?: VehicleType;
  departureTime?: Date;
  maxStops?: number;
}

export interface OptimizedRoute {
  stops: RouteStop[];
  totalDistance: number;
  estimatedDuration: number;
  fuelCost: number;
  polyline: string; // Encoded polyline for map display
  legs: Array<{
    from: string;
    to: string;
    distance: number;
    duration: number;
    instructions: string;
  }>;
}

export interface RouteAnalytics {
  date: Date;
  totalRoutes: number;
  totalStops: number;
  avgDistance: number;
  avgDuration: number;
  totalFuelCost: number;
  onTimeRate: number;
  completionRate: number;
}

// API Request/Response types
export interface CreateRoutePlanRequest {
  name: string;
  date: Date;
  stops: Array<{
    address: string;
    coordinates?: LatLng;
    serviceDuration?: number;
    windowStart?: Date;
    windowEnd?: Date;
    orderId?: string;
    bookingId?: string;
    customerId?: string;
  }>;
  assignedVehicleId?: string;
  assignedDriverId?: string;
}

export interface CreateVehicleRequest {
  name: string;
  type: VehicleType;
  licensePlate: string;
  fuelEfficiency?: number;
  capacity?: number;
}

export interface UpdateStopStatusRequest {
  stopId: string;
  status: StopStatus;
  actualArrival?: Date;
  notes?: string;
}
