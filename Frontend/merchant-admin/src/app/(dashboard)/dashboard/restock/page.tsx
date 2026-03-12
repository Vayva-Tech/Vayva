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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  Package,
  Bell,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShoppingCart,
  Box,
  Truck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

// Types
interface RestockAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  alertType: "below_minimum" | "low_velocity" | "out_of_stock" | "expiring";
  status: "active" | "acknowledged" | "ordered" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "critical";
  salesVelocity: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  daysUntilStockout: number | null;
  suggestedReorderQty: number;
  suggestedSupplierId?: string;
  suggestedSupplierName?: string;
  lastSaleDate?: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  purchaseOrderId?: string;
}

interface ReorderSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  optimalQty: number;
  supplierId: string;
  supplierName: string;
  unitCost: number;
  totalCost: number;
  leadTimeDays: number;
  expectedStockoutDate?: string;
  confidence: number;
}

interface RestockSettings {
  defaultLeadTimeDays: number;
  safetyStockMultiplier: number;
  velocityWindowDays: number;
  autoCreatePurchaseOrders: boolean;
  alertThresholds: {
    critical: number; // days of stock
    high: number;
    medium: number;
  };
}

interface RestockStats {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  acknowledgedToday: number;
  autoOrdersCreated: number;
  avgDaysUntilStockout: number;
  potentialRevenueAtRisk: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  active: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-3 h-3" /> },
  acknowledged: { color: "bg-blue-100 text-blue-800", icon: <Clock className="w-3 h-3" /> },
  ordered: { color: "bg-purple-100 text-purple-800", icon: <ShoppingCart className="w-3 h-3" /> },
  resolved: { color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle className="w-3 h-3" /> },
  dismissed: { color: "bg-gray-100 text-gray-800", icon: <AlertTriangle className="w-3 h-3" /> },
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  below_minimum: "Below Minimum",
  low_velocity: "Low Sales Velocity",
  out_of_stock: "Out of Stock",
  expiring: "Expiring Soon",
};

