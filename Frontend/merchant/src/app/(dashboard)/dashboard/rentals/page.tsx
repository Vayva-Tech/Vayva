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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiJson } from "@/lib/api-client-shared";
import { formatCurrency } from "@vayva/shared";
import {
  Repeat,
  Package,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  MapPin,
  DollarSign,
  BarChart3,
  Eye,
  Play,
  Pause,
  X,
  Check,
  Truck,
  Home,
  Wrench,
} from "lucide-react";

// Types
interface RentalProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "available" | "rented" | "maintenance" | "retired";
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  depositAmount: number;
  totalUnits: number;
  availableUnits: number;
  condition: "new" | "excellent" | "good" | "fair" | "worn";
  location?: string;
  images: string[];
  rentalCount: number;
  revenue: number;
  requiresDeposit: boolean;
  requiresId: boolean;
  minRentalDays: number;
  maxRentalDays: number;
}

interface RentalBooking {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: "pending" | "confirmed" | "picked_up" | "returned" | "cancelled" | "overdue";
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  totalDays: number;
  dailyRate: number;
  subtotal: number;
  depositAmount: number;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "refunded" | "partial";
  depositReturned: boolean;
  damageFee?: number;
  lateFee?: number;
  cleaningFee?: number;
  pickupLocation?: string;
  returnLocation?: string;
  notes?: string;
  createdAt: string;
}

interface RentalStats {
  totalProducts: number;
  availableProducts: number;
  rentedProducts: number;
  inMaintenance: number;
  activeRentals: number;
  pendingReturns: number;
  overdueRentals: number;
  monthlyRevenue: number;
  totalRevenue: number;
  avgRentalDuration: number;
  returnRate: number;
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  rented: "bg-blue-100 text-blue-800",
  maintenance: "bg-orange-100 text-amber-800",
  retired: "bg-gray-100 text-gray-800",
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  picked_up: "bg-purple-100 text-purple-800",
  returned: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  overdue: "bg-red-100 text-red-800",
};

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  worn: "Worn",
};

