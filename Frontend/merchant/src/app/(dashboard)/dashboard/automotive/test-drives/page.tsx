/**
 * Automotive Industry - Test Drive Management Page
 * Schedule and manage vehicle test drives with customers
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Search, Plus, Clock, CheckCircle, Phone } from "lucide-react";
import { useState } from "react";

interface TestDrive {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  date: string;
  time: string;
  duration: number;
  salesperson: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  notes?: string;
  licenseVerified: boolean;
  insuranceVerified: boolean;
}

export default function AutomotiveTestDrivesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const testDrives: TestDrive[] = [
    { id: "1", customerName: "John Smith", customerEmail: "john.smith@email.com", customerPhone: "(555) 123-4567", vehicleMake: "Tesla", vehicleModel: "Model 3", vehicleYear: 2024, date: "2024-01-20", time: "10:00 AM", duration: 30, salesperson: "Mike Johnson", status: "confirmed", notes: "Interested in long-range model", licenseVerified: true, insuranceVerified: true },
    { id: "2", customerName: "Sarah Williams", customerEmail: "sarah.w@email.com", customerPhone: "(555) 234-5678", vehicleMake: "BMW", vehicleModel: "X5", vehicleYear: 2024, date: "2024-01-20", time: "2:00 PM", duration: 45, salesperson: "Lisa Chen", status: "scheduled", licenseVerified: true, insuranceVerified: false },
    { id: "3", customerName: "Michael Brown", customerEmail: "mbrown@email.com", customerPhone: "(555) 345-6789", vehicleMake: "Mercedes-Benz", vehicleModel: "C-Class", vehicleYear: 2023, date: "2024-01-19", time: "11:30 AM", duration: 30, salesperson: "David Park", status: "completed", notes: "Very interested, follow up on financing", licenseVerified: true, insuranceVerified: true },
    { id: "4", customerName: "Emily Davis", customerEmail: "emily.davis@email.com", customerPhone: "(555) 456-7890", vehicleMake: "Audi", vehicleModel: "e-tron GT", vehicleYear: 2024, date: "2024-01-21", time: "1:00 PM", duration: 60, salesperson: "Mike Johnson", status: "scheduled", licenseVerified: false, insuranceVerified: false },
    { id: "5", customerName: "Robert Wilson", customerEmail: "rwilson@email.com", customerPhone: "(555) 567-8901", vehicleMake: "Porsche", vehicleModel: "911 Carrera", vehicleYear: 2024, date: "2024-01-18", time: "3:30 PM", duration: 45, salesperson: "Lisa Chen", status: "no-show", notes: "Did not arrive, rescheduled", licenseVerified: true, insuranceVerified: true },
    { id: "6", customerName: "Jennifer Martinez", customerEmail: "jmartinez@email.com", customerPhone: "(555) 678-9012", vehicleMake: "Ford", vehicleModel: "F-150", vehicleYear: 2024, date: "2024-01-22", time: "9:00 AM", duration: 60, salesperson: "David Park", status: "confirmed", licenseVerified: true, insuranceVerified: true },
    { id: "7", customerName: "David Anderson", customerEmail: "d.anderson@email.com", customerPhone: "(555) 789-0123", vehicleMake: "Toyota", vehicleModel: "RAV4", vehicleYear: 2023, date: "2024-01-17", time: "4:00 PM", duration: 30, salesperson: "Mike Johnson", status: "completed", notes: "Purchased vehicle", licenseVerified: true, insuranceVerified: true },
    { id: "8", customerName: "Lisa Thompson", customerEmail: "lthompson@email.com", customerPhone: "(555) 890-1234", vehicleMake: "Honda", vehicleModel: "Accord", vehicleYear: 2023, date: "2024-01-20", time: "11:00 AM", duration: 30, salesperson: "Lisa Chen", status: "cancelled", notes: "Customer changed mind", licenseVerified: false, insuranceVerified: false },
  ];

  const filteredTestDrives = testDrives.filter(drive =>
    drive.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${drive.vehicleMake} ${drive.vehicleModel}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.salesperson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: testDrives.length,
    scheduled: testDrives.filter(td => td.status === "scheduled").length,
    confirmed: testDrives.filter(td => td.status === "confirmed").length,
    completed: testDrives.filter(td => td.status === "completed").length,
    noShow: testDrives.filter(td => td.status === "no-show").length,
    todayCount: testDrives.filter(td => td.date === "2024-01-20").length,
    conversionRate: ((testDrives.filter(td => td.status === "completed").length / testDrives.length) * 100).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/automotive")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Test Drive Scheduler
              </h1>
              <p className="text-muted-foreground mt-1">Manage customer test drive appointments</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Test Drive
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Drives</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.scheduled + stats.confirmed} upcoming</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to go</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.conversionRate}% conversion rate</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">No-Shows</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.noShow}</div>
              <p className="text-xs text-muted-foreground mt-1">Need follow-up</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer, vehicle, or salesperson..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Drive Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Test Drives ({filteredTestDrives.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead scope="col">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Vehicle</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Salesperson</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Verification</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Status</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTestDrives.map((drive) => (
                    <tr key={drive.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{drive.customerName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{drive.customerPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{drive.vehicleMake} {drive.vehicleModel}</p>
                          <p className="text-xs text-muted-foreground">{drive.vehicleYear}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{drive.date}</p>
                          <p className="text-xs text-muted-foreground">{drive.time}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{drive.duration} min</td>
                      <td className="py-3 px-4 text-sm">{drive.salesperson}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {drive.licenseVerified ? (
                            <Badge variant="default" className="text-xs">License ✓</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-orange-600">License ✗</Badge>
                          )}
                          {drive.insuranceVerified ? (
                            <Badge variant="default" className="text-xs">Insurance ✓</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-orange-600">Insurance ✗</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={drive.status === "confirmed" ? "default" : drive.status === "completed" ? "secondary" : drive.status === "cancelled" || drive.status === "no-show" ? "destructive" : "outline"}>
                          {drive.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/automotive/test-drives/${drive.id}`)}>
                            View
                          </Button>
                          {drive.status === "scheduled" && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              Confirm
                            </Button>
                          )}
                          {drive.status === "confirmed" && (
                            <Button variant="outline" size="sm" className="text-blue-600">
                              Complete
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
