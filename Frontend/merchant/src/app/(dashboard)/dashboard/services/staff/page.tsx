/**
 * Services Industry - Staff Management Page
 * Manage service professionals, consultants, and team members
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Mail, Phone, Briefcase } from "lucide-react";
import { useState } from "react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  specialization: string;
  hourlyRate: number;
  activeClients: number;
  status: "active" | "inactive" | "on-leave";
}

export default function ServicesStaffPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const staff: StaffMember[] = [
    { id: "1", name: "Alex Thompson", role: "Senior Consultant", email: "alex@services.com", phone: "+1 (555) 123-4567", specialization: "Business Strategy", hourlyRate: 150, activeClients: 8, status: "active" },
    { id: "2", name: "Maria Garcia", role: "Marketing Specialist", email: "maria@services.com", phone: "+1 (555) 234-5678", specialization: "Digital Marketing", hourlyRate: 125, activeClients: 6, status: "active" },
    { id: "3", name: "James Lee", role: "Financial Advisor", email: "james@services.com", phone: "+1 (555) 345-6789", specialization: "Financial Planning", hourlyRate: 175, activeClients: 10, status: "active" },
    { id: "4", name: "Sarah Johnson", role: "HR Consultant", email: "sarah@services.com", phone: "+1 (555) 456-7890", specialization: "Human Resources", hourlyRate: 135, activeClients: 5, status: "on-leave" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/services")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Staff</h1>
            <p className="text-muted-foreground">Manage team members and consultants</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/services/staff/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or specialization..."
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
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{staff.filter(s => s.status === "active").length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{staff.reduce((acc, s) => acc + s.activeClients, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rate/Hour</p>
                <p className="text-2xl font-bold">${(staff.reduce((acc, s) => acc + s.hourlyRate, 0) / staff.length).toFixed(0)}</p>
              </div>
              <Briefcase className="h-8 w-8 text-yellow-600" />
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
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Specialization</th>
                  <th className="py-3 px-4 font-medium">Contact Info</th>
                  <th className="py-3 px-4 font-medium">Hourly Rate</th>
                  <th className="py-3 px-4 font-medium">Active Clients</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{member.name}</td>
                    <td className="py-3 px-4">{member.role}</td>
                    <td className="py-3 px-4 text-sm">{member.specialization}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-blue-600" />
                          <span className="truncate max-w-[180px]">{member.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-green-600" />
                          <span>{member.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold">${member.hourlyRate}/hr</td>
                    <td className="py-3 px-4 font-bold">{member.activeClients}</td>
                    <td className="py-3 px-4">
                      <Badge variant={member.status === "active" ? "default" : member.status === "on-leave" ? "secondary" : "outline"}>
                        {member.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/services/staff/${member.id}`)}>
                        View
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
