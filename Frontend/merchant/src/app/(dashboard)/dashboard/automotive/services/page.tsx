/**
 * Automotive Industry - Service Department Management Page
 * Manage vehicle service appointments, maintenance, and repairs
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wrench, Search, Plus, Calendar, Clock } from "lucide-react";
import { useState } from "react";

interface ServiceAppointment {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vin: string;
  serviceType: "oil-change" | "tire-rotation" | "brake-service" | "inspection" | "repair" | "maintenance";
  description: string;
  appointmentDate: string;
  appointmentTime: string;
  estimatedDuration: number;
  estimatedCost: number;
  assignedTechnician: string;
  status: "scheduled" | "check-in" | "in-progress" | "completed" | "cancelled";
  priority: "routine" | "urgent" | "critical";
}

export default function AutomotiveServicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const appointments: ServiceAppointment[] = [
    { id: "1", customerName: "John Smith", customerPhone: "(555) 123-4567", vehicleMake: "Tesla", vehicleModel: "Model 3", vehicleYear: 2024, vin: "5YJ3E1EA1PF123456", serviceType: "oil-change", description: "Regular maintenance, tire rotation", appointmentDate: "2024-01-20", appointmentTime: "9:00 AM", estimatedDuration: 90, estimatedCost: 150, assignedTechnician: "Mike R.", status: "scheduled", priority: "routine" },
    { id: "2", customerName: "Sarah Williams", customerPhone: "(555) 234-5678", vehicleMake: "BMW", vehicleModel: "X5", vehicleYear: 2024, vin: "5UXCR6C09P9L12345", serviceType: "brake-service", description: "Brake pad replacement, front", appointmentDate: "2024-01-20", appointmentTime: "10:30 AM", estimatedDuration: 180, estimatedCost: 450, assignedTechnician: "David L.", status: "in-progress", priority: "urgent" },
    { id: "3", customerName: "Michael Brown", customerPhone: "(555) 345-6789", vehicleMake: "Mercedes-Benz", vehicleModel: "C-Class", vehicleYear: 2023, vin: "55SWF4KB5PU123456", serviceType: "inspection", description: "Annual safety inspection", appointmentDate: "2024-01-19", appointmentTime: "2:00 PM", estimatedDuration: 60, estimatedCost: 120, assignedTechnician: "Mike R.", status: "completed", priority: "routine" },
    { id: "4", customerName: "Emily Davis", customerPhone: "(555) 456-7890", vehicleMake: "Audi", vehicleModel: "e-tron GT", vehicleYear: 2024, vin: "WAUAVAF19PN123456", serviceType: "repair", description: "AC not cooling properly", appointmentDate: "2024-01-21", appointmentTime: "11:00 AM", estimatedDuration: 240, estimatedCost: 850, assignedTechnician: "Carlos M.", status: "scheduled", priority: "urgent" },
    { id: "5", customerName: "Robert Wilson", customerPhone: "(555) 567-8901", vehicleMake: "Ford", vehicleModel: "F-150", vehicleYear: 2024, vin: "1FTFW1E84PFA12345", serviceType: "tire-rotation", description: "Tire rotation and balance", appointmentDate: "2024-01-20", appointmentTime: "1:00 PM", estimatedDuration: 45, estimatedCost: 80, assignedTechnician: "David L.", status: "check-in", priority: "routine" },
    { id: "6", customerName: "Jennifer Martinez", customerPhone: "(555) 678-9012", vehicleMake: "Porsche", vehicleModel: "911 Carrera", vehicleYear: 2024, vin: "WP0AA2A99PS123456", serviceType: "maintenance", description: "10K mile service interval", appointmentDate: "2024-01-22", appointmentTime: "9:30 AM", estimatedDuration: 150, estimatedCost: 650, assignedTechnician: "Carlos M.", status: "scheduled", priority: "routine" },
  ];

  const filteredAppointments = appointments.filter(apt =>
    apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${apt.vehicleMake} ${apt.vehicleModel}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.vin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === "scheduled").length,
    inProgress: appointments.filter(a => a.status === "in-progress").length,
    completed: appointments.filter(a => a.status === "completed").length,
    urgent: appointments.filter(a => a.priority === "urgent" || a.priority === "critical").length,
    todayCount: appointments.filter(a => a.appointmentDate === "2024-01-20").length,
    totalRevenue: appointments.filter(a => a.status === "completed" || a.status === "in-progress").reduce((sum, a) => sum + a.estimatedCost, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/automotive")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Service Department
              </h1>
              <p className="text-muted-foreground mt-1">Manage service appointments and repairs</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Service
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.scheduled} scheduled</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently servicing</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Service Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Today's completed/in-progress</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Urgent/Critical</CardTitle>
              <Wrench className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground mt-1">Priority services</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, vehicle, or VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Appointments Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Service Appointments ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead scope="col">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Vehicle</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Service Type</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Description</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Technician</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Est. Cost</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Status</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{apt.customerName}</p>
                          <p className="text-xs text-muted-foreground">{apt.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{apt.vehicleMake} {apt.vehicleModel}</p>
                          <p className="text-xs text-muted-foreground">{apt.vehicleYear}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {apt.serviceType.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm max-w-[200px] truncate">{apt.description}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{apt.appointmentDate}</p>
                          <p className="text-xs text-muted-foreground">{apt.appointmentTime}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{apt.estimatedDuration} min</td>
                      <td className="py-3 px-4 text-sm">{apt.assignedTechnician}</td>
                      <td className="py-3 px-4 font-mono font-semibold">${apt.estimatedCost}</td>
                      <td className="py-3 px-4">
                        <Badge variant={apt.priority === "critical" ? "destructive" : apt.priority === "urgent" ? "secondary" : "outline"} className="capitalize">
                          {apt.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={apt.status === "completed" ? "default" : apt.status === "in-progress" ? "secondary" : apt.status === "cancelled" ? "destructive" : "outline"}>
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/automotive/services/${apt.id}`)}>
                            View
                          </Button>
                          {apt.status === "scheduled" && (
                            <Button variant="outline" size="sm" className="text-blue-600">
                              Check In
                            </Button>
                          )}
                          {apt.status === "check-in" && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              Start
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
