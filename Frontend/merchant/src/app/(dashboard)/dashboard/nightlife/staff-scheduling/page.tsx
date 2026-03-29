/**
 * Nightlife - Staff Scheduling Page
 * Manage bartender, server, and security shift schedules
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Clock, Calendar } from "lucide-react";
import { useState } from "react";

interface StaffSchedule {
  id: string;
  name: string;
  role: "bartender" | "server" | "security" | "dj" | "manager" | "host";
  email: string;
  phone: string;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  hourlyRate: number;
  status: "scheduled" | "confirmed" | "cancelled";
}

export default function NightlifeStaffSchedulingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const schedules: StaffSchedule[] = [
    { id: "1", name: "Alex Martinez", role: "bartender", email: "alex@venue.com", phone: "+1 (555) 123-4567", shiftDate: "2024-01-26", shiftStart: "17:00", shiftEnd: "02:00", hourlyRate: 22, status: "confirmed" },
    { id: "2", name: "Jessica Lee", role: "server", email: "jessica@venue.com", phone: "+1 (555) 234-5678", shiftDate: "2024-01-26", shiftStart: "18:00", shiftEnd: "01:00", hourlyRate: 16, status: "confirmed" },
    { id: "3", name: "Marcus Johnson", role: "security", email: "marcus@venue.com", phone: "+1 (555) 345-6789", shiftDate: "2024-01-26", shiftStart: "20:00", shiftEnd: "04:00", hourlyRate: 25, status: "scheduled" },
    { id: "4", name: "DJ Shadow", role: "dj", email: "djshadow@venue.com", phone: "+1 (555) 456-7890", shiftDate: "2024-01-27", shiftStart: "22:00", shiftEnd: "03:00", hourlyRate: 150, status: "confirmed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/nightlife")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Staff Scheduling</h1>
            <p className="text-muted-foreground">Manage employee shifts and schedules</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/nightlife/staff-scheduling/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Shift
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or date..."
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
                <p className="text-sm text-muted-foreground">Total Shifts</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
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
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Labor Cost (Week)</p>
                <p className="text-2xl font-bold">${schedules.reduce((acc, s) => acc + ((new Date(s.shiftEnd).getHours() - new Date(s.shiftStart).getHours()) * s.hourlyRate), 0).toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Staff Members</p>
                <p className="text-2xl font-bold">{new Set(schedules.map(s => s.name)).size}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">Staff Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Role</th>
                  <th className="py-3 px-4 font-medium" scope="col">Contact</th>
                  <th className="py-3 px-4 font-medium" scope="col">Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Shift Time</th>
                  <th className="py-3 px-4 font-medium" scope="col">Rate/Hour</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{schedule.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{schedule.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 text-sm">
                        <p className="truncate max-w-[180px]">{schedule.email}</p>
                        <p className="text-muted-foreground">{schedule.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{schedule.shiftDate}</td>
                    <td className="py-3 px-4 font-medium">
                      {schedule.shiftStart} - {schedule.shiftEnd}
                    </td>
                    <td className="py-3 px-4 font-bold">${schedule.hourlyRate}/hr</td>
                    <td className="py-3 px-4">
                      <Badge variant={schedule.status === "confirmed" ? "default" : schedule.status === "scheduled" ? "secondary" : "outline"}>
                        {schedule.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/nightlife/staff-scheduling/${schedule.id}`)}>
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
