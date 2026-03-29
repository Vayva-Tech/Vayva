/**
 * Retail Industry - Multi-Channel Sales Management Page
 * Manage sales across online, in-store, marketplace, and mobile channels
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShoppingCart, Search, TrendingUp, Store, Globe } from "lucide-react";
import { useState } from "react";

interface ChannelSale {
  id: string;
  channel: "online" | "in-store" | "marketplace" | "mobile" | "social";
  orderId: string;
  customerName: string;
  amount: number;
  items: number;
  date: string;
  status: "completed" | "processing" | "shipped" | "pickup-ready";
  location?: string;
  platform?: string;
}

export default function RetailMultiChannelPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const sales: ChannelSale[] = [
    { id: "1", channel: "online", orderId: "ORD-2024-001", customerName: "John Smith", amount: 285.50, items: 3, date: "2024-01-20", status: "completed", platform: "Website" },
    { id: "2", channel: "in-store", orderId: "POS-2024-045", customerName: "Sarah Williams", amount: 156.75, items: 2, date: "2024-01-20", status: "completed", location: "Downtown Store" },
    { id: "3", channel: "marketplace", orderId: "AMZ-789456", customerName: "Michael Brown", amount: 425.00, items: 1, date: "2024-01-19", status: "shipped", platform: "Amazon" },
    { id: "4", channel: "mobile", orderId: "APP-2024-123", customerName: "Emily Davis", amount: 89.99, items: 2, date: "2024-01-20", status: "processing", platform: "iOS App" },
    { id: "5", channel: "social", orderId: "IG-2024-567", customerName: "Robert Wilson", amount: 195.00, items: 3, date: "2024-01-19", status: "pickup-ready", platform: "Instagram Shop" },
    { id: "6", channel: "online", orderId: "ORD-2024-002", customerName: "Jennifer Martinez", amount: 567.25, items: 5, date: "2024-01-18", status: "completed", platform: "Website" },
    { id: "7", channel: "in-store", orderId: "POS-2024-046", customerName: "David Anderson", amount: 234.50, items: 4, date: "2024-01-20", status: "completed", location: "Mall Location" },
    { id: "8", channel: "marketplace", orderId: "EBY-456789", customerName: "Lisa Thompson", amount: 178.00, items: 2, date: "2024-01-18", status: "shipped", platform: "eBay" },
  ];

  const filteredSales = sales.filter(sale =>
    sale.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.platform?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: sales.length,
    online: sales.filter(s => s.channel === "online").length,
    inStore: sales.filter(s => s.channel === "in-store").length,
    marketplace: sales.filter(s => s.channel === "marketplace").length,
    mobile: sales.filter(s => s.channel === "mobile" || s.channel === "social").length,
    totalRevenue: sales.reduce((sum, s) => sum + s.amount, 0),
    avgOrderValue: sales.reduce((sum, s) => sum + s.amount, 0) / sales.length,
  };

  const channelBreakdown = [
    { name: "Online", value: stats.online, percentage: (stats.online / stats.total) * 100, color: "from-blue-500 to-cyan-500" },
    { name: "In-Store", value: stats.inStore, percentage: (stats.inStore / stats.total) * 100, color: "from-green-500 to-emerald-500" },
    { name: "Marketplace", value: stats.marketplace, percentage: (stats.marketplace / stats.total) * 100, color: "from-orange-500 to-amber-500" },
    { name: "Mobile & Social", value: stats.mobile, percentage: (stats.mobile / stats.total) * 100, color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/retail")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Multi-Channel Sales
              </h1>
              <p className="text-muted-foreground mt-1">Unified commerce across all sales channels</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All channels combined</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Online Sales</CardTitle>
              <Globe className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{stats.online}</div>
              <p className="text-xs text-muted-foreground mt-1">Website orders</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In-Store Sales</CardTitle>
              <Store className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.inStore}</div>
              <p className="text-xs text-muted-foreground mt-1">POS transactions</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${stats.avgOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Channel Breakdown */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Sales by Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelBreakdown.map((channel) => (
                <div key={channel.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{channel.name}</span>
                    <span className="text-muted-foreground">{channel.value} orders ({channel.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${channel.color}`}
                      style={{ width: `${channel.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, channel, or platform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Sales ({filteredSales.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead scope="col">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Channel</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Platform/Location</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Items</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Date</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Status</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium">{sale.orderId}</td>
                      <td className="py-3 px-4 font-semibold">{sale.customerName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {sale.channel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {sale.platform || sale.location || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">{sale.items} items</td>
                      <td className="py-3 px-4 font-mono font-semibold text-green-600">${sale.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{sale.date}</td>
                      <td className="py-3 px-4">
                        <Badge variant={sale.status === "completed" ? "default" : sale.status === "shipped" ? "secondary" : sale.status === "pickup-ready" ? "outline" : "outline"}>
                          {sale.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/retail/orders/${sale.orderId}`)}>
                            View
                          </Button>
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
