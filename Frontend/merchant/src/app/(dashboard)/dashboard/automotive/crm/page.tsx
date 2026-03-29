/**
 * Automotive Industry - CRM & Customer Management Page
 * Manage customer relationships, leads, and sales pipeline
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Mail, Phone, TrendingUp } from "lucide-react";
import { useState } from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "lead" | "prospect" | "customer" | "vip";
  status: "active" | "inactive" | "converted";
  interestedVehicle?: string;
  budget?: number;
  lastContact: string;
  nextFollowUp?: string;
  totalPurchases: number;
  source: "website" | "referral" | "walk-in" | "social" | "advertising";
}

export default function AutomotiveCRMPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const customers: Customer[] = [
    { id: "1", name: "John Smith", email: "john.smith@email.com", phone: "(555) 123-4567", type: "prospect", status: "active", interestedVehicle: "Tesla Model 3", budget: 45000, lastContact: "2024-01-18", nextFollowUp: "2024-01-22", totalPurchases: 0, source: "website" },
    { id: "2", name: "Sarah Williams", email: "sarah.w@email.com", phone: "(555) 234-5678", type: "customer", status: "active", interestedVehicle: "BMW X5", budget: 70000, lastContact: "2024-01-19", totalPurchases: 1, source: "referral" },
    { id: "3", name: "Michael Brown", email: "mbrown@email.com", phone: "(555) 345-6789", type: "vip", status: "converted", interestedVehicle: "Mercedes C-Class", budget: 50000, lastContact: "2024-01-17", totalPurchases: 3, source: "referral" },
    { id: "4", name: "Emily Davis", email: "emily.davis@email.com", phone: "(555) 456-7890", type: "lead", status: "active", interestedVehicle: "Audi e-tron GT", budget: 110000, lastContact: "2024-01-16", nextFollowUp: "2024-01-21", totalPurchases: 0, source: "website" },
    { id: "5", name: "Robert Wilson", email: "rwilson@email.com", phone: "(555) 567-8901", type: "prospect", status: "inactive", interestedVehicle: "Ford F-150", budget: 60000, lastContact: "2024-01-10", totalPurchases: 0, source: "walk-in" },
    { id: "6", name: "Jennifer Martinez", email: "jmartinez@email.com", phone: "(555) 678-9012", type: "vip", status: "active", interestedVehicle: "Porsche 911", budget: 130000, lastContact: "2024-01-18", totalPurchases: 2, source: "referral" },
    { id: "7", name: "David Anderson", email: "d.anderson@email.com", phone: "(555) 789-0123", type: "customer", status: "converted", interestedVehicle: "Toyota RAV4", budget: 35000, lastContact: "2024-01-15", totalPurchases: 1, source: "website" },
    { id: "8", name: "Lisa Thompson", email: "lthompson@email.com", phone: "(555) 890-1234", type: "lead", status: "active", interestedVehicle: "Honda Accord", budget: 32000, lastContact: "2024-01-19", nextFollowUp: "2024-01-23", totalPurchases: 0, source: "social" },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.interestedVehicle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: customers.length,
    leads: customers.filter(c => c.type === "lead").length,
    prospects: customers.filter(c => c.type === "prospect").length,
    customers: customers.filter(c => c.type === "customer" || c.type === "vip").length,
    active: customers.filter(c => c.status === "active").length,
    vipCount: customers.filter(c => c.type === "vip").length,
    conversionRate: ((customers.filter(c => c.type === "customer" || c.type === "vip").length / (customers.filter(c => c.type === "lead" || c.type === "prospect").length + customers.filter(c => c.type === "customer" || c.type === "vip").length)) * 100).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/automotive")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Customer CRM
              </h1>
              <p className="text-muted-foreground mt-1">Manage leads, prospects, and customer relationships</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.active} active</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Leads & Prospects</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.leads + stats.prospects}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.leads} leads, {stats.prospects} prospects</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <Badge className="h-6 w-6 text-xs">VIP</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.customers}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.vipCount} VIP customers</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Lead to customer</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or vehicle interest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead scope="col">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Type</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Interested Vehicle</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Budget</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Last Contact</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Next Follow-Up</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Source</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Status</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-semibold">{customer.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant={customer.type === "vip" ? "default" : customer.type === "customer" ? "secondary" : customer.type === "prospect" ? "outline" : "outline"} className="capitalize">
                          {customer.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3 text-blue-600" />
                            <span className="truncate max-w-[150px]">{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 text-green-600" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{customer.interestedVehicle || "N/A"}</td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {customer.budget ? `$${(customer.budget / 1000).toFixed(0)}K` : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{customer.lastContact}</td>
                      <td className="py-3 px-4">
                        {customer.nextFollowUp ? (
                          <Badge variant={new Date(customer.nextFollowUp) < new Date() ? "destructive" : "secondary"}>
                            {customer.nextFollowUp}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {customer.source}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={customer.status === "active" ? "default" : customer.status === "converted" ? "secondary" : "outline"}>
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/automotive/crm/${customer.id}`)}>
                            View
                          </Button>
                          {customer.nextFollowUp && (
                            <Button variant="outline" size="sm" className="text-blue-600">
                              Follow Up
                            </Button>
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
