"use client";

/**
 * Travel Dashboard - Bookings Management Page
 * Flight, hotel, package, and tour booking system
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Download, Calendar, Plane, Hotel, MapPin, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  destination: string;
  type: "flight" | "hotel" | "package" | "tour";
  status: "confirmed" | "pending" | "processing" | "completed" | "cancelled";
  totalAmount: number;
  travelDate: string;
  createdAt: string;
}

export default function TravelBookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Booking[] }>("/api/travel/bookings?limit=500");
      setBookings(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch bookings", error);
      setBookings([]);
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
      case "completed":
        return "secondary";
      case "pending":
      case "processing":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-4 w-4" />;
      case "hotel":
        return <Hotel className="h-4 w-4" />;
      case "package":
        return <MapPin className="h-4 w-4" />;
      case "tour":
        return <Utensils className="h-4 w-4" />;
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Bookings</h1>
          <p className="mt-1 text-gray-600">Manage all travel reservations and bookings</p>
        </div>
        <Button onClick={() => router.push("/dashboard/travel/bookings/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search bookings..."
                className="w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Start creating bookings to manage travel arrangements"}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push("/dashboard/travel/bookings/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Booking
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Travel Date</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.bookingNumber}</TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{booking.destination}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getBookingTypeIcon(booking.type)}
                        <span className="capitalize">{booking.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(booking.totalAmount)}</TableCell>
                    <TableCell>{formatDate(booking.travelDate)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{formatDate(booking.createdAt)}</TableCell>
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

// API INTEGRATION NOTES:
// Required Endpoints:
// - GET /api/travel/bookings - List all bookings (with pagination, filtering)
// - POST /api/travel/bookings - Create new booking
// - GET /api/travel/bookings/:id - Get booking details
// - PUT /api/travel/bookings/:id - Update booking
// - DELETE /api/travel/bookings/:id - Cancel booking
