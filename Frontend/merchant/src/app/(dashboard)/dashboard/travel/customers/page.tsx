"use client";

/**
 * Travel Dashboard - Customers Page
 * Traveler CRM and customer management
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Mail, Phone, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  preferredDestination?: string;
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
}

export default function TravelCustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Customer[] }>("/travel/customers?limit=500");
      setCustomers(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch customers", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLoyaltyBadgeColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: "bg-amber-100 text-amber-800",
      silver: "bg-gray-100 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-blue-100 text-blue-800",
    };
    return colors[tier] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Customers</h1>
          <p className="mt-1 text-gray-600">Manage traveler relationships and booking history</p>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Search customers..."
          className="w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? "Try adjusting your search" : "Customer database will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{customer.name}</CardTitle>
                    <CardDescription>{customer.preferredDestination && `Prefers: ${customer.preferredDestination}`}</CardDescription>
                  </div>
                  <Badge className={getLoyaltyBadgeColor(customer.loyaltyTier)}>
                    {customer.loyaltyTier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-600">Total Bookings</p>
                      <p className="font-semibold">{customer.totalBookings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Spent</p>
                      <p className="font-semibold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// API INTEGRATION:
// Required Endpoints:
// - GET /api/travel/customers - List customers
// - POST /api/travel/customers - Add customer
// - PUT /api/travel/customers/:id - Update customer
// - DELETE /api/travel/customers/:id - Remove customer
