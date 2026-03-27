/**
 * Real Estate - Properties Management Page
 * Manage property listings, details, and status
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Home, Search, Plus, MapPin, Bed, Bath, Square } from "lucide-react";
import { useState } from "react";

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: "house" | "condo" | "townhouse" | "land" | "commercial";
  status: "active" | "pending" | "sold" | "expired" | "withdrawn";
  daysOnMarket: number;
}

export default function RealEstatePropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const properties: Property[] = [
    { id: "1", address: "123 Oak Street", city: "Beverly Hills", state: "CA", zipCode: "90210", price: 2450000, bedrooms: 4, bathrooms: 3.5, sqft: 3200, type: "house", status: "active", daysOnMarket: 12 },
    { id: "2", address: "456 Palm Avenue", city: "Miami Beach", state: "FL", zipCode: "33139", price: 1850000, bedrooms: 3, bathrooms: 2, sqft: 2100, type: "condo", status: "active", daysOnMarket: 8 },
    { id: "3", address: "789 Maple Drive", city: "Austin", state: "TX", zipCode: "78701", price: 975000, bedrooms: 3, bathrooms: 2.5, sqft: 2400, type: "townhouse", status: "pending", daysOnMarket: 5 },
    { id: "4", address: "321 Pine Lane", city: "Seattle", state: "WA", zipCode: "98101", price: 1250000, bedrooms: 4, bathrooms: 3, sqft: 2800, type: "house", status: "active", daysOnMarket: 21 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/real-estate")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Properties</h1>
            <p className="text-muted-foreground">Manage property listings and inventory</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/real-estate/properties/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address, city, or ZIP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">${property.price.toLocaleString()}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {property.address}, {property.city}
                  </p>
                </div>
                <Badge variant={property.status === "active" ? "default" : property.status === "pending" ? "secondary" : "outline"}>
                  {property.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <Bed className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs font-medium">{property.bedrooms}</p>
                  <p className="text-xs text-muted-foreground">Beds</p>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <Bath className="h-4 w-4 mx-auto mb-1 text-green-600" />
                  <p className="text-xs font-medium">{property.bathrooms}</p>
                  <p className="text-xs text-muted-foreground">Baths</p>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <Square className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs font-medium">{(property.sqft / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">SqFt</p>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{property.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days on Market:</span>
                  <span className="font-medium">{property.daysOnMarket} days</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/real-estate/properties/${property.id}`)}>
                  View
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/real-estate/listings?property=${property.id}`)}>
                  Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
