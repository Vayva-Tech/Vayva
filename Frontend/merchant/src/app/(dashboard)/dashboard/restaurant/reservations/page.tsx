/**
 * Restaurant Reservations Page
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Calendar, Plus } from "lucide-react";

interface Reservation {
  id: string;
  guestName: string;
  partySize: number;
  dateTime: string;
  status: "confirmed" | "seated" | "completed" | "cancelled" | "no-show";
  contactPhone: string;
}

export default function RestaurantReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await apiJson<{ data: Reservation[] }>("/restaurant/reservations?limit=200");
      setReservations(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch reservations", error);
      setReservations([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/restaurant")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Reservation Management
              </h1>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Reservations Yet</h3>
                <p className="text-muted-foreground mb-4">Setup your reservation system to start accepting bookings</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reservation
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Party Size</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">{reservation.guestName}</TableCell>
                      <TableCell>{reservation.partySize} guests</TableCell>
                      <TableCell>{formatDate(reservation.dateTime)}</TableCell>
                      <TableCell><Badge variant={reservation.status === "confirmed" ? "default" : "secondary"}>{reservation.status}</Badge></TableCell>
                      <TableCell>{reservation.contactPhone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// No mock data - requires real restaurant API integration
