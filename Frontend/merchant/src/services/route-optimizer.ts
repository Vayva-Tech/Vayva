/**
 * Route Optimizer Service
 * Mobile Services - Operational Excellence Tools
 */

import { PrismaClient } from '@vayva/db';
import type {
  RouteStopInput,
  LatLng,
  RoutePlan,
  RouteStop,
  Vehicle,
  RouteOptimizationInput,
  OptimizedRoute,
  RouteAnalytics,
  RouteStatus,
  StopStatus,
  VehicleType,
  CreateRoutePlanRequest,
  CreateVehicleRequest,
  UpdateStopStatusRequest,
} from '@/types/route-optimizer';

// Google Maps or similar routing service interface
interface RoutingService {
  calculateDistanceMatrix(origins: LatLng[], destinations: LatLng[]): Promise<number[][]>;
  optimizeRoute(stops: LatLng[], start: LatLng, end?: LatLng): Promise<OptimizedRoute>;
  geocodeAddress(address: string): Promise<LatLng | null>;
}

// Prisma Decimal type helper
type Decimal = { toNumber(): number } | number;

function toNumber(d: Decimal): number {
  return typeof d === 'number' ? d : d.toNumber();
}

export class RouteOptimizerService {
  private db: PrismaClient;
  private routingService: RoutingService;

  constructor(routingService: RoutingService) {
    this.db = new PrismaClient();
    this.routingService = routingService;
  }

  // ============================================================================
  // Vehicle Management
  // ============================================================================

  async createVehicle(storeId: string, data: CreateVehicleRequest): Promise<Vehicle> {
    const vehicle = await this.db?.vehicle.create({
      data: {
        storeId,
        name: data.name,
        type: data.type?.toUpperCase() as VehicleTypeDb,
        licensePlate: data.licensePlate,
        fuelEfficiency: data.fuelEfficiency ?? null,
        capacity: data.capacity ?? null,
        isActive: true,
      },
    });

    return this.mapVehicle(vehicle);
  }

  async getVehicles(storeId: string, options?: { isActive?: boolean }): Promise<Vehicle[]> {
    const vehicles = await this.db?.vehicle.findMany({
      where: {
        storeId,
        ...(options?.isActive !== undefined && { isActive: options.isActive }),
      },
      orderBy: { name: 'asc' },
    });

    return vehicles.map((v) => this.mapVehicle(v));
  }

  async updateVehicle(
    storeId: string,
    vehicleId: string,
    data: Partial<CreateVehicleRequest>
  ): Promise<Vehicle> {
    const vehicle = await this.db?.vehicle.update({
      where: { id: vehicleId, storeId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type?.toUpperCase() as VehicleTypeDb }),
        ...(data.licensePlate && { licensePlate: data.licensePlate }),
        ...(data.fuelEfficiency !== undefined && { fuelEfficiency: data.fuelEfficiency }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
      },
    });

