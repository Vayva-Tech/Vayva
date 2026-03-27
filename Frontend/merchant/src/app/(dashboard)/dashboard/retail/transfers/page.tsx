/**
 * Retail Industry - Inventory Transfers Management Page
 * Manage stock transfers between store locations and warehouses
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Search, Plus, Truck, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Transfer {
  id: string;
  transferNumber: string;
  fromLocation: string;
  toLocation: string;
  productName: string;
  sku: string;
  quantity: number;
  status: "pending" | "approved" | "in-transit" | "delivered" | "cancelled";
  requestedBy: string;
  approvedBy?: string;
  requestDate: string;
  expectedDelivery: string;
  priority: "low" | "normal" | "urgent";
}

export default function RetailTransfersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const transfers: Transfer[] = [
    { id: "1", transferNumber: "TRF-2024-001", fromLocation: "Warehouse A", toLocation: "Downtown Store", productName: "Wireless Headphones", sku: "WH-001", quantity: 25, status: "in-transit", requestedBy: "Mike Johnson", approvedBy: "Lisa Chen", requestDate: "2024-01-18", expectedDelivery: "2024-01-22", priority: "normal" },
    { id: "2", transferNumber: "TRF-2024-002", fromLocation: "Mall Location", toLocation: "Warehouse B", productName: "Smart Watch", sku: "SW-045", quantity: 15, status: "pending", requestedBy: "Sarah Williams", requestDate: "2024-01-19", expectedDelivery: "2024-01-24", priority: "urgent" },
    { id: "3", transferNumber: "TRF-2024-003", fromLocation: "Warehouse A", toLocation: "Airport Store", productName: "Bluetooth Speaker", sku: "BS-112", quantity: 30, status: "delivered", requestedBy: "David Park", approvedBy: "Mike Johnson", requestDate: "2024-01-15", expectedDelivery: "2024-01-20", priority: "normal" },
    { id: "4", transferNumber: "TRF-2024-004", fromLocation: "Downtown Store", toLocation: "Mall Location", productName: "USB-C Cable", sku: "UC-789", quantity: 50, status: "approved", requestedBy: "Emily Davis", approvedBy: "Lisa Chen", requestDate: "2024-01-17", expectedDelivery: "2024-01-21", priority: "low" },
    { id: "5", transferNumber: "TRF-2024-005", fromLocation: "Warehouse B", toLocation: "Downtown Store", productName: "Laptop Stand", sku: "LS-234", quantity: 20, status: "in-transit", requestedBy: "Robert Wilson", approvedBy: "Mike Johnson", requestDate: "2024-01-16", expectedDelivery: "2024-01-21", priority: "normal" },
    { id: "6", transferNumber: "TRF-2024-006", fromLocation: "Airport Store", toLocation: "Warehouse A", productName: "Phone Case", sku: "PC-567", quantity: 40, status: "cancelled", requestedBy: "Jennifer Martinez", requestDate: "2024-01-14", expectedDelivery: "2024-01-19", priority: "normal" },
  ];

  const filteredTransfers = transfers.filter(transfer =>
    transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === "pending").length,
    approved: transfers.filter(t => t.status === "approved").length,
    inTransit: transfers.filter(t => t.status === "in-transit").length,
    delivered: transfers.filter(t => t.status === "delivered").length,
    urgent: transfers.filter(t => t.priority === "urgent").length,
    totalUnits: transfers.reduce((sum, t) => sum + t.quantity, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/retail")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Inventory Transfers
              </h1>
              <p className="text-muted-foreground mt-1">Manage stock movements between locations</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Request Transfer
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transfers</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalUnits} units moved</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inTransit}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently moving</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending + stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Urgent Requests</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground mt-1">Priority transfers</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transfer #, product, SKU, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transfers Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Transfer Requests ({filteredTransfers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Transfer #</th>
                    <th className="text-left py-3 px-4 font-semibold">Product</th>
                    <th className="text-left py-3 px-4 font-semibold">From → To</th>
                    <th className="text-left py-3 px-4 font-semibold">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold">Requested By</th>
                    <th className="text-left py-3 px-4 font-semibold">Request Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Expected Delivery</th>
                    <th className="text-left py-3 px-4 font-semibold">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium">{transfer.transferNumber}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{transfer.productName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{transfer.sku}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-muted-foreground">From: {transfer.fromLocation}</p>
                          <p>To: {transfer.toLocation}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{transfer.quantity} units</td>
                      <td className="py-3 px-4 text-sm">{transfer.requestedBy}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{transfer.requestDate}</td>
                      <td className="py-3 px-4 text-sm">{transfer.expectedDelivery}</td>
                      <td className="py-3 px-4">
                        <Badge variant={transfer.priority === "urgent" ? "destructive" : transfer.priority === "normal" ? "secondary" : "outline"} className="capitalize">
                          {transfer.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={transfer.status === "delivered" ? "default" : transfer.status === "in-transit" ? "secondary" : transfer.status === "cancelled" ? "destructive" : "outline"}>
                          {transfer.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/retail/transfers/${transfer.id}`)}>
                            View
                          </Button>
                          {transfer.status === "pending" && (
                            <>
                              <Button variant="outline" size="sm" className="text-green-600">
                                Approve
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
