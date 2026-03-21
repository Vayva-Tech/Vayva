// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Globe, Plus, Trash, MapTrifold as Map, Package, Truck, CurrencyDollar as DollarSign, ClockCounterClockwise } from "@phosphor-icons/react";
import { formatCurrency, logger } from "@vayva/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button, Input } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";

interface ShippingRate {
  id: string;
  name: string;
  amount: number;
  minDays: number;
  maxDays: number;
}

interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  rates: ShippingRate[];
}

export default function ShippingSettingsPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [isAddRateOpen, setIsAddRateOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneFormData, setZoneFormData] = useState({
    id: "",
    name: "",
    regions: [] as string[],
  });

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoading(true);
        const data = await apiJson<ShippingZone[]>("/api/settings/shipping");
        setZones(data || []);
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[FETCH_SHIPPING_ZONES_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error("Failed to load shipping zones");
      } finally {
        setLoading(false);
      }
    };

    void fetchZones();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiJson<{ success: boolean }>("/api/settings/shipping", {
        method: "POST",
        body: JSON.stringify(zones),
      });

      toast.success("Shipping settings saved successfully");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_SHIPPING_SETTINGS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const deleteRate = (zoneId: string, rateId: string) => {
    setZones(
      zones.map((z) => {
        if (z.id !== zoneId) return z;
        return { ...z, rates: z.rates?.filter((r) => r.id !== rateId) };
      }),
    );
    toast.info("Click Save to persist changes");
  };

  const handleOpenCreateZone = () => {
    setZoneFormData({ id: "", name: "", regions: [] });
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZone = (zone: ShippingZone) => {
    setZoneFormData({ ...zone });
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = () => {
    if (!zoneFormData.name) return toast.error("Name is required");

    if (zoneFormData.id) {
      // Edit
      setZones(
        zones.map((z) =>
          z.id === zoneFormData.id
            ? { ...z, ...zoneFormData, regions: zoneFormData.regions }
            : z,
        ),
      );
    } else {
      // Create
      setZones([
        ...zones,
        {
          id: Date.now().toString(),
          name: zoneFormData.name,
          regions: zoneFormData.regions,
          rates: [],
        },
      ]);
    }
    setIsZoneModalOpen(false);
  };

  const handleAddRate = (rate: Omit<ShippingRate, "id">) => {
    if (!activeZoneId) return;

    setZones(
      zones.map((z) => {
        if (z.id !== activeZoneId) return z;
        return {
          ...z,
          rates: [...z.rates, { ...rate, id: Date.now().toString() }],
        };
      }),
    );
    setIsAddRateOpen(false);
    setActiveZoneId(null);
    toast.info("Rate added. Click Save to persist.");
  };

  // Calculate metrics
  const totalZones = zones.length;
  const totalRates = zones.reduce((sum, z) => sum + (z.rates?.length || 0), 0);
  const avgRate = totalRates > 0 
    ? zones.reduce((sum, z) => sum + z.rates.reduce((s, r) => s + r.amount, 0), 0) / totalRates 
    : 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-4 text-sm text-gray-500">Loading shipping zones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipping Zones</h1>
          <p className="text-sm text-gray-500 mt-1">Configure delivery regions and rates</p>
        </div>
        <Button onClick={() => setIsZoneModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          New Zone
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<Globe size={18} />}
          label="Total Zones"
          value={String(totalZones)}
          trend="regions"
          positive
        />
        <SummaryWidget
          icon={<Truck size={18} />}
          label="Shipping Rates"
          value={String(totalRates)}
          trend="configured"
          positive
        />
        <SummaryWidget
          icon={<DollarSign size={18} />}
          label="Avg Rate"
          value={formatCurrency(avgRate)}
          trend="per order"
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="Delivery"
          value={`${zones[0]?.rates?.[0]?.minDays || 'N/A'}-${zones[0]?.rates?.[0]?.maxDays || 'N/A'} days`}
          trend="standard"
          positive
        />
      </div>

      {/* Shipping Zones Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {zones.length === 0 ? (
          <div className="col-span-full p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Map size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No shipping zones yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first shipping zone to define delivery regions and rates.
            </p>
            <Button onClick={() => setIsZoneModalOpen(true)} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              New Zone
            </Button>
          </div>
        ) : (
          zones.map((zone) => (
            <div key={zone.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {zone.regions.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenEditZone(zone)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Package size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {zone.rates && zone.rates.length > 0 ? (
                  zone.rates.map((rate) => (
                    <div key={rate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{rate.name}</div>
                        <div className="text-xs text-gray-500">
                          {rate.minDays}-{rate.maxDays} days
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-gray-900">{formatCurrency(rate.amount)}</div>
                        <button
                          onClick={() => deleteRate(zone.id, rate.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No rates configured</p>
                )}
              </div>

              <button
                onClick={() => { setActiveZoneId(zone.id); setIsAddRateOpen(true); }}
                className="w-full mt-4 py-2.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Rate
              </button>
            </div>
          ))
        )}
      </div>

      {/* Zone Modal */}
      <Dialog open={isZoneModalOpen} onOpenChange={setIsZoneModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {zoneFormData.id ? "Edit" : "Create"} Shipping Zone
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="zone-name">Zone Name</Label>
              <Input
                id="zone-name"
                value={zoneFormData.name}
                onChange={(e) =>
                  setZoneFormData({ ...zoneFormData, name: e.target.value })
                }
                placeholder="e.g., North America"
              />
            </div>
            <div>
              <Label htmlFor="zone-regions">Regions (comma-separated)</Label>
              <Input
                id="zone-regions"
                value={zoneFormData.regions.join(", ")}
                onChange={(e) =>
                  setZoneFormData({
                    ...zoneFormData,
                    regions: e.target.value.split(",").map((r) => r.trim()),
                  })
                }
                placeholder="e.g., US, CA, MX"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsZoneModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveZone}
              className="bg-vayva-green text-white hover:bg-vayva-green/90"
            >
              Save Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rate Modal */}
      <Dialog open={isAddRateOpen} onOpenChange={setIsAddRateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shipping Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rate-name">Rate Name</Label>
              <Input
                id="rate-name"
                placeholder="e.g., Standard Shipping"
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  handleAddRate({
                    name: target.value,
                    amount: 0,
                    minDays: 3,
                    maxDays: 5,
                  });
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleAddRate({
                  name: "Standard",
                  amount: 9.99,
                  minDays: 3,
                  maxDays: 5,
                });
              }}
              className="bg-vayva-green text-white hover:bg-vayva-green/90"
            >
              Add Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
