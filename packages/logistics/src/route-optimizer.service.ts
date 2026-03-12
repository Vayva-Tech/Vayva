import { prisma } from "@vayva/db";

export interface DeliveryStop {
  id: string;
  orderId: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  timeWindow?: {
    earliest: Date;
    latest: Date;
  };
  priority: "low" | "normal" | "high" | "urgent";
  estimatedServiceTime: number; // minutes
  weight: number; // kg
  volume: number; // cubic meters
  specialInstructions?: string;
  phone: string;
  name: string;
}

export interface OptimizedRoute {
  id: string;
  storeId: string;
  driverId?: string;
  vehicleId?: string;
  date: Date;
  stops: Array<{
    stop: DeliveryStop;
    sequence: number;
    estimatedArrival: Date;
    estimatedDeparture: Date;
    drivingTimeFromPrevious: number; // minutes
    distanceFromPrevious: number; // km
  }>;
  totalDistance: number; // km
  totalTime: number; // minutes
  totalDrivingTime: number;
  fuelCost: number;
  co2Emissions: number;
  status: "planned" | "active" | "completed" | "cancelled";
  startLocation: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface RouteConstraints {
  maxDistance?: number; // km
  maxDuration?: number; // minutes
  maxStops?: number;
  vehicleCapacity?: {
    weight: number;
    volume: number;
    maxStops: number;
  };
  timeWindowStart?: Date;
  timeWindowEnd?: Date;
  respectPriority?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}

export class RouteOptimizerService {
  private readonly EARTH_RADIUS_KM = 6371;
  private readonly AVG_SPEED_KMH = 25; // Urban delivery average

  /**
   * Optimize delivery routes for a set of orders
   */
  async optimizeRoutes(
    storeId: string,
    data: {
      orderIds: string[];
      drivers?: string[];
      vehicles?: string[];
      date: Date;
      depotAddress: {
        lat: number;
        lng: number;
        address: string;
      };
      constraints?: RouteConstraints;
    }
  ): Promise<OptimizedRoute[]> {
    // Get orders with delivery info
    const orders = await prisma.order.findMany({
      where: { id: { in: data.orderIds }, storeId },
      include: { shippingAddress: true, items: true },
    });

    // Convert to stops
    const stops: DeliveryStop[] = orders.map((order) => ({
      id: `stop-${order.id}`,
      orderId: order.id,
      address: {
        street: order.shippingAddress?.address1 || "",
        city: order.shippingAddress?.city || "",
        state: order.shippingAddress?.state || "",
        country: order.shippingAddress?.country || "",
        postalCode: order.shippingAddress?.zip || "",
        coordinates: order.shippingAddress?.coordinates as { lat: number; lng: number },
      },
      priority: this.determinePriority(order),
      estimatedServiceTime: 5, // Default 5 minutes
      weight: order.items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0) / 1000,
      volume: order.items.reduce((sum, item) => {
        const vol = ((item as unknown as { dimensions: { length: number; width: number; height: number } }).dimensions?.length || 10) *
          ((item as unknown as { dimensions: { length: number; width: number; height: number } }).dimensions?.width || 10) *
          ((item as unknown as { dimensions: { length: number; width: number; height: number } }).dimensions?.height || 10);
        return sum + (vol * item.quantity) / 1000000;
      }, 0),
      phone: order.shippingAddress?.phone || "",
      name: order.shippingAddress?.name || "",
    }));

    // Geocode addresses without coordinates
    for (const stop of stops) {
      if (!stop.address.coordinates) {
        stop.address.coordinates = await this.geocodeAddress(stop.address);
      }
    }

    // Build distance matrix
    const allPoints = [data.depotAddress, ...stops.map((s) => s.address.coordinates!)];
    const distanceMatrix = await this.buildDistanceMatrix(allPoints);

    // Determine number of routes needed
    const constraints = data.constraints || {};
    const maxStopsPerRoute = constraints.maxStops || 20;
    const numRoutes = Math.ceil(stops.length / maxStopsPerRoute);

    // Cluster stops by proximity
    const clusters = this.clusterStops(stops, numRoutes, data.depotAddress);

    // Optimize each cluster into a route
    const optimizedRoutes: OptimizedRoute[] = [];

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const driverId = data.drivers?.[i];
      const vehicleId = data.vehicles?.[i];

      // Solve TSP for cluster
      const optimizedSequence = this.solveTSP(
        data.depotAddress,
        cluster,
        distanceMatrix,
        constraints
      );

      // Build route
      const route = await this.buildRoute(
        storeId,
        optimizedSequence,
        data.depotAddress,
        distanceMatrix,
        driverId,
        vehicleId,
        data.date
      );

