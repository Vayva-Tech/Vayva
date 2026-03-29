"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@vayva/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  QrCode, 
  Download,
  RefreshCw,
  Trash2,
  Eye,
  Plus,
  Link,
  Store,
  ShoppingBag,
  Receipt,
  CreditCard,
  LayoutGrid
} from "lucide-react";
import { apiJson } from "@/lib/api-client-shared";
import Image from "next/image";

interface QRCode {
  id: string;
  code: string;
  url: string;
  imageUrl: string;
  type: string;
  status: "active" | "inactive" | "expired";
  scanCount: number;
  createdAt: string;
  targetId?: string;
  metadata?: {
    productName?: string;
    tableNumber?: string;
    amount?: number;
  };
}

interface QRStats {
  total: number;
  active: number;
  totalScans: number;
  scansByType: Record<string, number>;
}

const QR_TYPES = [
  { id: "menu", label: "Store Menu", icon: Store, description: "Link to your store" },
  { id: "product", label: "Product", icon: ShoppingBag, description: "Direct to product" },
  { id: "collection", label: "Collection", icon: LayoutGrid, description: "Product collection" },
  { id: "payment", label: "Payment", icon: CreditCard, description: "Quick payment link" },
  { id: "table", label: "Table Order", icon: LayoutGrid, description: "Dine-in ordering" },
  { id: "order", label: "Order Tracking", icon: Receipt, description: "Track shipment" },
];

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  expired: "bg-red-100 text-red-800",
};

export default function QRCodeManagementPage() {
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [stats, setStats] = useState<QRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [codesRes, statsRes] = await Promise.all([
        apiJson<{ success: boolean; codes: typeof codes }>(`/api/qr?status=${filter !== "all" ? filter : ""}`),
        apiJson<{ success: boolean; stats: typeof stats }>("/qr/stats"),
      ]);

      if (codesRes.success) setCodes(codesRes.codes || []);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (error) {
      logger.error("[QR Codes] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this QR code? This action cannot be undone.")) return;
    
    try {
      const res = await apiJson<{ success: boolean }>(`/api/qr/${id}`, { method: "DELETE" });
      if (res.success) {
        setCodes(codes.filter((c) => c.id !== id));
      }
    } catch (error) {
      logger.error("[QR Codes] Delete failed:", { error });
    }
  };

  const handleDownload = async (qr: QRCode) => {
    try {
      const response = await fetch(qr.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-${qr.type}-${qr.code}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error("[QR] Download failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">QR Code Ordering</h1>
          <p className="text-gray-500 mt-1">
            Generate QR codes for contactless ordering and payments
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create QR Code
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total QR Codes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Scans</p>
                <p className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className={filter === "all" ? "bg-green-500 text-green-600-foreground hover:bg-green-500" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={filter === "active" ? "bg-green-500 text-green-600-foreground hover:bg-green-500" : ""}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={filter === "inactive" ? "bg-green-500 text-green-600-foreground hover:bg-green-500" : ""}
          onClick={() => setFilter("inactive")}
        >
          Inactive
        </Button>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {codes.map((qr) => (
          <Card key={qr.id} className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <QrCode className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium capitalize">{qr.type}</p>
                  <Badge className={STATUS_COLORS[qr.status]}>
                    {qr.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* QR Image */}
            <div className="bg-white p-4 rounded-lg border flex items-center justify-center">
              {qr.imageUrl.startsWith("data:") ? (
                <img
                  src={qr.imageUrl}
                  alt={`QR Code ${qr.code}`}
                  className="w-32 h-32"
                />
              ) : (
                <Image
                  src={qr.imageUrl}
                  alt={`QR Code ${qr.code}`}
                  width={128}
                  height={128}
                  className="w-32 h-32"
                />
              )}
            </div>

            {/* Details */}
            <div className="space-y-1 text-sm">
              <p className="text-gray-500">Code: <span className="font-mono">{qr.code}</span></p>
              {qr.metadata?.productName && (
                <p className="text-gray-500">Product: {qr.metadata.productName}</p>
              )}
              {qr.metadata?.tableNumber && (
                <p className="text-gray-500">Table: {qr.metadata.tableNumber}</p>
              )}
              {qr.metadata?.amount && (
                <p className="text-gray-500">Amount: ₦{(qr.metadata.amount / 100).toLocaleString()}</p>
              )}
              <p className="text-gray-500">{qr.scanCount.toLocaleString()} scans</p>
              <p className="text-gray-500">Created {new Date(qr.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDownload(qr)}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQR(qr)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleDelete(qr.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {codes.length === 0 && (
        <Card className="p-12 text-center">
          <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No QR codes yet</h3>
          <p className="text-gray-500 mt-1 mb-4">
            Create QR codes for contactless ordering, payments, and more
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First QR Code
          </Button>
        </Card>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateQRModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedQR && (
        <QRDetailModal
          qr={selectedQR}
          onClose={() => setSelectedQR(null)}
        />
      )}
    </div>
  );
}

function CreateQRModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Record<string, unknown>>({});

  const handleCreate = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      const res = await apiJson<{ success: boolean }>("/qr", {
        method: "POST",
        body: JSON.stringify({
          type: selectedType,
          ...config,
        }),
      });
      
      if (res.success) {
        onCreated();
      }
    } catch (error) {
      logger.error("[QR] Create failed:", { error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Create QR Code</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {QR_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedType === type.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <p className="font-medium">{type.label}</p>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </Button>
              );
            })}
          </div>

          {/* Type-specific config */}
          {selectedType === "payment" && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Amount (₦)</label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., 5000"
                onChange={(e) => setConfig({ ...config, amount: Number(e.target.value) * 100 })}
              />
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="Payment for..."
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
              />
            </div>
          )}

          {selectedType === "table" && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Table Number</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., A1, Table 5"
                onChange={(e) => setConfig({ ...config, tableNumber: e.target.value })}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedType || loading}
              onClick={handleCreate}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create QR Code"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function QRDetailModal({ qr, onClose }: { qr: QRCode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">QR Code Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg border flex items-center justify-center">
            {qr.imageUrl.startsWith("data:") ? (
              <img src={qr.imageUrl} alt={qr.code} className="w-48 h-48" />
            ) : (
              <Image src={qr.imageUrl} alt={qr.code} width={192} height={192} className="w-48 h-48" />
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium capitalize">{qr.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Code</span>
              <span className="font-mono">{qr.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <Badge className={STATUS_COLORS[qr.status]}>{qr.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Scans</span>
              <span>{qr.scanCount.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className="text-sm font-medium">QR URL</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={qr.url}
                readOnly
                className="flex-1 p-2 border rounded-lg text-sm bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(qr.url);
                }}
              >
                <Link className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