export default function RentalModuleDashboard() {
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [stats, setStats] = useState<RentalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<RentalProduct | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, bookingsRes, statsRes] = await Promise.all([
        apiJson<{ products: RentalProduct[] }>("/rentals/products"),
        apiJson<{ bookings: RentalBooking[] }>("/rentals/bookings"),
        apiJson<RentalStats>("/rentals/stats"),
      ]);
      setProducts(productsRes.products || []);
      setBookings(bookingsRes.bookings || []);
      setStats(statsRes);
    } catch (error) {
      logger.error("[Rentals] Failed to load:", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (data: {
    name: string;
    description: string;
    category: string;
    dailyRate: number;
    depositAmount: number;
    totalUnits: number;
  }) => {
    try {
      await apiJson("/rentals/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setIsAddProductOpen(false);
      loadData();
    } catch (error) {
      logger.error("[Rentals] Create failed:", { error });
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await apiJson(`/api/rentals/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
      setSelectedBooking(null);
    } catch (error) {
      logger.error("[Rentals] Status update failed:", { error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const availableProducts = products.filter((p) => p.status === "available");
  const rentedProducts = products.filter((p) => p.status === "rented");
  const overdueBookings = bookings.filter((b) => b.status === "overdue");
  const pendingReturns = bookings.filter((b) => b.status === "picked_up");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Repeat className="w-7 h-7 text-lime-600" />
            Rental / Lease Module
          </h1>
          <p className="text-gray-500 mt-1">
            Manage rental products, bookings, and returns
          </p>
        </div>
        <Button onClick={() => setIsAddProductOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lime-100 rounded-lg">
                  <Package className="w-5 h-5 text-lime-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-2xl font-bold">{stats.availableProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rented</p>
                  <p className="text-2xl font-bold">{stats.rentedProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold">{stats.overdueRentals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {overdueBookings.length > 0 && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">
                  {overdueBookings.length} Overdue Rental{overdueBookings.length > 1 ? "s" : ""} Requires Attention
                </h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedBooking(overdueBookings[0])}>
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingReturns.length > 0 && (
        <Card className="border-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold">
                {pendingReturns.length} Rental{pendingReturns.length > 1 ? "s" : ""} Due for Return
              </h3>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">
            Products
            {availableProducts.length > 0 && (
              <Badge variant="secondary" className="ml-2">{availableProducts.length} available</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rental Inventory</CardTitle>
              <CardDescription>Manage your rental products and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Daily Rate</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                            {product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Package className="w-5 h-5 text-lime-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              {CONDITION_LABELS[product.condition]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[product.status]}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.dailyRate)}/day</TableCell>
                      <TableCell>
                        <span className={product.availableUnits === 0 ? "text-red-600 font-medium" : ""}>
                          {product.availableUnits} / {product.totalUnits}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(product.revenue)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No rental products yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsAddProductOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>Track rental reservations and returns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <span className="font-medium">{booking.productName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.customerName}</span>
                          <span className="text-xs text-gray-500">{booking.customerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">{booking.totalDays} days</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(booking.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                          {booking.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {bookings.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No bookings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rental Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings
                  .filter((b) => b.status === "confirmed" || b.status === "picked_up")
                  .slice(0, 10)
                  .map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-lime-600" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.productName}</p>
                          <p className="text-sm text-gray-500">{booking.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">Return date</p>
                      </div>
                    </div>
                  ))}

                {bookings.filter((b) => b.status === "confirmed" || b.status === "picked_up").length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No upcoming rentals</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {selectedProduct.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Image & Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg bg-lime-100 flex items-center justify-center">
                  {selectedProduct.images[0] ? (
                    <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-12 h-12 text-lime-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Badge className={STATUS_COLORS[selectedProduct.status]}>
                    {selectedProduct.status}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">{selectedProduct.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedProduct.location || "No location set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50">
                <div className="text-center">
                  <p className="text-xl font-bold">{formatCurrency(selectedProduct.dailyRate)}</p>
                  <p className="text-xs text-gray-500">Daily</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{formatCurrency(selectedProduct.weeklyRate)}</p>
                  <p className="text-xs text-gray-500">Weekly</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{formatCurrency(selectedProduct.monthlyRate)}</p>
                  <p className="text-xs text-gray-500">Monthly</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{formatCurrency(selectedProduct.depositAmount)}</p>
                  <p className="text-xs text-gray-500">Deposit</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{selectedProduct.totalUnits}</p>
                  <p className="text-xs text-gray-500">Total Units</p>
                </div>
                <div className="p-3 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{selectedProduct.rentalCount}</p>
                  <p className="text-xs text-gray-500">Total Rentals</p>
                </div>
                <div className="p-3 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{formatCurrency(selectedProduct.revenue)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>

              {/* Rental Constraints */}
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Rental Terms</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Min Rental Days</span>
                    <span>{selectedProduct.minRentalDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Max Rental Days</span>
                    <span>{selectedProduct.maxRentalDays} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Requires Deposit</span>
                    <Badge variant={selectedProduct.requiresDeposit ? "default" : "outline"}>
                      {selectedProduct.requiresDeposit ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Requires ID</span>
                    <Badge variant={selectedProduct.requiresId ? "default" : "outline"}>
                      {selectedProduct.requiresId ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge className={BOOKING_STATUS_COLORS[selectedBooking.status]}>
                  {selectedBooking.status.replace("_", " ")}
                </Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(selectedBooking.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Product & Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-medium">{selectedBooking.productName}</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedBooking.customerName}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.customerEmail}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{new Date(selectedBooking.startDate).toLocaleDateString()}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <div className="text-right">
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{new Date(selectedBooking.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {selectedBooking.totalDays} days @ {formatCurrency(selectedBooking.dailyRate)}/day
                </p>
              </div>

              {/* Payment */}
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(selectedBooking.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deposit</span>
                    <span>{formatCurrency(selectedBooking.depositAmount)}</span>
                  </div>
                  {selectedBooking.lateFee && (
                    <div className="flex justify-between text-red-600">
                      <span>Late Fee</span>
                      <span>{formatCurrency(selectedBooking.lateFee)}</span>
                    </div>
                  )}
                  {selectedBooking.damageFee && (
                    <div className="flex justify-between text-red-600">
                      <span>Damage Fee</span>
                      <span>{formatCurrency(selectedBooking.damageFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {selectedBooking.status === "confirmed" && (
                  <Button onClick={() => handleUpdateBookingStatus(selectedBooking.id, "picked_up")}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark Picked Up
                  </Button>
                )}
                {selectedBooking.status === "picked_up" && (
                  <Button onClick={() => handleUpdateBookingStatus(selectedBooking.id, "returned")}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Returned
                  </Button>
                )}
                {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                  <Button variant="outline" onClick={() => handleUpdateBookingStatus(selectedBooking.id, "cancelled")}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Product Dialog */}
      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onSubmit={handleAddProduct}
      />
    </div>
  );
}

function AddProductDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description: string;
    category: string;
    dailyRate: number;
    depositAmount: number;
    totalUnits: number;
  }) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "electronics",
    dailyRate: 5000,
    depositAmount: 20000,
    totalUnits: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Rental Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Professional Camera Kit"
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the product and what's included..."
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g., electronics, tools, vehicles"
              className="mt-1.5"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Daily Rate (₦)</Label>
              <Input
                type="number"
                value={form.dailyRate}
                onChange={(e) => setForm({ ...form, dailyRate: parseInt(e.target.value) })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label>Deposit (₦)</Label>
              <Input
                type="number"
                value={form.depositAmount}
                onChange={(e) => setForm({ ...form, depositAmount: parseInt(e.target.value) })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label>Units</Label>
              <Input
                type="number"
                value={form.totalUnits}
                onChange={(e) => setForm({ ...form, totalUnits: parseInt(e.target.value) })}
                className="mt-1.5"
                required
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
