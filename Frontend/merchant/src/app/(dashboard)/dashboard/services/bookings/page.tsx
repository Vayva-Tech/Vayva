/**
 * Services Industry - Bookings Management Page
 * Manage service appointments, bookings, and schedules
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Search, Plus, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Booking {
  id: string;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dateTime: string;
  duration: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  price: number;
  notes?: string;
}

export default function ServicesBookingsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const bookings: Booking[] = [
    { id: "1", serviceName: "Business Consulting Session", clientName: "John Smith", clientEmail: "john@techcorp.com", clientPhone: "+1 (555) 123-4567", dateTime: "2024-01-26 10:00", duration: 60, status: "confirmed", price: 250, notes: "Initial consultation" },
    { id: "2", serviceName: "Marketing Strategy Review", clientName: "Sarah Johnson", clientEmail: "sarah@startupxyz.com", clientPhone: "+1 (555) 234-5678", dateTime: "2024-01-26 14:00", duration: 90, status: "pending", price: 400 },
    { id: "3", serviceName: "Financial Planning", clientName: "Mike Chen", clientEmail: "mike@financeplus.com", clientPhone: "+1 (555) 345-6789", dateTime: "2024-01-25 11:00", duration: 120, status: "completed", price: 500, notes: "Quarterly review" },
    { id: "4", serviceName: "Legal Consultation", clientName: "Emily Davis", clientEmail: "emily@lawfirm.com", clientPhone: "+1 (555) 456-7890", dateTime: "2024-01-27 09:00", duration: 60, status: "confirmed", price: 350 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-muted-foreground">Manage service appointments and schedules</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/services/bookings/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, service, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === "confirmed").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === "pending").length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue (Week)</p>
                <p className="text-2xl font-bold">${bookings.filter(b => b.status === "completed").reduce((acc, b) => acc + b.price, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Service</th>
                  <th className="py-3 px-4 font-medium">Client</th>
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Date/Time</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{booking.serviceName}</td>
                    <td className="py-3 px-4">{booking.clientName}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 text-sm">
                        <p className="truncate max-w-[180px]">{booking.clientEmail}</p>
                        <p className="text-muted-foreground">{booking.clientPhone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{new Date(booking.dateTime).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{booking.duration} min</td>
                    <td className="py-3 px-4 font-bold">${booking.price}</td>
                    <td className="py-3 px-4">
                      <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "pending" ? "secondary" : booking.status === "completed" ? "outline" : "destructive"}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/services/bookings/${booking.id}`)}>
                        Details
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
