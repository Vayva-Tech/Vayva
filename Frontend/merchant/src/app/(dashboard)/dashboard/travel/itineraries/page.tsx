"use client";

/**
 * Travel Dashboard - Itineraries Page
 * Day-by-day trip planning and scheduling
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface Itinerary {
  id: string;
  customerName: string;
  destination: string;
  departureDate: string;
  duration: number;
  status: "planning" | "confirmed" | "in_progress" | "completed";
  activities: number;
}

export default function TravelItinerariesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Itinerary[] }>("/travel/itineraries?limit=500");
      setItineraries(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch itineraries", error);
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "in_progress":
        return "secondary";
      case "planning":
        return "outline";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Itineraries</h1>
          <p className="mt-1 text-gray-600">Plan and manage detailed travel schedules</p>
        </div>
        <Button onClick={() => router.push("/dashboard/travel/itineraries/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Itinerary
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Itineraries</CardTitle>
          <CardDescription>Scheduled trips and travel plans</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading itineraries...</p>
            </div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No itineraries yet</h3>
              <p className="text-gray-600 mb-4">Create detailed travel schedules for your customers</p>
              <Button onClick={() => router.push("/dashboard/travel/itineraries/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Itinerary
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Activities</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itineraries.map((itinerary) => (
                  <TableRow key={itinerary.id}>
                    <TableCell className="font-medium">{itinerary.customerName}</TableCell>
                    <TableCell>{itinerary.destination}</TableCell>
                    <TableCell>{formatDate(itinerary.departureDate)}</TableCell>
                    <TableCell>{itinerary.duration} days</TableCell>
                    <TableCell>{itinerary.activities} activities</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(itinerary.status)}>{itinerary.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// API INTEGRATION:
// Required Endpoints:
// - GET /api/travel/itineraries - List itineraries
// - POST /api/travel/itineraries - Create itinerary
// - GET /api/travel/itineraries/:id - Get itinerary details
// - PUT /api/travel/itineraries/:id - Update itinerary
// - DELETE /api/travel/itineraries/:id - Remove itinerary
