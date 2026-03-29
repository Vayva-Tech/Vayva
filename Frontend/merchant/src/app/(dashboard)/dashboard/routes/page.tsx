"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  MapPin,
  Route,
  Truck,
  Package,
  Clock,
  Navigation,
  Plus,
  RefreshCw,
  Play,
  CheckCircle,
  AlertCircle,
  Map,
  Fuel,
  Timer,
  ChevronRight,
  Target,
  BarChart3,
} from "lucide-react";

// Types
interface DeliveryRoute {
  id: string;
  name: string;
  status: "planned" | "active" | "completed" | "cancelled";
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  stops: RouteStop[];
  metrics: {
    totalDistance: number;
    estimatedTime: number;
    fuelCost: number;
    actualDistance?: number;
    actualTime?: number;
    savings: number;
  };
  optimizationLevel: "basic" | "balanced" | "aggressive";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface RouteStop {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  phone?: string;
  sequence: number;
  status: "pending" | "arrived" | "delivered" | "failed";
  estimatedArrival: string;
  actualArrival?: string;
  coords: {
    lat: number;
    lng: number;
  };
  deliveryInstructions?: string;
}

interface Vehicle {
  id: string;
  name: string;
  type: "bike" | "car" | "van" | "truck";
  capacity: number;
  fuelEfficiency: number;
  status: "available" | "in_use" | "maintenance";
  currentRouteId?: string;
}

interface RouteStats {
  totalRoutes: number;
  activeRoutes: number;
  totalStops: number;
  avgDistance: number;
  totalFuelCost: number;
  totalSavings: number;
  onTimeDelivery: number;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  planned: { color: "bg-blue-100 text-blue-800", icon: <Clock className="w-3 h-3" /> },
  active: { color: "bg-orange-100 text-amber-800", icon: <Navigation className="w-3 h-3" /> },
  completed: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-3 h-3" /> },
};

const VEHICLE_ICONS: Record<string, React.ReactNode> = {
  bike: <span className="text-2xl">🏍️</span>,
  car: <span className="text-2xl">🚗</span>,
  van: <span className="text-2xl">🚐</span>,
  truck: <span className="text-2xl">🚚</span>,
};

export default function RouteOptimizerDashboard() {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<RouteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routesRes, vehiclesRes, statsRes] = await Promise.all([
        apiJson<{ routes: DeliveryRoute[] }>("/routes"),
        apiJson<{ vehicles: Vehicle[] }>("/routes/vehicles"),
        apiJson<RouteStats>("/routes/stats"),
      ]);

