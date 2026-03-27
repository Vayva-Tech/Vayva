/**
 * Wholesale - Customers Management Page
 * Manage B2B customers, credit limits, and tier pricing
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Mail, Phone } from "lucide-react";
import { useState } from "react";

interface B2BCustomer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  creditLimit: number;
  outstandingBalance: number;
  totalOrders: number;
  lifetimeValue: number;
}

export default function WholesaleCustomersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const customers: B2BCustomer[] = [
    { id: "1", companyName: "ABC Retailers Inc.", contactName: "John Smith", email: "john@abcretail.com", phone: "+1 (555) 123-4567", tier: "gold", creditLimit: 50000, outstandingBalance: 12500, totalOrders: 45, lifetimeValue: 287650 },
    { id: "2", companyName: "XYZ Distributors", contactName: "Sarah Johnson", email: "sarah@xyzdist.com", phone: "+1 (555) 234-5678", tier: "platinum", creditLimit: 100000, outstandingBalance: 23400, totalOrders: 89, lifetimeValue: 542300 },
    { id: "3", companyName: "Quick Supply Co", contactName: "Mike Brown", email: "mike@quicksupply.com", phone: "+1 (555) 345-6789", tier: "silver", creditLimit: 25000, outstandingBalance: 5600, totalOrders: 23, lifetimeValue: 98450 },
  ];

  const getTierColor = (tier: string) => {
    switch(tier) {
      case "platinum": return "from-purple-500 to-indigo-500";
      case "gold": return "from-yellow-500 to-orange-500";
      case "silver": return "from-gray-400 to-gray-600";
      case "bronze": return "from-amber-600 to-amber-800";
      default: return "from-gray-500 to-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wholesale")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">B2B Customers</h1>
            <p className="text-muted-foreground">Manage customer accounts and tier pricing</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{customer.companyName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{customer.contactName}</p>
                </div>
                <Badge className={`bg-gradient-to-r ${getTierColor(customer.tier)} text-white border-0`}>
                  {customer.tier.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credit Limit:</span>
                  <span className="font-medium">${customer.creditLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="font-medium">${customer.outstandingBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Orders:</span>
                  <span className="font-medium">{customer.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Lifetime Value:</span>
                  <span className="font-bold text-green-600">${customer.lifetimeValue.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wholesale/customers/${customer.id}`)}>
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Create Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
