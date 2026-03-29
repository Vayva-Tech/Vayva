"use client";

/**
 * Travel Dashboard - Packages Management Page
 * Tour packages and travel bundle creator
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MapPin, DollarSign, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface TravelPackage {
  id: string;
  name: string;
  destination: string;
  duration: number;
  price: number;
  rating: number;
  bookings: number;
  status: "active" | "inactive" | "seasonal";
  imageUrl?: string;
}

export default function TravelPackagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: TravelPackage[] }>("/travel/packages?limit=500");
      setPackages(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch packages", error);
      setPackages([]);
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

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Packages</h1>
          <p className="mt-1 text-gray-600">Create and manage tour packages and travel bundles</p>
        </div>
        <Button onClick={() => router.push("/dashboard/travel/packages/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Package
        </Button>
      </div>

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Search packages..."
          className="w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading packages...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No packages found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? "Try adjusting your search" : "Create your first travel package"}
          </p>
          {!searchTerm && (
            <Button onClick={() => router.push("/dashboard/travel/packages/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.destination}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="font-semibold">{pkg.duration} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="font-semibold text-green-600">{formatCurrency(pkg.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{pkg.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">{pkg.bookings} bookings</div>
                  </div>
                  <Badge variant={pkg.status === "active" ? "default" : "outline"}>
                    {pkg.status}
                  </Badge>
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
// - GET /api/travel/packages - List packages
// - POST /api/travel/packages - Create package
// - PUT /api/travel/packages/:id - Update package
// - DELETE /api/travel/packages/:id - Remove package