      setRoutes(routesRes.routes || []);
      setVehicles(vehiclesRes.vehicles || []);
      setStats(statsRes);
    } catch (error) {
      logger.error("[Routes] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async (routeId: string) => {
    try {
      await apiJson(`/api/routes/${routeId}/optimize`, { method: "POST" });
      loadData();
    } catch (error) {
      logger.error("[Routes] Optimize failed:", { error });
    }
  };

  const handleStartRoute = async (routeId: string) => {
    try {
      await apiJson(`/api/routes/${routeId}/start`, { method: "POST" });
      loadData();
    } catch (error) {
      logger.error("[Routes] Start failed:", { error });
    }
  };

  const handleCreateRoute = async (data: {
    name: string;
    vehicleId: string;
    optimizationLevel: string;
    orderIds: string[];
  }) => {
    try {
      await apiJson("/routes", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      logger.error("[Routes] Create failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const activeRoutes = routes.filter((r) => r.status === "active");
  const plannedRoutes = routes.filter((r) => r.status === "planned");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Route className="w-7 h-7 text-green-600" />
            Route Optimizer
          </h1>
          <p className="text-gray-500 mt-1">
            AI-powered delivery route planning and optimization
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Route
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Route className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Routes</p>
                  <p className="text-2xl font-bold">{stats.totalRoutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Navigation className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold">{stats.activeRoutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stops</p>
                  <p className="text-2xl font-bold">{stats.totalStops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">On-Time</p>
                  <p className="text-2xl font-bold">{stats.onTimeDelivery}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Savings</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalSavings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Routes */}
      {activeRoutes.length > 0 && (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-600" />
              Active Routes ({activeRoutes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeRoutes.map((route) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-orange-50/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                      {VEHICLE_ICONS[route.vehicleName.includes("Bike") ? "bike" : "van"]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{route.name}</h3>
                      <p className="text-sm text-gray-500">
                        {route.driverName} • {route.stops.filter((s) => s.status === "delivered").length} / {route.stops.length} delivered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{route.metrics.totalDistance.toFixed(1)} km</p>
                      <p className="text-xs text-gray-500">{Math.round(route.metrics.estimatedTime / 60)} min</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedRoute(route)}
                    >
                      Track
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="routes" className="w-full">
        <TabsList>
          <TabsTrigger value="routes">
            All Routes
            {plannedRoutes.length > 0 && (
              <Badge variant="secondary" className="ml-2">{plannedRoutes.length} planned</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Routes Tab */}
        <TabsContent value="routes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Planning</CardTitle>
              <CardDescription>Optimize delivery sequences for efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Stops</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Est. Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell>
                        <span className="font-medium">{route.name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {VEHICLE_ICONS.van}
                          <span>{route.vehicleName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{route.stops.length}</TableCell>
                      <TableCell>{route.metrics.totalDistance.toFixed(1)} km</TableCell>
                      <TableCell>{Math.round(route.metrics.estimatedTime / 60)} min</TableCell>
                      <TableCell>
                        <Badge className={STATUS_CONFIG[route.status].color}>
                          {STATUS_CONFIG[route.status].icon}
                          <span className="ml-1 capitalize">{route.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRoute(route)}
                          >
                            View
                          </Button>
                          {route.status === "planned" && (
                            <Button
                              size="sm"
                              onClick={() => handleStartRoute(route.id)}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {routes.length === 0 && (
                <div className="text-center py-12">
                  <Route className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No routes created yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first route
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          {VEHICLE_ICONS[vehicle.type]}
                        </div>
                        <div>
                          <p className="font-medium">{vehicle.name}</p>
                          <Badge
                            variant={vehicle.status === "available" ? "default" : "outline"}
                            className={vehicle.status === "available" ? "bg-green-100 text-green-800" : ""}
                          >
                            {vehicle.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-500">
                        <p>Capacity: {vehicle.capacity} orders</p>
                        <p>Fuel: {vehicle.fuelEfficiency} km/L</p>
                        {vehicle.currentRouteId && (
                          <p className="text-orange-600">On active route</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="w-5 h-5" />
                  Fuel Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Fuel Cost</span>
                    <span className="font-semibold">{formatCurrency(stats?.totalFuelCost || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Optimization Savings</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(stats?.totalSavings || 0)}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-sm text-green-800">
                      Routes optimized with AI have saved an average of 23% on fuel costs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Delivery Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">On-Time Delivery Rate</span>
                    <span className="font-semibold">{stats?.onTimeDelivery || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Average Distance</span>
                    <span className="font-semibold">{stats?.avgDistance.toFixed(1) || 0} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Stops</span>
                    <span className="font-semibold">{stats?.totalStops || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Route Details Dialog */}
      {selectedRoute && (
        <Dialog open={!!selectedRoute} onOpenChange={() => setSelectedRoute(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                {selectedRoute.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Route Summary */}
              <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedRoute.stops.length}</p>
                  <p className="text-xs text-gray-500">Stops</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedRoute.metrics.totalDistance.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">km</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round(selectedRoute.metrics.estimatedTime / 60)}</p>
                  <p className="text-xs text-gray-500">minutes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatCurrency(selectedRoute.metrics.fuelCost)}</p>
                  <p className="text-xs text-gray-500">fuel cost</p>
                </div>
              </div>

              {/* Stops List */}
              <div>
                <h4 className="font-medium mb-3">Delivery Sequence</h4>
                <div className="space-y-2">
                  {selectedRoute.stops.map((stop, index) => (
                    <div
                      key={stop.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                        {stop.sequence}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{stop.customerName}</p>
                        <p className="text-sm text-gray-500">{stop.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(stop.estimatedArrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            stop.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : stop.status === "arrived"
                              ? "bg-blue-100 text-blue-800"
                              : ""
                          }
                        >
                          {stop.status}
                        </Badge>
                      </div>
                      {index < selectedRoute.stops.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Vehicle & Driver</h4>
                <div className="flex items-center gap-3">
                  {VEHICLE_ICONS.van}
                  <div>
                    <p className="font-medium">{selectedRoute.vehicleName}</p>
                    <p className="text-sm text-gray-500">{selectedRoute.driverName}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Route Dialog */}
      <CreateRouteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        vehicles={vehicles}
        onSubmit={handleCreateRoute}
      />
    </div>
  );
}

function CreateRouteDialog({
  open,
  onOpenChange,
  vehicles,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  onSubmit: (data: {
    name: string;
    vehicleId: string;
    optimizationLevel: string;
    orderIds: string[];
  }) => void;
}) {
  const [name, setName] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [optimizationLevel, setOptimizationLevel] = useState("balanced");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      vehicleId,
      optimizationLevel,
      orderIds: [], // Would be populated from selection
    });
  };

  const availableVehicles = vehicles.filter((v) => v.status === "available");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Route</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Route Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Lagos Island Morning Route"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label>Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div className="flex items-center gap-2">
                      {VEHICLE_ICONS[vehicle.type]}
                      {vehicle.name} ({vehicle.capacity} orders)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Optimization Level</Label>
            <Select value={optimizationLevel} onValueChange={setOptimizationLevel}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic - Faster planning</SelectItem>
                <SelectItem value="balanced">Balanced - Recommended</SelectItem>
                <SelectItem value="aggressive">Aggressive - Maximum savings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || !vehicleId}>
              <Route className="w-4 h-4 mr-2" />
              Create Route
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
