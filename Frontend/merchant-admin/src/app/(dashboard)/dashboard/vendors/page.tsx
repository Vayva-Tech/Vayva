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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  Building2,
  Users,
  Store,
  TrendingUp,
  Package,
  DollarSign,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Star,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  Globe,
  Shield,
  Zap,
  Check,
  X,
  Eye,
} from "lucide-react";

// Types
interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  businessAddress?: string;
  logoUrl?: string;
  description?: string;
  status: "pending" | "active" | "suspended" | "inactive";
  commissionRate: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  lastActiveAt?: string;
  verified: boolean;
  categories: string[];
}

interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  totalVendorRevenue: number;
  totalCommission: number;
  avgVendorRating: number;
  topPerforming: Vendor[];
  newThisMonth: number;
}

interface CommissionPayout {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  processedAt?: string;
  transactionReference?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  suspended: "bg-red-100 text-red-800",
  inactive: "bg-gray-100 text-gray-800",
};

const PAYOUT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

export default function MultiVendorDashboard() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vendorsRes, statsRes, payoutsRes] = await Promise.all([
        apiJson<{ vendors: Vendor[] }>("/api/vendors"),
        apiJson<VendorStats>("/api/vendors/stats"),
        apiJson<{ payouts: CommissionPayout[] }>("/api/vendors/payouts"),
      ]);
      setVendors(vendorsRes.vendors || []);
      setStats(statsRes);
      setPayouts(payoutsRes.payouts || []);
    } catch (error) {
      logger.error("[Vendors] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      await apiJson(`/api/vendors/${vendorId}/approve`, { method: "POST" });
      loadData();
    } catch (error) {
      logger.error("[Vendors] Approve failed:", { error });
    }
  };

  const handleSuspendVendor = async (vendorId: string) => {
    try {
      await apiJson(`/api/vendors/${vendorId}/suspend`, { method: "POST" });
      loadData();
    } catch (error) {
      logger.error("[Vendors] Suspend failed:", { error });
    }
  };

  const handleInviteVendor = async (email: string, businessName: string) => {
    try {
      await apiJson("/api/vendors/invite", {
        method: "POST",
        body: JSON.stringify({ email, businessName }),
      });
      setIsInviteDialogOpen(false);
      loadData();
    } catch (error) {
      logger.error("[Vendors] Invite failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingVendors = vendors.filter((v) => v.status === "pending");
  const activeVendors = vendors.filter((v) => v.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-7 h-7 text-rose-600" />
            Multi-Vendor Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage vendors, commissions, and payouts
          </p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Vendor
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Vendors</p>
                  <p className="text-2xl font-bold">{stats.totalVendors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.activeVendors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingVendors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendor Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalVendorRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalCommission)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Vendors Alert */}
      {pendingVendors.length > 0 && (
        <Card className="border-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold">
                  {pendingVendors.length} Vendor Application{pendingVendors.length > 1 ? "s" : ""} Pending Approval
                </h3>
              </div>
              <Button size="sm" onClick={() => setSelectedVendor(pendingVendors[0])}>
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="vendors" className="w-full">
        <TabsList>
          <TabsTrigger value="vendors">
            Vendors
            {activeVendors.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeVendors.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="top">Top Performers</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Vendors</CardTitle>
              <CardDescription>Manage your marketplace vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                            {vendor.logoUrl ? (
                              <img src={vendor.logoUrl} alt={vendor.businessName} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Store className="w-5 h-5 text-rose-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{vendor.businessName}</p>
                            <p className="text-xs text-muted-foreground">{vendor.businessEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[vendor.status]}>
                          {vendor.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{vendor.totalProducts}</TableCell>
                      <TableCell>{vendor.totalOrders.toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(vendor.totalRevenue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span>{vendor.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({vendor.reviewCount})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedVendor(vendor)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {vendor.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveVendor(vendor.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                          )}
                          {vendor.status === "active" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSuspendVendor(vendor.id)}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Suspend
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {vendors.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No vendors yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsInviteDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Invite your first vendor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value="top" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Top Performing Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topPerforming.map((vendor, index) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? "bg-amber-100 text-amber-700" :
                        index === 1 ? "bg-gray-200 text-gray-700" :
                        index === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{vendor.businessName}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.totalOrders.toLocaleString()} orders • {vendor.totalProducts} products
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(vendor.totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        Commission: {formatCurrency(vendor.totalCommission)}
                      </p>
                    </div>
                  </div>
                ))}

                {!stats?.topPerforming.length && (
                  <div className="text-center py-8">
                    <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground">No performance data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Payouts</CardTitle>
              <CardDescription>Track vendor commission payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <span className="font-medium">{payout.vendorName}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(payout.periodStart).toLocaleDateString()} -{" "}
                        {new Date(payout.periodEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                      <TableCell>
                        <Badge className={PAYOUT_STATUS_COLORS[payout.status]}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payout.processedAt
                          ? new Date(payout.processedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {payouts.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-muted-foreground">No payouts recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vendor Details Dialog */}
      {selectedVendor && (
        <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                {selectedVendor.businessName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Header Info */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg bg-rose-100 flex items-center justify-center">
                  {selectedVendor.logoUrl ? (
                    <img src={selectedVendor.logoUrl} alt={selectedVendor.businessName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Store className="w-10 h-10 text-rose-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={STATUS_COLORS[selectedVendor.status]}>
                      {selectedVendor.status}
                    </Badge>
                    {selectedVendor.verified && (
                      <Badge variant="outline" className="text-emerald-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedVendor.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {selectedVendor.businessEmail}
                    </span>
                    {selectedVendor.businessPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedVendor.businessPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedVendor.totalProducts}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedVendor.totalOrders.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatCurrency(selectedVendor.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedVendor.rating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Commission */}
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Commission Structure</h4>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Commission Rate</span>
                  <span className="font-medium">{selectedVendor.commissionRate}%</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-muted-foreground">Total Commission Earned</span>
                  <span className="font-medium">{formatCurrency(selectedVendor.totalCommission)}</span>
                </div>
              </div>

              {/* Categories */}
              {selectedVendor.categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                  Close
                </Button>
                {selectedVendor.status === "pending" && (
                  <Button onClick={() => handleApproveVendor(selectedVendor.id)}>
                    <Check className="w-4 h-4 mr-2" />
                    Approve Vendor
                  </Button>
                )}
                {selectedVendor.status === "active" && (
                  <Button variant="destructive" onClick={() => handleSuspendVendor(selectedVendor.id)}>
                    <X className="w-4 h-4 mr-2" />
                    Suspend
                  </Button>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Invite Dialog */}
      <InviteVendorDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSubmit={handleInviteVendor}
      />
    </div>
  );
}

function InviteVendorDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string, businessName: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, businessName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Vendor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Business Name</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Acme Supplies"
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@example.com"
              className="mt-1.5"
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
