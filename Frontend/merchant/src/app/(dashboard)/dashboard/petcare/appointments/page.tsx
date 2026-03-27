/**
 * Pet Care - Appointments Management Page
 * Schedule and manage veterinary appointments
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { logger, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  PawPrint,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  ownerName: string;
  ownerPhone: string;
  serviceType: string;
  dateTime: string;
  duration: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "no-show";
  veterinarian?: string;
  notes?: string;
  followUpRequired?: boolean;
}

export default function PetCareAppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Appointment[] }>(`/api/petcare/appointments?date=${selectedDate}`);
      setAppointments(response.data || []);
    } catch (error) {
      logger.error("Failed to fetch appointments", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-700";
      case "in-progress": return "bg-purple-100 text-purple-700";
      case "completed": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "no-show": return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Clock className="h-3 w-3" />;
      case "in-progress": return <PawPrint className="h-3 w-3" />;
      case "completed": return <CheckCircle className="h-3 w-3" />;
      case "cancelled": return <XCircle className="h-3 w-3" />;
      case "no-show": return <XCircle className="h-3 w-3" />;
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment["status"]) => {
    try {
      await apiJson(`/api/petcare/appointments/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Appointment updated");
      fetchAppointments();
    } catch (error) {
      logger.error("Failed to update appointment", error);
      toast.error("Failed to update appointment");
    }
  };

  const todayAppointments = appointments.filter(a => a.status === "scheduled" || a.status === "in-progress");
  const completedAppointments = appointments.filter(a => a.status === "completed");
  const cancelledAppointments = appointments.filter(a => a.status === "cancelled" || a.status === "no-show");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/petcare")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-sm text-muted-foreground">Schedule and manage appointments</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/petcare/appointments/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Date Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                Today
              </Button>
              <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/petcare/appointments/calendar")}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments by Status */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedAppointments.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <div className="grid gap-4 md:grid-cols-2">
            {todayAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.serviceType}</p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{appointment.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.dateTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.duration} min</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">{appointment.ownerName}</p>
                    <p className="text-xs text-muted-foreground">{appointment.ownerPhone}</p>
                  </div>

                  {appointment.veterinarian && (
                    <p className="text-xs text-muted-foreground">Dr. {appointment.veterinarian}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    {appointment.status === "scheduled" && (
                      <>
                        <Button size="sm" className="flex-1" onClick={() => handleStatusChange(appointment.id, "in-progress")}>
                          Start
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleStatusChange(appointment.id, "cancelled")}>
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === "in-progress" && (
                      <Button size="sm" className="flex-1" onClick={() => handleStatusChange(appointment.id, "completed")}>
                        Complete
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/petcare/appointments/${appointment.id}`)}>
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {todayAppointments.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No Appointments for Today</h3>
                  <p className="text-muted-foreground mb-4">Schedule an appointment to get started</p>
                  <Button onClick={() => router.push("/dashboard/petcare/appointments/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4 md:grid-cols-2">
            {completedAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.serviceType}</p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      Completed
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formatDate(appointment.dateTime)}</p>
                  <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => router.push(`/dashboard/petcare/appointments/${appointment.id}`)}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cancelled">
          <div className="grid gap-4 md:grid-cols-2">
            {cancelledAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.serviceType}</p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      {appointment.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{formatDate(appointment.dateTime)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
