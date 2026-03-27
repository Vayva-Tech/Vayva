/**
 * Wellness - Appointments Management Page
 * Schedule and manage personal training sessions and consultations
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { useState } from "react";

interface Appointment {
  id: string;
  memberName: string;
  trainerName: string;
  serviceType: string;
  dateTime: string;
  duration: number;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

export default function WellnessAppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const appointments: Appointment[] = [
    { id: "1", memberName: "John Smith", trainerName: "Mike Johnson", serviceType: "Personal Training", dateTime: "2024-01-16 09:00", duration: 60, status: "confirmed", notes: "Focus on strength training" },
    { id: "2", memberName: "Emily Chen", trainerName: "Sarah Chen", serviceType: "Yoga Session", dateTime: "2024-01-16 10:30", duration: 90, status: "scheduled" },
    { id: "3", memberName: "Mike Wilson", trainerName: "Alex Brown", serviceType: "HIIT Training", dateTime: "2024-01-16 14:00", duration: 45, status: "scheduled" },
    { id: "4", memberName: "Sarah Johnson", trainerName: "Emma Wilson", serviceType: "Nutrition Consultation", dateTime: "2024-01-15 16:00", duration: 60, status: "completed" },
  ];

  const filteredAppointments = activeTab === "all" ? appointments : appointments.filter(a => a.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wellness")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Schedule training sessions and consultations</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wellness/appointments/new")}>
          <Calendar className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">{appointment.memberName}</span>
                      <Badge variant={appointment.status === "completed" ? "default" : appointment.status === "cancelled" ? "destructive" : "secondary"}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trainer:</span>
                        <span className="ml-2 font-medium">{appointment.trainerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Service:</span>
                        <span className="ml-2 font-medium">{appointment.serviceType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>
                        <span className="ml-2 font-medium">{appointment.dateTime.split(' ')[1]}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-2 font-medium">{appointment.duration} min</span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-xs text-muted-foreground mt-2">Note: {appointment.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/wellness/appointments/${appointment.id}`)}>
                      View
                    </Button>
                    {appointment.status === "scheduled" && (
                      <Button size="sm">Confirm</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
