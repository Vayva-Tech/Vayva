/**
 * Travel - Flights Management Page
 * Manage flight bookings, schedules, and reservations
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plane, Search, Plus, Clock } from "lucide-react";
import { useState } from "react";

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  price: number;
  status: "scheduled" | "boarding" | "departed" | "arrived" | "cancelled";
}

export default function TravelFlightsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const flights: Flight[] = [
    { id: "1", flightNumber: "AA123", airline: "American Airlines", origin: "JFK - New York", destination: "CDG - Paris", departureTime: "2024-01-20 18:30", arrivalTime: "2024-01-21 07:45", availableSeats: 45, price: 899, status: "scheduled" },
    { id: "2", flightNumber: "DL456", airline: "Delta", origin: "LAX - Los Angeles", destination: "HND - Tokyo", departureTime: "2024-01-20 11:00", arrivalTime: "2024-01-21 15:30", availableSeats: 28, price: 1250, status: "scheduled" },
    { id: "3", flightNumber: "BA789", airline: "British Airways", origin: "LHR - London", destination: "DXB - Dubai", departureTime: "2024-01-20 14:15", arrivalTime: "2024-01-21 00:30", availableSeats: 12, price: 750, status: "boarding" },
    { id: "4", flightNumber: "AF321", airline: "Air France", origin: "CDG - Paris", destination: "SIN - Singapore", departureTime: "2024-01-20 23:45", arrivalTime: "2024-01-21 18:15", availableSeats: 67, price: 1100, status: "scheduled" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/travel")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Flights</h1>
            <p className="text-muted-foreground">Manage flight bookings and schedules</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Flight
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by flight number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input placeholder="Origin airport" />
            <Input placeholder="Destination airport" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Flight</th>
                  <th className="py-3 px-4 font-medium">Route</th>
                  <th className="py-3 px-4 font-medium">Departure</th>
                  <th className="py-3 px-4 font-medium">Arrival</th>
                  <th className="py-3 px-4 font-medium">Seats</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => (
                  <tr key={flight.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-mono font-medium">{flight.flightNumber}</p>
                        <p className="text-xs text-muted-foreground">{flight.airline}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-blue-600 rotate-45" />
                        <div>
                          <p className="text-sm font-medium">{flight.destination.split(' - ')[1]}</p>
                          <p className="text-xs text-muted-foreground">from {flight.origin.split(' - ')[1]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="font-medium">{flight.departureTime.split(' ')[1]}</p>
                        <p className="text-xs text-muted-foreground">{flight.departureTime.split(' ')[0]}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="font-medium">{flight.arrivalTime.split(' ')[1]}</p>
                        <p className="text-xs text-muted-foreground">{flight.arrivalTime.split(' ')[0]}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={flight.availableSeats < 20 ? "destructive" : "outline"}>
                        {flight.availableSeats} seats
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold">${flight.price.toLocaleString()}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={flight.status === "scheduled" ? "default" : flight.status === "cancelled" ? "destructive" : "secondary"}>
                        {flight.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/travel/flights/${flight.id}`)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
