/**
 * Travel - Destinations Management Page
 * Manage travel destinations, packages, and location information
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Search, Plus, Globe } from "lucide-react";
import { useState } from "react";

interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  popularity: number;
  packagesCount: number;
  averageRating: number;
  status: "active" | "inactive" | "seasonal";
  imageUrl?: string;
}

export default function TravelDestinationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const destinations: Destination[] = [
    { id: "1", name: "Paris", country: "France", region: "Europe", description: "City of Light", popularity: 98, packagesCount: 24, averageRating: 4.8, status: "active" },
    { id: "2", name: "Bali", country: "Indonesia", region: "Asia", description: "Tropical Paradise", popularity: 95, packagesCount: 18, averageRating: 4.9, status: "active" },
    { id: "3", name: "New York", country: "USA", region: "North America", description: "The Big Apple", popularity: 92, packagesCount: 32, averageRating: 4.7, status: "active" },
    { id: "4", name: "Santorini", country: "Greece", region: "Europe", description: "Greek Island Gem", popularity: 89, packagesCount: 12, averageRating: 4.9, status: "seasonal" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/travel")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Destinations</h1>
            <p className="text-muted-foreground">Manage travel locations and packages</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/travel/destinations/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations by name, country, or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => (
          <Card key={destination.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{destination.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {destination.country}, {destination.region}
                  </p>
                </div>
                <Badge variant={destination.status === "active" ? "default" : destination.status === "seasonal" ? "secondary" : "outline"}>
                  {destination.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{destination.description}</p>
              
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Packages:</span>
                  <span className="font-medium">{destination.packagesCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Popularity:</span>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-blue-600" />
                    <span className="font-medium">{destination.popularity}%</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Rating:</span>
                  <Badge variant="outline">★ {destination.averageRating}</Badge>
                </div>
              </div>
              
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/travel/destinations/${destination.id}`)}>
                  Edit
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/travel/packages?destination=${destination.id}`)}>
                  View Packages
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
