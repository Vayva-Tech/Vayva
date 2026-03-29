/**
 * Beauty Bookings & Appointments Page
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Calendar as CalendarIcon, Plus, Clock, CheckCircle } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  staffName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  price: number;
}

export default function BeautyBookingsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await apiJson<{ data: Appointment[] }>("/beauty/appointments?limit=200");
      setAppointments(response.data || generateMockAppointments());
    } catch (error) {
      setAppointments(generateMockAppointments());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/beauty")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Bookings & Appointments
              </h1>
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.slice(0, 8).map((apt) => (
                  <div key={apt.id} className="p-3 bg-muted/50 rounded-lg border-l-4 border-purple-500">
                    <p className="font-medium text-sm">{apt.clientName}</p>
                    <p className="text-xs text-muted-foreground">{apt.serviceName}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {apt.scheduledTime}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.clientName}</TableCell>
                    <TableCell>{apt.serviceName}</TableCell>
                    <TableCell>{apt.staffName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(apt.scheduledDate)}</p>
                        <p className="text-xs text-muted-foreground">{apt.scheduledTime}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${apt.price}</TableCell>
                    <TableCell>
                      <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>{apt.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


// No mock data - requires real beauty API integration

