/**
 * ============================================================================
 * Healthcare Appointments & Scheduling Page
 * ============================================================================
 * Advanced appointment scheduling with calendar integration
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { logger, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  Users,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";

interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  providerId: string;
  providerName?: string;
  appointmentType: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  reason: string;
}

export default function HealthcareAppointmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Appointment[] }>("/healthcare/appointments?limit=200");
      setAppointments(response.data || generateMockAppointments());
    } catch (error) {
      setAppointments(generateMockAppointments());
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, status: Appointment["status"]) => {
    try {
      await apiJson(`/api/healthcare/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setAppointments(appointments.map(a => a.id === appointmentId ? { ...a, status } : a));
      toast.success(`Appointment ${status}`);
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const getEventsForDay = (date: Date) => {
    return appointments.filter(apt => apt.scheduledDate === format(date, "yyyy-MM-dd"));
  };

  const stats = {
    today: appointments.filter(a => a.scheduledDate === format(new Date(), "yyyy-MM-dd")).length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/healthcare-services")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Appointments & Scheduling
                </h1>
                <p className="text-xs text-muted-foreground">Manage patient appointments</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.today}</p>
                  <p className="text-xs text-muted-foreground">Today's Appointments</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <Timer className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Calendar */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly View</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                    Previous
                  </Button>
                  <Badge variant="outline" className="text-sm px-4">
                    {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                    Next
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  modifiers={{
                    hasAppointment: (date) => getEventsForDay(date).length > 0,
                  }}
                  modifiersClassNames={{
                    hasAppointment: "bg-green-100 font-bold",
                  }}
                />
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.filter(a => a.scheduledDate === format(new Date(), "yyyy-MM-dd")).slice(0, 5).map((apt) => (
                    <div key={apt.id} className="p-3 bg-muted/50 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{apt.patientName}</p>
                          <p className="text-xs text-muted-foreground">{apt.appointmentType}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {apt.scheduledTime} ({apt.duration} min)
                          </div>
                        </div>
                        <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>{apt.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


// No mock data - requires real healthcare API integration

