/**
 * Travel - Hotels Management Page
 * Manage hotel partnerships, room inventory, and bookings
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Hotel, Search, Plus, Star } from "lucide-react";
import { useState } from "react";

interface Hotel {
  id: string;
  name: string;
  location: string;
  starRating: number;
  totalRooms: number;
  availableRooms: number;
  priceRange: string;
  amenities: string[];
  rating: number;
  status: "active" | "inactive" | "maintenance";
}

export default function TravelHotelsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const hotels: Hotel[] = [
    { id: "1", name: "Grand Plaza Hotel", location: "Paris, France", starRating: 5, totalRooms: 250, availableRooms: 45, priceRange: "$$$$", amenities: ["Pool", "Spa", "Gym", "Restaurant"], rating: 4.8, status: "active" },
    { id: "2", name: "Bali Beach Resort", location: "Bali, Indonesia", starRating: 4, totalRooms: 180, availableRooms: 32, priceRange: "$$$", amenities: ["Beach Access", "Pool", "Bar"], rating: 4.9, status: "active" },
    { id: "3", name: "Manhattan Suites", location: "New York, USA", starRating: 4, totalRooms: 320, availableRooms: 78, priceRange: "$$$$", amenities: ["Gym", "Business Center", "Restaurant"], rating: 4.6, status: "active" },
    { id: "4", name: "Santorini Villas", location: "Santorini, Greece", starRating: 5, totalRooms: 85, availableRooms: 12, priceRange: "$$$$$", amenities: ["Infinity Pool", "Sea View", "Spa"], rating: 4.9, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/travel")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Hotels</h1>
            <p className="text-muted-foreground">Manage hotel partnerships and rooms</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Hotel
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hotels by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{hotel.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Hotel className="h-3 w-3" />
                    {hotel.location}
                  </p>
                </div>
                <Badge variant={hotel.status === "active" ? "default" : "secondary"}>{hotel.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(hotel.starRating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rooms:</span>
                  <span className="font-medium">{hotel.availableRooms}/{hotel.totalRooms} available</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Range:</span>
                  <span className="font-medium">{hotel.priceRange}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Guest Rating:</span>
                  <Badge variant="outline">★ {hotel.rating}</Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {hotel.amenities.slice(0, 3).map((amenity, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{amenity}</Badge>
                ))}
                {hotel.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{hotel.amenities.length - 3}</Badge>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/travel/hotels/${hotel.id}`)}>
                  Manage
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/travel/hotels/${hotel.id}/rooms`)}>
                  Rooms
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
