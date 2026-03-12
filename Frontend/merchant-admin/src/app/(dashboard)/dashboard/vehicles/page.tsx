"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Car,
  Plus,
  Spinner as Loader2,
  PencilSimple as Edit,
  Trash,
  CheckCircle,
  XCircle,
  Engine,
  Wrench,
  CalendarBlank,
  MagnifyingGlass,
  User,
} from "@phosphor-icons/react/ssr";
import { logger, formatCurrency } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  status: "available" | "rented" | "maintenance" | "retired";
  mileage: number;
  dailyRate: number;
  category: "sedan" | "suv" | "truck" | "van" | "luxury" | "economy";
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
  transmission: "automatic" | "manual";
  seats: number;
  features: string[];
  lastMaintenanceDate?: string;
  nextMaintenanceDue?: string;
  insuranceExpiry?: string;
  location: string;
  images?: string[];
}

export default function VehiclesPage() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    licensePlate: "",
    color: "",
    status: "available" as string,
    mileage: 0,
    dailyRate: "",
    category: "sedan" as string,
    fuelType: "gasoline" as string,
    transmission: "automatic" as string,
    seats: 5,
    features: "",
    location: "",
    lastMaintenanceDate: "",
    nextMaintenanceDue: "",
    insuranceExpiry: "",
  });

  useEffect(() => {
    void fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Vehicle[]>("/api/vehicles");
      setVehicles(data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_VEHICLES_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Could not load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.make || !formData.model || !formData.vin) {
      return toast.error("Please fill all required fields (Make, Model, VIN)");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        dailyRate: Number(formData.dailyRate),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        seats: Number(formData.seats),
        features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      };

      if (editingVehicle) {
        await apiJson(`/api/vehicles/${editingVehicle.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Vehicle updated");
      } else {
        await apiJson("/api/vehicles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Vehicle added to fleet");
      }

      setIsOpen(false);
      setEditingVehicle(null);
      resetForm();
      void fetchVehicles();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_VEHICLE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to save vehicle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/vehicles/${id}`, { method: "DELETE" });
      toast.success("Vehicle removed from fleet");
      setDeleteConfirm(null);
      void fetchVehicles();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_VEHICLE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to remove vehicle");
    }
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate || "",
      color: vehicle.color || "",
      status: vehicle.status as string,
      mileage: vehicle.mileage,
      dailyRate: String(vehicle.dailyRate),
      category: vehicle.category,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      features: vehicle.features?.join(", ") || "",
      location: vehicle.location || "",
      lastMaintenanceDate: vehicle.lastMaintenanceDate?.slice(0, 10) || "",
      nextMaintenanceDue: vehicle.nextMaintenanceDue?.slice(0, 10) || "",
      insuranceExpiry: vehicle.insuranceExpiry?.slice(0, 10) || "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      licensePlate: "",
      color: "",
      status: "available",
      mileage: 0,
      dailyRate: "",
      category: "sedan",
      fuelType: "gasoline",
      transmission: "automatic",
      seats: 5,
      features: "",
      location: "",
      lastMaintenanceDate: "",
      nextMaintenanceDue: "",
      insuranceExpiry: "",
    });
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      `${v.make} ${v.model}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === "available").length;
  const rentedVehicles = vehicles.filter((v) => v.status === "rented").length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "success" | "warning" | "error" | "info"; label: string }> = {
      available: { variant: "success", label: "Available" },
      rented: { variant: "info", label: "Rented" },
      maintenance: { variant: "warning", label: "Maintenance" },
      retired: { variant: "error", label: "Retired" },
    };
    const config = variants[status] || variants.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Management"
        description="Manage your vehicle fleet, rentals, and maintenance"
        primaryAction={{
          label: "Add Vehicle",
          icon: "Plus",
          onClick: () => {
            setEditingVehicle(null);
            resetForm();
            setIsOpen(true);
          }
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Total Fleet</p>
          <p className="text-2xl font-bold">{totalVehicles}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-green-600">{availableVehicles}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Rented</p>
          <p className="text-2xl font-bold text-blue-600">{rentedVehicles}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">In Maintenance</p>
          <p className="text-2xl font-bold text-yellow-600">{maintenanceVehicles}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by make, model, VIN, or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Categories</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="truck">Truck</option>
          <option value="van">Van</option>
          <option value="luxury">Luxury</option>
          <option value="economy">Economy</option>
        </select>
      </div>

      {/* Vehicles List */}
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No vehicles yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first vehicle to start managing your fleet.
            </p>
            <Button onClick={() => setIsOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-background/50 rounded-xl border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      {getStatusBadge(vehicle.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(vehicle)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleteConfirm({ id: vehicle.id, name: `${vehicle.make} ${vehicle.model}` })}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VIN:</span>
                    <span className="font-mono text-xs">{vehicle.vin.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plate:</span>
                    <span>{vehicle.licensePlate || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color:</span>
                    <span className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: vehicle.color }}
                      />
                      {vehicle.color}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate:</span>
                    <span className="font-medium text-primary">{formatCurrency(vehicle.dailyRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mileage:</span>
                    <span>{vehicle.mileage.toLocaleString()} mi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline" className="text-xs capitalize">{vehicle.category}</Badge>
                  </div>
                </div>

                {vehicle.nextMaintenanceDue && (
                  <div className="mt-3 pt-3 border-t text-xs">
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Wrench className="h-3 w-3" />
                      <span>Maintenance due: {vehicle.nextMaintenanceDue.slice(0, 10)}</span>
                    </div>
                  </div>
                )}

                {vehicle.features?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {vehicle.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{vehicle.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
            <DialogDescription>
              {editingVehicle ? "Update vehicle details" : "Enter details for a new vehicle"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="e.g., Toyota"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., Camry"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="vin">VIN *</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  placeholder="Vehicle Identification Number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plate">License Plate</Label>
                <Input
                  id="plate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                  placeholder="ABC-1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g., Silver"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily Rate</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Current Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border bg-background"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="luxury">Luxury</option>
                  <option value="economy">Economy</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <select
                  id="fuelType"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border bg-background"
                >
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <select
                  id="transmission"
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border bg-background"
                >
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="e.g., GPS, Bluetooth, Leather Seats"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Lot A, Building 3"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenanceDate}
                  onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenanceDue}
                  onChange={(e) => setFormData({ ...formData, nextMaintenanceDue: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance Expiry</Label>
                <Input
                  id="insurance"
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              >
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingVehicle ? "Update" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        title="Remove Vehicle"
        message={`Are you sure you want to remove "${deleteConfirm?.name}" from your fleet?`}
        confirmText="Remove Vehicle"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
