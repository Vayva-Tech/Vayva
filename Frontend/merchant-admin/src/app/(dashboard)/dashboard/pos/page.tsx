"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  CreditCard,
  Store,
  Wifi,
  Zap,
  Smartphone,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  QrCode,
  ShoppingCart,
  BarChart3,
  Clock,
  ArrowLeftRight,
  Cloud,
  Laptop,
  Tablet,
} from "lucide-react";

// Types
interface POSDevice {
  id: string;
  name: string;
  deviceType: "terminal" | "tablet" | "mobile" | "kiosk";
  status: "online" | "offline" | "maintenance";
  lastSyncAt: string;
  location?: string;
  storeName: string;
  serialNumber: string;
  softwareVersion: string;
  syncStats: {
    productsSynced: number;
    ordersSynced: number;
    inventoryUpdates: number;
    lastSyncDuration: number;
  };
  dailyStats: {
    transactions: number;
    revenue: number;
    avgTransaction: number;
  };
}

interface POSSyncEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  eventType: "product_sync" | "inventory_sync" | "order_sync" | "config_update" | "error";
  status: "pending" | "in_progress" | "completed" | "failed";
  details: string;
  itemsCount?: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

interface POSStats {
  totalDevices: number;
  onlineDevices: number;
  totalSyncs: number;
  last24hRevenue: number;
  last24hTransactions: number;
  syncSuccessRate: number;
  avgSyncTime: number;
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  terminal: <CreditCard className="w-5 h-5" />,
  tablet: <Tablet className="w-5 h-5" />,
  mobile: <Smartphone className="w-5 h-5" />,
  kiosk: <Laptop className="w-5 h-5" />,
};

const STATUS_COLORS: Record<string, string> = {
  online: "bg-emerald-100 text-emerald-800",
  offline: "bg-red-100 text-red-800",
  maintenance: "bg-amber-100 text-amber-800",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  product_sync: "Product Sync",
  inventory_sync: "Inventory Sync",
  order_sync: "Order Sync",
  config_update: "Config Update",
  error: "Error",
};

export default function POSIntegrationDashboard() {
  const [devices, setDevices] = useState<POSDevice[]>([]);
  const [syncEvents, setSyncEvents] = useState<POSSyncEvent[]>([]);
  const [stats, setStats] = useState<POSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<POSDevice | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [devicesRes, eventsRes, statsRes] = await Promise.all([
        apiJson<{ devices: POSDevice[] }>("/api/pos/devices"),
        apiJson<{ events: POSSyncEvent[] }>("/api/pos/sync-events"),
        apiJson<POSStats>("/api/pos/stats"),
      ]);
      setDevices(devicesRes.devices || []);
      setSyncEvents(eventsRes.events || []);
      setStats(statsRes);
    } catch (error) {
      logger.error("[POS] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (data: {
    name: string;
    deviceType: string;
    storeName: string;
    serialNumber: string;
  }) => {
    try {
      await apiJson("/api/pos/devices", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setIsAddDialogOpen(false);
      loadData();
    } catch (error) {
      logger.error("[POS] Add device failed:", { error });
    }
  };

  const handleSyncNow = async (deviceId: string) => {
    try {
      await apiJson(`/api/pos/devices/${deviceId}/sync`, { method: "POST" });
      loadData();
    } catch (error) {
      logger.error("[POS] Sync failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onlineDevices = devices.filter((d) => d.status === "online");
  const offlineDevices = devices.filter((d) => d.status === "offline");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-7 h-7 text-cyan-600" />
            POS Integration
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect and sync your physical store terminals
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Devices</p>
                  <p className="text-2xl font-bold">{stats.totalDevices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Wifi className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold">{stats.onlineDevices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Sales</p>
                  <p className="text-2xl font-bold">{stats.last24hTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.last24hRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sync Rate</p>
                  <p className="text-2xl font-bold">{stats.syncSuccessRate.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Alert */}
      {offlineDevices.length > 0 && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">
                {offlineDevices.length} Device{offlineDevices.length > 1 ? "s" : ""} Offline
              </h3>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Check network connection on affected terminals
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="devices" className="w-full">
        <TabsList>
          <TabsTrigger value="devices">
            Devices
            {onlineDevices.length > 0 && (
              <Badge variant="secondary" className="ml-2">{onlineDevices.length} online</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sync">Sync Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Devices Tab */}
        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>Manage your POS terminals and sync status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                        {DEVICE_ICONS[device.deviceType]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{device.name}</span>
                          <Badge className={STATUS_COLORS[device.status]}>
                            {device.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {device.storeName} • {device.serialNumber}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last sync: {new Date(device.lastSyncAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{device.dailyStats.transactions} sales</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(device.dailyStats.revenue)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDevice(device)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSyncNow(device.id)}
                          disabled={device.status !== "online"}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Sync
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {devices.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No POS devices connected yet.</p>
                    <Button
                      className="mt-4"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first device
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <span className="font-medium">{event.deviceName}</span>
                      </TableCell>
                      <TableCell>{EVENT_TYPE_LABELS[event.eventType]}</TableCell>
                      <TableCell>{event.itemsCount || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            event.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : event.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : event.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {event.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(event.startedAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {syncEvents.length === 0 && (
                <div className="text-center py-8">
                  <ArrowLeftRight className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No sync events recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Device Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {DEVICE_ICONS[device.deviceType]}
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(device.dailyStats.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          {device.dailyStats.transactions} transactions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Sync Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{device.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {device.syncStats.productsSynced.toLocaleString()} products
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500"
                          style={{
                            width: `${Math.min((device.syncStats.productsSynced / 1000) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last sync took {device.syncStats.lastSyncDuration}s
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Device Details Dialog */}
      {selectedDevice && (
        <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {DEVICE_ICONS[selectedDevice.deviceType]}
                {selectedDevice.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Store</Label>
                  <p className="font-medium">{selectedDevice.storeName}</p>
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <p className="font-medium">{selectedDevice.serialNumber}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Sync Statistics</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold">{selectedDevice.syncStats.productsSynced.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{selectedDevice.syncStats.ordersSynced.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{selectedDevice.syncStats.inventoryUpdates.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Inventory</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{selectedDevice.syncStats.lastSyncDuration}s</p>
                    <p className="text-xs text-muted-foreground">Last Sync</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Today&apos;s Performance</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold">{selectedDevice.dailyStats.transactions}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{formatCurrency(selectedDevice.dailyStats.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{formatCurrency(selectedDevice.dailyStats.avgTransaction)}</p>
                    <p className="text-xs text-muted-foreground">Avg Sale</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedDevice(null)}>
                  Close
                </Button>
                <Button onClick={() => handleSyncNow(selectedDevice.id)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Device Dialog */}
      <AddDeviceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddDevice}
      />
    </div>
  );
}

function AddDeviceDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; deviceType: string; storeName: string; serialNumber: string }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    deviceType: "terminal",
    storeName: "",
    serialNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add POS Device</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Device Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Main Counter Terminal"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label>Device Type</Label>
            <Select
              value={form.deviceType}
              onValueChange={(value) => setForm({ ...form, deviceType: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terminal">Card Terminal</SelectItem>
                <SelectItem value="tablet">Tablet POS</SelectItem>
                <SelectItem value="mobile">Mobile POS</SelectItem>
                <SelectItem value="kiosk">Self-Service Kiosk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Store Name</Label>
            <Input
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              placeholder="e.g., Lagos Main Store"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label>Serial Number</Label>
            <Input
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              placeholder="e.g., VY-2024-001"
              className="mt-1.5"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