    return this.mapVehicle(vehicle);
  }

  async deleteVehicle(storeId: string, vehicleId: string): Promise<void> {
    await this.db?.vehicle.delete({
      where: { id: vehicleId, storeId },
    });
  }

  // ============================================================================
  // Route Planning
  // ============================================================================

  async optimizeRoute(input: RouteOptimizationInput): Promise<OptimizedRoute> {
    // Geocode addresses that don't have coordinates
    const stopsWithCoords = await Promise.all(
      input.stops.map(async (stop: RouteStopInput) => ({
        ...stop,
        coordinates: stop.coordinates ?? (await this.routingService.geocodeAddress(stop.address)) ?? null,
      }))
    );

    // Filter out stops without coordinates
    const validStops = stopsWithCoords.filter(
      (s): s is RouteStopInput & { coordinates: LatLng } => s.coordinates !== null
    );

    if (validStops.length === 0) {
      throw new Error('No valid stops with coordinates');
    }

    // Build distance matrix for TSP approximation
    const allPoints = [input.startLocation, ...validStops.map((s: RouteStopInput & { coordinates: LatLng }) => s.coordinates)];
    const distanceMatrix = await this.routingService.calculateDistanceMatrix(allPoints, allPoints);

    // Solve TSP with time windows (simplified nearest neighbor + 2-opt)
    const optimizedOrder = this.solveTSPWithConstraints(
      validStops,
      distanceMatrix,
      input.departureTime
    );

    // Calculate route details
    let totalDistance = 0;
    let totalDuration = 0;
    const legs: OptimizedRoute['legs'] = [];

    // From start to first stop
    const startToFirst = distanceMatrix[0][optimizedOrder[0].index + 1];
    totalDistance += startToFirst;
    totalDuration += this.estimateDuration(startToFirst);
    legs.push({
      from: 'Start',
      to: optimizedOrder[0].stop.address,
      distance: startToFirst,
      duration: this.estimateDuration(startToFirst),
      instructions: `Head to ${optimizedOrder[0].stop.address}`,
    });

    // Between stops
    for (let i = 0; i < optimizedOrder.length - 1; i++) {
      const current = optimizedOrder[i];
      const next = optimizedOrder[i + 1];
      const distance = distanceMatrix[current.index + 1][next.index + 1];
      const duration = this.estimateDuration(distance);

      totalDistance += distance;
      totalDuration += duration + current.stop?.serviceDuration;

      legs.push({
        from: current.stop?.address,
        to: next.stop?.address,
        distance,
        duration,
        instructions: `Continue to ${next?.stop?.address}`,
      });
    }

    // Calculate fuel cost (assuming 12km/l for car, 30km/l for bike)
    const fuelEfficiency = input.vehicleType === 'bike' ? 30 : 12;
    const fuelNeeded = totalDistance / fuelEfficiency;
    const fuelCost = fuelNeeded * 700; // Assuming ₦700 per liter

    // Build optimized route
    let currentTime = input.departureTime ?? new Date();
    const routeStops: RouteStop[] = optimizedOrder.map((item: { stop: RouteStopInput; index: number }, index: number) => {
      const travelTime = index === 0
        ? this.estimateDuration(distanceMatrix[0][item.index + 1])
        : this.estimateDuration(distanceMatrix[optimizedOrder[index - 1].index + 1][item.index + 1]);

      currentTime = new Date(currentTime.getTime() + travelTime * 60 * 1000);
      const arrivalTime = new Date(currentTime);

      currentTime = new Date(currentTime.getTime() + item.stop?.serviceDuration * 60 * 1000);

      return {
        id: item.stop.id,
        routeId: '',
        orderId: null,
        bookingId: null,
        customerId: null,
        address: item.stop.address,
        coordinates: item.stop.coordinates ?? null,
        stopNumber: index + 1,
        estimatedArrival: arrivalTime,
        actualArrival: null,
        serviceDuration: item.stop.serviceDuration,
        windowStart: item.stop.windowStart ?? null,
        windowEnd: item.stop.windowEnd ?? null,
        status: 'pending',
        notes: null,
      };
    });

    return {
      stops: routeStops,
      totalDistance: Math.round(totalDistance * 100) / 100,
      estimatedDuration: totalDuration,
      fuelCost: Math.round(fuelCost * 100) / 100,
      polyline: '', // Would be generated by routing service
      legs,
    };
  }

  async saveRoutePlan(
    storeId: string,
    name: string,
    date: Date,
    optimizedRoute: OptimizedRoute,
    options?: {
      assignedVehicleId?: string;
      assignedDriverId?: string;
    }
  ): Promise<RoutePlan> {
    const plan = await this.db?.routePlan.create({
      data: {
        storeId,
        name,
        date,
        status: 'PLANNED',
        totalDistance: optimizedRoute.totalDistance,
        estimatedDuration: optimizedRoute.estimatedDuration,
        fuelCost: optimizedRoute.fuelCost,
        assignedVehicleId: options?.assignedVehicleId ?? null,
        assignedDriverId: options?.assignedDriverId ?? null,
        stops: {
          create: optimizedRoute.stops?.map((stop: RouteStop) => ({
            address: stop.address,
            lat: stop.coordinates?.lat ?? null,
            lng: stop.coordinates?.lng ?? null,
            stopNumber: stop.stopNumber,
            estimatedArrival: stop.estimatedArrival,
            serviceDuration: stop.serviceDuration,
            windowStart: stop.windowStart,
            windowEnd: stop.windowEnd,
            status: 'PENDING',
          })),
        },
      },
      include: { stops: true },
    });

    return this.mapRoutePlan(plan);
  }

  async getRoutePlans(
    storeId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      status?: RouteStatus;
    }
  ): Promise<RoutePlan[]> {
    const plans = await this.db?.routePlan.findMany({
      where: {
        storeId,
        ...(options?.startDate && { date: { gte: options.startDate } }),
        ...(options?.endDate && { date: { lte: options.endDate } }),
        ...(options?.status && { status: options.status.toUpperCase() as RoutePlanStatusDb }),
      },
      include: { stops: true },
      orderBy: { date: 'desc' },
    });

    return plans.map((p: RoutePlanDb) => this.mapRoutePlan(p));
  }

  async getRoutePlanById(storeId: string, routeId: string): Promise<RoutePlan | null> {
    const plan = await this.db?.routePlan.findFirst({
      where: { id: routeId, storeId },
      include: { stops: true },
    });

    if (!plan) return null;

    return this.mapRoutePlan(plan);
  }

  async updateRouteStatus(
    storeId: string,
    routeId: string,
    status: RouteStatus,
    options?: { actualDuration?: number }
  ): Promise<RoutePlan> {
    const plan = await this.db?.routePlan.update({
      where: { id: routeId, storeId },
      data: {
        status: status.toUpperCase() as RoutePlanStatusDb,
        ...(options?.actualDuration && { actualDuration: options.actualDuration }),
      },
      include: { stops: true },
    });

    return this.mapRoutePlan(plan);
  }

  async updateStopStatus(
    storeId: string,
    routeId: string,
    data: UpdateStopStatusRequest
  ): Promise<RouteStop> {
    const stop = await this.db?.routeStop.update({
      where: {
        id: data.stopId,
        route: { id: routeId, storeId },
      },
      data: {
        status: data.status.toUpperCase() as RouteStopStatusDb,
        ...(data.actualArrival && { actualArrival: data.actualArrival }),
        ...(data.notes && { notes: data.notes }),
      },
    });

    return this.mapRouteStop(stop);
  }

  // ============================================================================
  // Route Optimization Algorithms
  // ============================================================================

  private solveTSPWithConstraints(
    stops: Array<{
      id: string;
      address: string;
      coordinates: LatLng;
      serviceDuration: number;
      windowStart?: Date;
      windowEnd?: Date;
      priority?: number;
    }>,
    distanceMatrix: number[][],
    departureTime?: Date
  ): Array<{ stop: typeof stops[0]; index: number }> {
    const n = stops.length;
    const visited = new Set<number>();
    const route: Array<{ stop: typeof stops[0]; index: number }> = [];

    // Start from depot (index 0 in matrix)
    let current = 0;

    while (visited.size < n) {
      let nextStop = -1;
      let minScore = Infinity;

      for (let i = 0; i < n; i++) {
        if (visited.has(i)) continue;

        const distance = distanceMatrix[current][i + 1];
        const priority = stops[i].priority ?? 5;

        // Calculate score: lower is better
        // Combine distance and priority (weighted)
        const score = distance * (11 - priority); // Higher priority = lower score

        // Check time window feasibility
        if (stops[i].windowStart && stops[i].windowEnd) {
          // Simplified: just check if we could arrive within window
          // In real implementation, calculate actual arrival time
        }

        if (score < minScore) {
          minScore = score;
          nextStop = i;
        }
      }

      if (nextStop === -1) break;

      visited.add(nextStop);
      route.push({ stop: stops[nextStop], index: nextStop });
      current = nextStop + 1;
    }

    // Apply 2-opt improvement
    return this.applyTwoOpt(route, distanceMatrix);
  }

  private applyTwoOpt<T extends { stop: { id: string }; index: number }>(
    route: T[],
    distanceMatrix: number[][]
  ): T[] {
    let improved = true;
    let best = [...route];

    while (improved) {
      improved = false;

      for (let i = 0; i < best.length - 1; i++) {
        for (let j = i + 1; j < best.length; j++) {
          // Calculate current segment distances
          const currentDist = this.calculateRouteDistance(best, distanceMatrix);

          // Try swap
          const swapped = this.twoOptSwap(best, i, j);
          const newDist = this.calculateRouteDistance(swapped, distanceMatrix);

          if (newDist < currentDist) {
            best = swapped;
            improved = true;
          }
        }
      }
    }

    return best;
  }

  private twoOptSwap<T extends { stop: { id: string }; index: number }>(
    route: T[],
    i: number,
    j: number
  ): T[] {
    const newRoute = route.slice(0, i);
    const reversed = route.slice(i, j + 1).reverse();
    newRoute.push(...reversed);
    newRoute.push(...route.slice(j + 1));
    return newRoute;
  }

  private calculateRouteDistance(
    route: Array<{ index: number }>,
    distanceMatrix: number[][]
  ): number {
    let dist = distanceMatrix[0][route[0].index + 1]; // From depot to first

    for (let i = 0; i < route.length - 1; i++) {
      dist += distanceMatrix[route[i].index + 1][route[i + 1].index + 1];
    }

    return dist;
  }

  private estimateDuration(distanceKm: number): number {
    // Assume average speed of 30km/h in urban areas
    return Math.ceil((distanceKm / 30) * 60);
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  async getRouteAnalytics(storeId: string, startDate: Date, endDate: Date): Promise<RouteAnalytics[]> {
    const completedRoutes = await this.db?.routePlan.findMany({
      where: {
        storeId,
        status: 'COMPLETED',
        date: { gte: startDate, lte: endDate },
      },
      include: { stops: true },
    });

    // Group by date
    const byDate = new Map<string, typeof completedRoutes>();
    for (const route of completedRoutes) {
      const dateKey = route.date?.toISOString().split('T')[0];
      const existing = byDate.get(dateKey) ?? [];
      existing.push(route);
      byDate.set(dateKey, existing);
    }

    const analytics: RouteAnalytics[] = [];
    for (const [dateStr, routes] of Array.from(byDate.entries())) {
      const allStops = routes.flatMap((r) => r.stops);
      const completedStops = allStops.filter((s: RouteStopDb) => s.status === 'COMPLETED');
      const onTimeStops = completedStops.filter((s: RouteStopDb) =>
        s.actualArrival && s.estimatedArrival &&
        s.actualArrival?.getTime() <= s.estimatedArrival?.getTime() + 15 * 60 * 1000 // 15 min grace
      );

      const totalDistance = routes.reduce((sum: number, r: RoutePlanDb) => sum + toNumber(r.totalDistance), 0);
      const totalDuration = routes.reduce((sum: number, r: RoutePlanDb) => sum + (r.actualDuration ?? r.estimatedDuration), 0);
      const totalFuelCost = routes.reduce((sum: number, r: RoutePlanDb) => sum + (r.fuelCost ? toNumber(r.fuelCost) : 0), 0);

      analytics.push({
        date: new Date(dateStr),
        totalRoutes: routes.length,
        totalStops: allStops.length,
        avgDistance: routes.length > 0 ? totalDistance / routes.length : 0,
        avgDuration: routes.length > 0 ? totalDuration / routes.length : 0,
        totalFuelCost,
        onTimeRate: completedStops.length > 0 ? onTimeStops.length / completedStops.length : 0,
        completionRate: allStops.length > 0 ? completedStops.length / allStops.length : 0,
      });
    }

    return analytics.sort((a: RouteAnalytics, b: RouteAnalytics) => a.date.getTime() - b.date.getTime());
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private mapVehicle(vehicle: VehicleDb): Vehicle {
    return {
      id: vehicle.id,
      storeId: vehicle.storeId,
      name: vehicle.name,
      type: vehicle.type?.toLowerCase() as VehicleType,
      licensePlate: vehicle.licensePlate,
      fuelEfficiency: vehicle.fuelEfficiency ? toNumber(vehicle.fuelEfficiency) : null,
      capacity: vehicle.capacity,
      isActive: vehicle.isActive,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  private mapRoutePlan(plan: RoutePlanDb): RoutePlan {
    return {
      id: plan.id,
      storeId: plan.storeId,
      name: plan.name,
      date: plan.date,
      status: (plan as { status: RoutePlanStatusDb }).status.toLowerCase() as RouteStatus,
      stops: plan.stops?.map((s: RouteStopDb) => this.mapRouteStop(s)),
      totalDistance: toNumber(plan.totalDistance),
      estimatedDuration: plan.estimatedDuration,
      actualDuration: plan.actualDuration,
      fuelCost: plan.fuelCost ? toNumber(plan.fuelCost) : null,
      assignedVehicleId: plan.assignedVehicleId,
      assignedDriverId: plan.assignedDriverId,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private mapRouteStop(stop: RouteStopDb): RouteStop {
    return {
      id: stop.id,
      routeId: stop.routeId,
      orderId: stop.orderId,
      bookingId: stop.bookingId,
      customerId: stop.customerId,
      address: stop.address,
      coordinates: stop.lat && stop.lng ? { lat: toNumber(stop.lat), lng: toNumber(stop.lng) } : null,
      stopNumber: stop.stopNumber,
      estimatedArrival: stop.estimatedArrival,
      actualArrival: stop.actualArrival,
      serviceDuration: stop.serviceDuration,
      windowStart: stop.windowStart,
      windowEnd: stop.windowEnd,
      status: (stop as { status: RouteStopStatusDb }).status.toLowerCase() as StopStatus,
      notes: stop.notes,
    };
  }
}

// Database type aliases
type VehicleTypeDb = 'CAR' | 'VAN' | 'BIKE' | 'TRUCK';
type RoutePlanStatusDb = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type RouteStopStatusDb = 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'SKIPPED' | 'DELAYED';

type VehicleDb = {
  id: string;
  storeId: string;
  name: string;
  type: VehicleTypeDb;
  licensePlate: string;
  fuelEfficiency: Decimal | null;
  capacity: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type RouteStopDb = {
  id: string;
  routeId: string;
  orderId: string | null;
  bookingId: string | null;
  customerId: string | null;
  address: string;
  lat: Decimal | null;
  lng: Decimal | null;
  stopNumber: number;
  estimatedArrival: Date;
  actualArrival: Date | null;
  serviceDuration: number;
  windowStart: Date | null;
  windowEnd: Date | null;
  status: RouteStopStatusDb;
  notes: string | null;
};

type RoutePlanDb = {
  id: string;
  storeId: string;
  name: string;
  date: Date;
  status: RoutePlanStatusDb;
  totalDistance: Decimal;
  estimatedDuration: number;
  actualDuration: number | null;
  fuelCost: Decimal | null;
  assignedVehicleId: string | null;
  assignedDriverId: string | null;
  createdAt: Date;
  updatedAt: Date;
  stops: RouteStopDb[];
};