      optimizedRoutes.push(route);
    }

    // Save routes
    for (const route of optimizedRoutes) {
      await this.saveRoute(route);
    }

    return optimizedRoutes;
  }

  /**
   * Re-optimize an active route
   */
  async reoptimizeRoute(
    routeId: string,
    updates: {
      skipStopIds?: string[];
      addStops?: DeliveryStop[];
      newDriverId?: string;
    }
  ): Promise<OptimizedRoute> {
    const existing = await prisma.optimizedRoute.findUnique({
      where: { id: routeId },
      include: { stops: { include: { order: { include: { shippingAddress: true } } } } },
    });

    if (!existing) throw new Error("Route not found");

    // Remove skipped stops
    let stops = existing.stops.filter(
      (s: Record<string, unknown>) => !updates.skipStopIds?.includes(String(s.id))
    );

    // Add new stops
    if (updates.addStops) {
      const newStops = updates.addStops.map((stop) => ({
        ...stop,
        id: `stop-${stop.orderId}-${Date.now()}`,
      }));
      stops = [...stops, ...newStops];
    }

    // Re-optimize
    const startLocation = existing.startLocation as { lat: number; lng: number; address: string };

    const allPoints = [
      startLocation,
      ...stops.map((s: Record<string, unknown>) => (s.address as { coordinates: { lat: number; lng: number } }).coordinates),
    ];
    const distanceMatrix = await this.buildDistanceMatrix(allPoints);

    const optimizedSequence = this.solveTSP(startLocation, stops, distanceMatrix);

    const route = await this.buildRoute(
      existing.storeId,
      optimizedSequence,
      startLocation,
      distanceMatrix,
      updates.newDriverId || existing.driverId,
      existing.vehicleId,
      existing.date
    );

    route.id = routeId;
    await this.saveRoute(route);

    return route;
  }

  /**
   * Get route ETA updates
   */
  async getRouteStatus(routeId: string): Promise<{
    currentStop: number;
    nextStop?: DeliveryStop;
    estimatedCompletion: Date;
    delays: Array<{ stopId: string; delayMinutes: number }>;
  }> {
    const route = await prisma.optimizedRoute.findUnique({
      where: { id: routeId },
      include: { stops: true },
    });

    if (!route) throw new Error("Route not found");

    const stops = route.stops as Array<Record<string, unknown>>;
    
    // Find current position (first uncompleted stop)
    const currentStopIndex = stops.findIndex((s) => s.status !== "completed");
    const completedStops = stops.filter((s) => s.status === "completed");

    // Calculate delays
    const delays: Array<{ stopId: string; delayMinutes: number }> = [];
    for (const stop of completedStops) {
      const actualArrival = stop.actualArrival as Date;
      const estimatedArrival = stop.estimatedArrival as Date;
      if (actualArrival && estimatedArrival) {
        const delay = Math.round((actualArrival.getTime() - estimatedArrival.getTime()) / 60000);
        if (delay > 5) {
          delays.push({ stopId: String(stop.id), delayMinutes: delay });
        }
      }
    }

    // Estimate completion based on average delay
    const avgDelay = delays.length > 0 
      ? delays.reduce((sum, d) => sum + d.delayMinutes, 0) / delays.length 
      : 0;
    
    const lastStop = stops[stops.length - 1];
    const baseCompletion = lastStop?.estimatedArrival as Date;
    const estimatedCompletion = new Date(baseCompletion.getTime() + avgDelay * 60000);

    return {
      currentStop: currentStopIndex,
      nextStop: currentStopIndex >= 0 ? (stops[currentStopIndex].stop as unknown as DeliveryStop) : undefined,
      estimatedCompletion,
      delays,
    };
  }

  /**
   * Estimate route metrics before optimization
   */
  async estimateMetrics(
    depot: { lat: number; lng: number },
    stops: Array<{ lat: number; lng: number }>
  ): Promise<{
    estimatedDistance: number;
    estimatedTime: number;
    estimatedFuelCost: number;
    vehicleCount: number;
  }> {
    let totalDistance = 0;
    let prevPoint = depot;

    // Simple nearest neighbor to estimate
    const unvisited = [...stops];
    while (unvisited.length > 0) {
      let nearest = unvisited[0];
      let nearestDist = this.haversineDistance(prevPoint, nearest);

      for (const stop of unvisited) {
        const dist = this.haversineDistance(prevPoint, stop);
        if (dist < nearestDist) {
          nearest = stop;
          nearestDist = dist;
        }
      }

      totalDistance += nearestDist;
      prevPoint = nearest;
      unvisited.splice(unvisited.indexOf(nearest), 1);
    }

    // Return to depot
    totalDistance += this.haversineDistance(prevPoint, depot);

    const estimatedTime = (totalDistance / this.AVG_SPEED_KMH) * 60 + stops.length * 5; // driving + service
    const estimatedFuelCost = totalDistance * 0.15; // ₦150 per km approx
    const vehicleCount = Math.ceil(stops.length / 20);

    return {
      estimatedDistance: Math.round(totalDistance * 10) / 10,
      estimatedTime: Math.round(estimatedTime),
      estimatedFuelCost: Math.round(estimatedFuelCost * 100), // in kobo
      vehicleCount,
    };
  }

  // Private methods
  private async geocodeAddress(address: {
    street: string;
    city: string;
    state: string;
    country: string;
  }): Promise<{ lat: number; lng: number }> {
    // In production, use Google Maps, Mapbox, or OpenStreetMap geocoding
    // For now, return approximate coordinates based on city/state
    const cityCenters: Record<string, { lat: number; lng: number }> = {
      lagos: { lat: 6.5244, lng: 3.3792 },
      abuja: { lat: 9.0765, lng: 7.3986 },
      kano: { lat: 12.0022, lng: 8.5920 },
      ibadan: { lat: 7.3775, lng: 3.9470 },
      port: { lat: 4.8156, lng: 7.0498 },
    };

    const city = address.city.toLowerCase();
    return cityCenters[city] || { lat: 6.5244, lng: 3.3792 }; // Default to Lagos
  }

  private async buildDistanceMatrix(
    points: Array<{ lat: number; lng: number }>
  ): Promise<number[][]> {
    const matrix: number[][] = [];

    for (let i = 0; i < points.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < points.length; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = this.haversineDistance(points[i], points[j]);
        }
      }
    }

    return matrix;
  }

  private haversineDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const dLat = this.degreesToRadians(point2.lat - point1.lat);
    const dLon = this.degreesToRadians(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(point1.lat)) *
        Math.cos(this.degreesToRadians(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_KM * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private clusterStops(
    stops: DeliveryStop[],
    numClusters: number,
    depot: { lat: number; lng: number }
  ): DeliveryStop[][] {
    if (numClusters === 1) return [stops];

    // Simple k-means clustering
    const clusters: DeliveryStop[][] = Array.from({ length: numClusters }, () => []);

    // Sort by angle from depot for sweep algorithm
    const sorted = stops
      .map((stop) => ({
        stop,
        angle: Math.atan2(
          stop.address.coordinates!.lng - depot.lng,
          stop.address.coordinates!.lat - depot.lat
        ),
      }))
      .sort((a, b) => a.angle - b.angle);

    // Distribute stops evenly
    const perCluster = Math.ceil(stops.length / numClusters);
    for (let i = 0; i < numClusters; i++) {
      clusters[i] = sorted
        .slice(i * perCluster, (i + 1) * perCluster)
        .map((s) => s.stop);
    }

    return clusters.filter((c) => c.length > 0);
  }

  private solveTSP(
    depot: { lat: number; lng: number },
    stops: DeliveryStop[],
    distanceMatrix: number[][],
    constraints?: RouteConstraints
  ): DeliveryStop[] {
    // Nearest neighbor heuristic with 2-opt improvement
    const unvisited = [...stops];
    const route: DeliveryStop[] = [];

    // Start from depot
    let currentIdx = 0; // Depot is at index 0
    let currentPoint = depot;

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const stop = unvisited[i];
        const dist = this.haversineDistance(currentPoint, stop.address.coordinates!);

        // Check time window constraints
        if (constraints?.timeWindowStart && stop.timeWindow) {
          // Simplified: just use distance for now
        }

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      route.push(unvisited[nearestIdx]);
      currentPoint = unvisited[nearestIdx].address.coordinates!;
      unvisited.splice(nearestIdx, 1);
    }

    // Apply 2-opt improvement
    return this.twoOpt(route, depot);
  }

  private twoOpt(route: DeliveryStop[], depot: { lat: number; lng: number }): DeliveryStop[] {
    let improved = true;
    let bestRoute = [...route];

    while (improved) {
      improved = false;

      for (let i = 0; i < bestRoute.length - 1; i++) {
        for (let j = i + 1; j < bestRoute.length; j++) {
          const newRoute = this.twoOptSwap(bestRoute, i, j);
          const currentDist = this.routeDistance(bestRoute, depot);
          const newDist = this.routeDistance(newRoute, depot);

          if (newDist < currentDist) {
            bestRoute = newRoute;
            improved = true;
          }
        }
      }
    }

    return bestRoute;
  }

  private twoOptSwap(route: DeliveryStop[], i: number, j: number): DeliveryStop[] {
    const newRoute = route.slice(0, i);
    const reversed = route.slice(i, j + 1).reverse();
    newRoute.push(...reversed);
    newRoute.push(...route.slice(j + 1));
    return newRoute;
  }

  private routeDistance(route: DeliveryStop[], depot: { lat: number; lng: number }): number {
    let dist = this.haversineDistance(depot, route[0]?.address.coordinates || depot);

    for (let i = 0; i < route.length - 1; i++) {
      dist += this.haversineDistance(
        route[i].address.coordinates!,
        route[i + 1].address.coordinates!
      );
    }

    if (route.length > 0) {
      dist += this.haversineDistance(route[route.length - 1].address.coordinates!, depot);
    }

    return dist;
  }

  private async buildRoute(
    storeId: string,
    stops: DeliveryStop[],
    startLocation: { lat: number; lng: number; address: string },
    distanceMatrix: number[][],
    driverId: string | undefined,
    vehicleId: string | undefined,
    date: Date
  ): Promise<OptimizedRoute> {
    let currentTime = new Date(date);
    currentTime.setHours(9, 0, 0, 0); // Start at 9 AM

    let totalDistance = 0;
    let totalDrivingTime = 0;

    const routeStops = stops.map((stop, index) => {
      // Distance from previous point
      const prevPoint = index === 0 ? startLocation : stops[index - 1].address.coordinates!;
      const distance = this.haversineDistance(prevPoint, stop.address.coordinates!);
      const drivingTime = (distance / this.AVG_SPEED_KMH) * 60;

      totalDistance += distance;
      totalDrivingTime += drivingTime;

      const estimatedArrival = new Date(currentTime.getTime() + drivingTime * 60000);
      const estimatedDeparture = new Date(
        estimatedArrival.getTime() + stop.estimatedServiceTime * 60000
      );

      currentTime = estimatedDeparture;

      return {
        stop,
        sequence: index + 1,
        estimatedArrival,
        estimatedDeparture,
        drivingTimeFromPrevious: Math.round(drivingTime),
        distanceFromPrevious: Math.round(distance * 10) / 10,
      };
    });

    // Add return to depot
    if (stops.length > 0) {
      const returnDistance = this.haversineDistance(
        stops[stops.length - 1].address.coordinates!,
        startLocation
      );
      totalDistance += returnDistance;
      totalDrivingTime += (returnDistance / this.AVG_SPEED_KMH) * 60;
    }

    const totalServiceTime = stops.reduce((sum, s) => sum + s.estimatedServiceTime, 0);
    const totalTime = totalDrivingTime + totalServiceTime;

    return {
      id: `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      storeId,
      driverId,
      vehicleId,
      date,
      stops: routeStops,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime: Math.round(totalTime),
      totalDrivingTime: Math.round(totalDrivingTime),
      fuelCost: Math.round(totalDistance * 0.15 * 100), // kobo
      co2Emissions: Math.round(totalDistance * 0.12 * 10) / 10, // kg
      status: "planned",
      startLocation,
    };
  }

  private async saveRoute(route: OptimizedRoute): Promise<void> {
    await prisma.optimizedRoute.upsert({
      where: { id: route.id },
      create: {
        id: route.id,
        storeId: route.storeId,
        driverId: route.driverId,
        vehicleId: route.vehicleId,
        date: route.date,
        stops: route.stops as unknown as Record<string, unknown>[],
        totalDistance: route.totalDistance,
        totalTime: route.totalTime,
        totalDrivingTime: route.totalDrivingTime,
        fuelCost: route.fuelCost,
        co2Emissions: route.co2Emissions,
        status: route.status,
        startLocation: route.startLocation,
      },
      update: {
        stops: route.stops as unknown as Record<string, unknown>[],
        totalDistance: route.totalDistance,
        totalTime: route.totalTime,
        totalDrivingTime: route.totalDrivingTime,
        fuelCost: route.fuelCost,
        co2Emissions: route.co2Emissions,
        driverId: route.driverId,
        vehicleId: route.vehicleId,
      },
    });
  }

  private determinePriority(order: Record<string, unknown>): DeliveryStop["priority"] {
    const total = Number(order.total || 0);
    const shippingMethod = String(order.shippingMethod || "").toLowerCase();

    if (shippingMethod.includes("express") || shippingMethod.includes("same")) return "urgent";
    if (total > 10000000) return "high"; // > ₦100,000
    if (total > 5000000) return "normal"; // > ₦50,000
    return "low";
  }
}

// Export singleton instance
export const routeOptimizerService = new RouteOptimizerService();
