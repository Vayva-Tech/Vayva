/**
 * Services Industry - Schedule Management Page
 * Manage staff schedules, availability, and time off
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Search, Plus, Clock } from "lucide-react";
import { useState } from "react";

interface Schedule {
  id: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "shift" | "meeting" | "training" | "time-off" | "consultation";
  status: "scheduled" | "confirmed" | "cancelled";
  notes?: string;
}

export default function ServicesSchedulePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const schedules: Schedule[] = [
    { id: "1", staffName: "Alex Thompson", date: "2024-01-26", startTime: "09:00", endTime: "17:00", type: "consultation", status: "confirmed", notes: "Client meetings scheduled" },
    { id: "2", staffName: "Maria Garcia", date: "2024-01-26", startTime: "10:00", endTime: "15:00", type: "shift", status: "confirmed" },
    { id: "3", staffName: "James Lee", date: "2024-01-27", startTime: "08:00", endTime: "12:00", type: "training", status: "scheduled", notes: "Professional development" },
    { id: "4", staffName: "Sarah Johnson", date: "2024-01-29", startTime: "09:00", endTime: "17:00", type: "time-off", status: "approved" as any, notes: "Vacation" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Schedule</h1>
            <p className="text-muted-foreground">Manage staff schedules and availability</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/services/schedule/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by staff, date, or type..."
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
                <p className="text-sm text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
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
                <p className="text-2xl font-bold">{schedules.filter(s => s.status === "confirmed").length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{schedules.filter(s => s.status === "scheduled").length}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Off</p>
                <p className="text-2xl font-bold">{schedules.filter(s => s.type === "time-off").length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
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
                  <th className="py-3 px-4 font-medium">Staff Name</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Time</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Notes</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{schedule.staffName}</td>
                    <td className="py-3 px-4">{new Date(schedule.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{schedule.type.replace("-", " ")}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm truncate max-w-[200px]">{schedule.notes || "-"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={schedule.status === "confirmed" ? "default" : schedule.status === "scheduled" ? "secondary" : "outline"}>
                        {schedule.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/services/schedule/${schedule.id}`)}>
                        Edit
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
