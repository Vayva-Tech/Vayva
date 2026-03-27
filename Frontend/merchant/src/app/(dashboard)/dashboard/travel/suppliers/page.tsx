"use client";

/**
 * Travel Dashboard - Suppliers Management Page
 * Hotels, airlines, tour guides, and service providers
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface Supplier {
  id: string;
  name: string;
  type: "hotel" | "airline" | "tour_operator" | "transport" | "restaurant";
  contactName: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  status: "active" | "inactive" | "preferred";
}

export default function TravelSuppliersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Supplier[] }>("/api/travel/suppliers?limit=500");
      setSuppliers(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch suppliers", error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      hotel: "bg-blue-100 text-blue-800",
      airline: "bg-sky-100 text-sky-800",
      tour_operator: "bg-green-100 text-green-800",
      transport: "bg-orange-100 text-orange-800",
      restaurant: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Suppliers</h1>
          <p className="mt-1 text-gray-600">Manage hotels, airlines, tour operators, and service providers</p>
        </div>
        <Button onClick={() => router.push("/dashboard/travel/suppliers/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Supplier
        </Button>
      </div>

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Search suppliers..."
          className="w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading suppliers...</p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? "Try adjusting your search" : "Add suppliers to your network"}
          </p>
          {!searchTerm && (
            <Button onClick={() => router.push("/dashboard/travel/suppliers/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Supplier
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{supplier.name}</CardTitle>
                    <CardDescription>{supplier.location}</CardDescription>
                  </div>
                  <Badge className={getTypeBadgeColor(supplier.type)}>
                    {supplier.type.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{supplier.contactName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{supplier.rating}</span>
                    </div>
                    <Badge variant={supplier.status === "preferred" ? "default" : "outline"}>
                      {supplier.status}
                    </Badge>
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
// - GET /api/travel/suppliers - List suppliers
// - POST /api/travel/suppliers - Add supplier
// - PUT /api/travel/suppliers/:id - Update supplier
// - DELETE /api/travel/suppliers/:id - Remove supplier