export default function SmartRestockDashboard() {
  const [alerts, setAlerts] = useState<RestockAlert[]>([]);
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [stats, setStats] = useState<RestockStats | null>(null);
  const [settings, setSettings] = useState<RestockSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<RestockAlert | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertsRes, suggestionsRes, statsRes, settingsRes] = await Promise.all([
        apiJson<{ alerts: RestockAlert[] }>("/api/restock/alerts"),
        apiJson<{ suggestions: ReorderSuggestion[] }>("/api/restock/suggestions"),
        apiJson<RestockStats>("/api/restock/stats"),
        apiJson<RestockSettings>("/api/restock/settings"),
      ]);

      setAlerts(alertsRes.alerts || []);
      setSuggestions(suggestionsRes.suggestions || []);
      setStats(statsRes);
      setSettings(settingsRes);
    } catch (error) {
      logger.error("[Restock] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await apiJson(`/api/restock/alerts/${alertId}/acknowledge`, { method: "POST" });
      loadData();
      setSelectedAlert(null);
    } catch (error) {
      logger.error("[Restock] Acknowledge failed:", { error });
    }
  };

  const handleCreatePurchaseOrder = async (suggestion: ReorderSuggestion) => {
    try {
      await apiJson("/api/restock/purchase-orders", {
        method: "POST",
        body: JSON.stringify({
          supplierId: suggestion.supplierId,
          items: [{
            productId: suggestion.productId,
            quantity: suggestion.optimalQty,
            unitCost: suggestion.unitCost,
          }],
        }),
      });
      loadData();
    } catch (error) {
      logger.error("[Restock] PO creation failed:", { error });
    }
  };

  const handleUpdateSettings = async (newSettings: RestockSettings) => {
    try {
      await apiJson("/api/restock/settings", {
        method: "PATCH",
        body: JSON.stringify(newSettings),
      });
      setIsSettingsOpen(false);
      loadData();
    } catch (error) {
      logger.error("[Restock] Settings update failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const criticalAlerts = activeAlerts.filter((a) => a.priority === "critical");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            Smart Restock Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered inventory monitoring and reorder suggestions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold">{stats.activeAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold">{stats.criticalAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Auto Orders</p>
                  <p className="text-2xl font-bold">{stats.autoOrdersCreated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue at Risk</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.potentialRevenueAtRisk)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? "s" : ""} Requires Immediate Action
              </h3>
            </div>
            <p className="text-sm text-red-700 mt-1">
              These products are at risk of stockout within {stats?.avgDaysUntilStockout.toFixed(1)} days
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList>
          <TabsTrigger value="alerts">
            Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions">Reorder Suggestions</TabsTrigger>
          <TabsTrigger value="velocity">Sales Velocity</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Products requiring restock attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Days Until Stockout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{alert.productName}</span>
                          <span className="text-xs text-muted-foreground">{alert.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.currentStock}</span>
                          <span className="text-xs text-muted-foreground">/ {alert.threshold} min</span>
                        </div>
                        <Progress
                          value={(alert.currentStock / alert.threshold) * 100}
                          className="w-24 h-2 mt-1"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_COLORS[alert.priority]}>
                          {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alert.daysUntilStockout !== null ? (
                          <span className={alert.daysUntilStockout <= 3 ? "text-red-600 font-medium" : ""}>
                            {alert.daysUntilStockout} days
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_CONFIG[alert.status].color}>
                          {STATUS_CONFIG[alert.status].icon}
                          <span className="ml-1">{alert.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {alerts.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No alerts - all stock levels are healthy!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Reorder Suggestions</CardTitle>
              <CardDescription>Optimal reorder quantities based on sales velocity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.productId} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{suggestion.productName}</h4>
                            <Badge variant="outline">
                              {suggestion.confidence}% confidence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Stock</p>
                              <p className="font-medium">{suggestion.currentStock}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Reorder Point</p>
                              <p className="font-medium">{suggestion.reorderPoint}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Suggested Qty</p>
                              <p className="font-medium text-blue-600">{suggestion.optimalQty}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Cost</p>
                              <p className="font-medium">{formatCurrency(suggestion.totalCost)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Truck className="w-4 h-4" />
                              {suggestion.supplierName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {suggestion.leadTimeDays} days lead time
                            </span>
                            {suggestion.expectedStockoutDate && (
                              <span className="text-red-600">
                                Stockout expected: {new Date(suggestion.expectedStockoutDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCreatePurchaseOrder(suggestion)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create PO
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {suggestions.length === 0 && (
                  <div className="text-center py-12">
                    <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No reorder suggestions at this time.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Velocity Tab */}
        <TabsContent value="velocity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Sales Velocity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {alerts.slice(0, 6).map((alert) => (
                  <Card key={alert.id}>
                    <CardContent className="p-4">
                      <h4 className="font-medium truncate">{alert.productName}</h4>
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Daily</span>
                          <span className="font-medium">{alert.salesVelocity.daily}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Weekly</span>
                          <span className="font-medium">{alert.salesVelocity.weekly}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Monthly</span>
                          <span className="font-medium">{alert.salesVelocity.monthly}</span>
                        </div>
                      </div>
                      {alert.daysUntilStockout !== null && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Stockout In</span>
                            <span className={`font-medium ${alert.daysUntilStockout <= 7 ? "text-red-600" : ""}`}>
                              {alert.daysUntilStockout} days
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      {selectedAlert && (
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Alert Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product</Label>
                  <p className="font-medium">{selectedAlert.productName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAlert.sku}</p>
                </div>
                <div>
                  <Label>Alert Type</Label>
                  <Badge className="mt-1">
                    {ALERT_TYPE_LABELS[selectedAlert.alertType]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="text-2xl font-bold">{selectedAlert.currentStock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Threshold</p>
                  <p className="text-2xl font-bold">{selectedAlert.threshold}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suggested Qty</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedAlert.suggestedReorderQty}</p>
                </div>
              </div>

              <div>
                <Label>Sales Velocity</Label>
                <div className="grid grid-cols-3 gap-4 mt-1">
                  <div className="text-center p-3 rounded-lg border">
                    <p className="text-lg font-semibold">{selectedAlert.salesVelocity.daily}</p>
                    <p className="text-xs text-muted-foreground">Daily</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border">
                    <p className="text-lg font-semibold">{selectedAlert.salesVelocity.weekly}</p>
                    <p className="text-xs text-muted-foreground">Weekly</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border">
                    <p className="text-lg font-semibold">{selectedAlert.salesVelocity.monthly}</p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                  </div>
                </div>
              </div>

              {selectedAlert.suggestedSupplierName && (
                <div>
                  <Label>Suggested Supplier</Label>
                  <p className="font-medium">{selectedAlert.suggestedSupplierName}</p>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
                {selectedAlert.status === "active" && (
                  <Button onClick={() => handleAcknowledge(selectedAlert.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Acknowledge
                  </Button>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Settings Dialog */}
      {isSettingsOpen && settings && (
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Restock Alert Settings</DialogTitle>
            </DialogHeader>
            <SettingsForm
              settings={settings}
              onSubmit={handleUpdateSettings}
              onCancel={() => setIsSettingsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function SettingsForm({
  settings,
  onSubmit,
  onCancel,
}: {
  settings: RestockSettings;
  onSubmit: (s: RestockSettings) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(settings);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div>
        <Label>Default Lead Time (Days)</Label>
        <Input
          type="number"
          value={form.defaultLeadTimeDays}
          onChange={(e) => setForm({ ...form, defaultLeadTimeDays: parseInt(e.target.value) })}
        />
      </div>
      <div>
        <Label>Safety Stock Multiplier</Label>
        <Input
          type="number"
          step="0.1"
          value={form.safetyStockMultiplier}
          onChange={(e) => setForm({ ...form, safetyStockMultiplier: parseFloat(e.target.value) })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Auto-Create Purchase Orders</Label>
        <Switch
          checked={form.autoCreatePurchaseOrders}
          onCheckedChange={(checked) => setForm({ ...form, autoCreatePurchaseOrders: checked })}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Settings</Button>
      </DialogFooter>
    </form>
  );
}
