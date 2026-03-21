// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import {
  Plus,
  Warehouse,
  MapPin,
  DotsThree as MoreHorizontal,
  PencilSimple as Edit,
  Package,
  Trash,
  ArrowsLeftRight as ArrowRightLeft,
  Truck,
  QrCode,
  ChartBar as BarChart3,
} from "@phosphor-icons/react/dist/ssr";

interface Location {
  id: string;
  name: string;
  type: "warehouse" | "store" | "dropship";
  address: string;
  city: string;
  state: string;
  isDefault: boolean;
  stockCount: number;
  lowStockCount: number;
}

interface StockTransfer {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  productId: string;
  productName: string;
  quantity: number;
  status: "pending" | "in_transit" | "completed" | "cancelled";
  createdAt: string;
}

export default function InventoryLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [activeTab, setActiveTab] = useState<"locations" | "transfers">("locations");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [locData, transferData] = await Promise.all([
        apiJson<{ locations: Location[] }>("/api/inventory/locations"),
        apiJson<{ transfers: StockTransfer[] }>("/api/inventory/transfers"),
      ]);
      setLocations(locData.locations || []);
      setTransfers(transferData.transfers || []);
    } catch (error) {
      logger.error("[INVENTORY_LOCATIONS_FETCH_ERROR]", { error });
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalLocations: locations.length,
    totalStock: locations.reduce((sum: number, l) => sum + l.stockCount, 0),
    lowStockItems: locations.reduce((sum: number, l) => sum + l.lowStockCount, 0),
    pendingTransfers: transfers.filter((t) => t.status === "pending").length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
            <Warehouse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Inventory Locations</h1>
            <p className="text-gray-500">Manage stock across multiple locations</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-vayva-green text-white hover:bg-vayva-green/90 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Locations</p>
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.totalLocations}</p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Total Stock</p>
            <Package className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Low Stock</p>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.lowStockItems}</p>
        </div>
        <div className="bg-white  rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Pending Transfers</p>
            <ArrowRightLeft className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.pendingTransfers}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white  rounded-xl border border-gray-200 p-1 inline-flex gap-1">
        {(["locations", "transfers"] as const).map((t) => (
          <Button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === t
                ? "bg-text-green-600 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white  rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : activeTab === "locations" ? (
          <LocationsList
            locations={locations}
            onUpdate={fetchData}
          />
        ) : (
          <TransfersList transfers={transfers} locations={locations} />
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateLocationModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  );
}

function LocationsList({
  locations,
  onUpdate,
}: {
  locations: Location[];
  onUpdate: () => void;
}) {
  if (locations.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <Warehouse className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No locations yet</h3>
        <p className="text-gray-700 mb-4">
          Add your first warehouse or store location to track inventory
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {locations.map((location) => (
        <LocationRow key={location.id} location={location} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

function LocationRow({
  location,
  onUpdate,
}: {
  location: Location;
  onUpdate: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const setDefault = async () => {
    try {
      await apiJson(`/api/inventory/locations/${location.id}/set-default`, {
        method: "POST",
      });
      toast.success("Default location updated");
      onUpdate();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    try {
      await apiJson(`/api/inventory/locations/${location.id}`, {
        method: "DELETE",
      });
      toast.success("Location deleted successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete location");
      console.error(error);
    }
  };

  return (
    <div className="p-4 flex items-center justify-between hover:bg-white transition">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            location.type === "warehouse"
              ? "bg-orange-100 text-orange-600"
              : location.type === "store"
              ? "bg-blue-100 text-blue-600"
              : "bg-purple-100 text-purple-600"
          }`}
        >
          {location.type === "warehouse" ? (
            <Warehouse className="w-5 h-5" />
          ) : location.type === "store" ? (
            <MapPin className="w-5 h-5" />
          ) : (
            <Package className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-900">{location.name}</h4>
            {location.isDefault && (
              <span className="text-[10px] bg-status-success/10 text-status-success px-2 py-0.5 rounded-full font-bold">
                DEFAULT
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700">
            {location.address}, {location.city}, {location.state}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">
              {location.stockCount.toLocaleString()} items
            </span>
            {location.lowStockCount > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                {location.lowStockCount} low stock
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!location.isDefault && (
          <Button variant="outline" size="sm" onClick={setDefault}>
            Set Default
          </Button>
        )}
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-10">
              <button
                onClick={() => {
                  handleEdit();
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-white flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-white flex items-center gap-2 text-status-danger"
              >
                <Trash className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <CreateLocationModal
          locationToEdit={location}
          onClose={() => setShowEditModal(false)}
          onUpdated={onUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Location?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{location.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete();
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransfersList({
  transfers,
  locations,
}: {
  transfers: StockTransfer[];
  locations: Location[];
}) {
  if (transfers.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-white-2 flex items-center justify-center mx-auto mb-4">
          <ArrowRightLeft className="w-8 h-8 text-gray-700" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No transfers yet</h3>
        <p className="text-gray-700">
          Stock transfers between locations will appear here
        </p>
      </div>
    );
  }

  const getLocationName = (id: string) =>
    locations.find((l) => l.id === id)?.name || "Unknown";

  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="text-left p-4 text-sm font-bold text-gray-700">Product</th>
          <th className="text-left p-4 text-sm font-bold text-gray-700">From</th>
          <th className="text-left p-4 text-sm font-bold text-gray-700">To</th>
          <th className="text-right p-4 text-sm font-bold text-gray-700">Quantity</th>
          <th className="text-center p-4 text-sm font-bold text-gray-700">Status</th>
          <th className="text-right p-4 text-sm font-bold text-gray-700">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {transfers.map((t) => (
          <tr key={t.id} className="hover:bg-white">
            <td className="p-4 font-medium">{t.productName}</td>
            <td className="p-4 text-sm">{getLocationName(t.fromLocationId)}</td>
            <td className="p-4 text-sm">{getLocationName(t.toLocationId)}</td>
            <td className="p-4 text-right font-medium">{t.quantity}</td>
            <td className="p-4 text-center">
              <TransferStatusBadge status={t.status} />
            </td>
            <td className="p-4 text-right text-sm text-gray-700">
              {new Date(t.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TransferStatusBadge({
  status,
}: {
  status: "pending" | "in_transit" | "completed" | "cancelled";
}) {
  const styles = {
    pending: "bg-status-warning/10 text-status-warning",
    in_transit: "bg-status-info/10 text-status-info",
    completed: "bg-status-success/10 text-status-success",
    cancelled: "bg-status-danger/10 text-status-danger",
  };

  const labels = {
    pending: "Pending",
    in_transit: "In Transit",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function CreateLocationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<{
    name: string;
    type: "warehouse" | "store" | "dropship";
    address: string;
    city: string;
    state: string;
  }>({
    name: "",
    type: "warehouse",
    address: "",
    city: "",
    state: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiJson("/api/inventory/locations", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Location created successfully");
      onCreated();
      onClose();
    } catch {
      toast.error("Failed to create location");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Add Inventory Location</h2>
          <p className="text-sm text-gray-700">Create a new warehouse or store</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Main Warehouse"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Location["type"] })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <option value="warehouse">Warehouse</option>
              <option value="store">Retail Store</option>
              <option value="dropship">Dropship Location</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Address *</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City *</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="State"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-500 font-bold"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Location"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
