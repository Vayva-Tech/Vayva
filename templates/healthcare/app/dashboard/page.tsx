"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HeartPulse,
  Users,
  Calendar,
  Clock,
  Pill,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  TestTube,
  DollarSign,
  Timer,
  ChevronRight,
  Plus,
  BarChart3,
  Bell,
  Lock,
  Search,
  Phone,
  Video,
  UserCheck,
  ClipboardList,
} from "lucide-react";

export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalPatients: number;
  appointmentsToday: number;
  currentQueue: number;
  prescriptions: number;
  revenue: number;
  avgWaitTime: number;
}

interface Patient {
  id: string;
  name: string;
  dob: string;
  lastVisit: string;
  condition: string;
  status: "waiting" | "in-room" | "with-provider";
}

interface Appointment {
  id: string;
  time: string;
  patientName: string;
  type: string;
  status: "checked-in" | "in-room" | "waiting" | "completed";
  room?: string;
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  patientName?: string;
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  patientName: string;
  status: "approved" | "pending" | "rejected";
  controlled?: boolean;
}

export default function HealthcareDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 2847,
    appointmentsToday: 42,
    currentQueue: 18,
    prescriptions: 156,
    revenue: 18400,
    avgWaitTime: 12,
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In production, fetch from API endpoints
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sample patients
        setPatients([
          {
            id: "1",
            name: "Maria Garcia",
            dob: "05/12/1968",
            lastVisit: "Today, 08:00 AM",
            condition: "Type 2 Diabetes | Hypertension",
            status: "waiting",
          },
          {
            id: "2",
            name: "James Wilson",
            dob: "08/23/1985",
            lastVisit: "Today, 08:15 AM",
            condition: "Annual Physical",
            status: "in-room",
          },
          {
            id: "3",
            name: "Emily Davis",
            dob: "03/15/1992",
            lastVisit: "6 months ago",
            condition: "Follow-up Consultation",
            status: "waiting",
          },
        ]);

        // Sample appointments
        setAppointments([
          {
            id: "1",
            time: "08:00 AM",
            patientName: "John Smith",
            type: "Annual Physical",
            status: "checked-in",
            room: "Exam 1",
          },
          {
            id: "2",
            time: "08:15 AM",
            patientName: "Emily Davis",
            type: "Follow-up",
            status: "in-room",
            room: "Exam 3",
          },
          {
            id: "3",
            time: "08:30 AM",
            patientName: "Michael Lee",
            type: "Consultation",
            status: "waiting",
            room: "Exam 2",
          },
        ]);

        // Sample alerts
        setAlerts([
          {
            id: "1",
            type: "critical",
            title: "Lab Results - HbA1c High",
            description: "Patient has HbA1c level of 9.2%",
            patientName: "Maria Garcia",
          },
          {
            id: "2",
            type: "warning",
            title: "Allergy Alert",
            description: "Penicillin allergy detected - Amoxicillin prescribed",
            patientName: "James Wilson",
          },
          {
            id: "3",
            type: "info",
            title: "Follow-up Required",
            description: "Post-surgery check due within 7 days",
            patientName: "Susan Chen",
          },
        ]);

        // Sample prescriptions
        setPrescriptions([
          {
            id: "1",
            medication: "Metformin 500mg",
            dosage: "2x daily",
            patientName: "Maria Garcia",
            status: "approved",
          },
          {
            id: "2",
            medication: "Oxycodone 5mg",
            dosage: "As needed",
            patientName: "John Doe",
            status: "pending",
            controlled: true,
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HeartPulse className="h-8 w-8 text-teal-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Healthcare Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  March 11, 2026 | Dr. Sarah Johnson, MD
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="success" className="flex items-center gap-2">
                <Activity className="h-3 w-3" />
                In Clinic
              </Badge>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <Badge variant="info" className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                HIPAA Secure
              </Badge>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold">
                  SJ
                </div>
                <span className="text-sm font-medium">Dr. Johnson</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Practice Overview
                </h2>
                <p className="text-sm text-gray-500">
                  Next: Surgery at 2 PM
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Patient
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Daily Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total Patients */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" />
                PATIENTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalPatients.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  +8.2%
                </span>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 w-3/4"></div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Today */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                APPOINTMENTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.appointmentsToday}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  +12.5%
                </span>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-2/3"></div>
              </div>
            </CardContent>
          </Card>

          {/* Current Queue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                QUEUE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.currentQueue}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Timer className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600 font-medium">
                  Wait: {stats.avgWaitTime}m
                </span>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-1/2 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Pill className="h-4 w-4" />
                PRESCRIPTIONS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.prescriptions}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  +15.3%
                </span>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-3/5"></div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                REVENUE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ${stats.revenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  +9.4%
                </span>
              </div>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-4/5"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Queue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-teal-600" />
                  Patient Queue
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Manage Queue
                  </Button>
                  <Button variant="outline" size="sm">
                    Add Walk-in
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Current Wait Time:{" "}
                <span className="font-semibold text-orange-600">
                  {stats.avgWaitTime} minutes
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Waiting Room */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-green-800 mb-2">
                  🟢 WAITING ROOM (8 patients)
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>1. Maria Garcia - 15 min</span>
                    <Badge variant="outline">Check-in</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>2. James Wilson - 22 min</span>
                    <Badge variant="outline">Check-in</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>3. Susan Chen - 28 min</span>
                    <Badge variant="outline">Check-in</Badge>
                  </div>
                </div>
              </div>

              {/* In Exam */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                  🟡 IN EXAM (6 patients)
                </h4>
                <div className="space-y-2 text-sm">
                  <div>• Exam 1: Maria G. (Dr. Johnson)</div>
                  <div>• Exam 2: Available</div>
                  <div>• Exam 3: Emily D. (Dr. Johnson)</div>
                  <div>• Exam 4: Available</div>
                </div>
              </div>

              {/* With Provider */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-red-800 mb-2">
                  🔴 WITH PROVIDER (4 patients)
                </h4>
                <div className="space-y-2 text-sm">
                  <div>• Dr. Johnson: 3 patients</div>
                  <div>• Dr. Williams: 1 patient</div>
                  <div>• PA Martinez: 2 patients</div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg. Wait:</span>
                  <span className="font-medium">{stats.avgWaitTime} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg. Visit:</span>
                  <span className="font-medium">32 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  Today's Appointments
                </CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Morning Session ({appointments.length} patients)
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {apt.time}
                        </span>
                        <Badge
                          variant={
                            apt.status === "checked-in"
                              ? "success"
                              : apt.status === "in-room"
                              ? "info"
                              : "warning"
                          }
                        >
                          {apt.status === "checked-in" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {apt.status === "in-room" && (
                            <UserCheck className="h-3 w-3 mr-1" />
                          )}
                          {apt.status === "waiting" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {apt.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="mt-1">
                        <p className="font-medium text-gray-900">
                          {apt.patientName}
                        </p>
                        <p className="text-sm text-gray-600">{apt.type}</p>
                      </div>
                      {apt.room && (
                        <p className="text-xs text-gray-500 mt-1">
                          Room: {apt.room}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">No-show Rate:</span>
                  <span className="font-medium text-orange-600">4.8%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">On-time Rate:</span>
                  <span className="font-medium text-green-600">87%</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold mb-2">
                  Provider Availability:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Dr. Johnson: Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span>Dr. Williams: Busy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>PA Martinez: Available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Patient Alerts
                </CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Critical Alerts ({alerts.length})
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-l-4 rounded-lg p-3 ${
                    alert.type === "critical"
                      ? "bg-red-50 border-red-500"
                      : alert.type === "warning"
                      ? "bg-yellow-50 border-yellow-500"
                      : "bg-blue-50 border-blue-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          className={`h-4 w-4 ${
                            alert.type === "critical"
                              ? "text-red-600"
                              : alert.type === "warning"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`}
                        />
                        <span className="font-semibold text-sm uppercase">
                          {alert.type}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mt-1">
                        {alert.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.description}
                      </p>
                      {alert.patientName && (
                        <p className="text-xs text-gray-500 mt-1">
                          Patient: {alert.patientName}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        {alert.type === "critical" && (
                          <Button size="sm" variant="destructive">
                            Call Patient
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prescription Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-teal-600" />
                  Prescription Management
                </CardTitle>
                <Button variant="outline" size="sm">
                  E-Prescribe
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Prescription Requests ({prescriptions.length})
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Approved */}
              <div>
                <h4 className="text-sm font-semibold text-green-600 mb-2">
                  ✅ Approved ({prescriptions.filter((p) => p.status === "approved").length})
                </h4>
                <div className="space-y-2">
                  {prescriptions
                    .filter((p) => p.status === "approved")
                    .map((rx) => (
                      <div
                        key={rx.id}
                        className="flex items-center justify-between text-sm border-b pb-2"
                      >
                        <div>
                          <span className="font-medium">{rx.medication}</span>
                          <span className="text-gray-500 ml-2">
                            {rx.dosage}
                          </span>
                        </div>
                        <span className="text-gray-600">{rx.patientName}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Pending */}
              <div>
                <h4 className="text-sm font-semibold text-orange-600 mb-2">
                  ⏳ Pending Review (
                  {prescriptions.filter((p) => p.status === "pending").length})
                </h4>
                <div className="space-y-2">
                  {prescriptions
                    .filter((p) => p.status === "pending")
                    .map((rx) => (
                      <div
                        key={rx.id}
                        className="border rounded-lg p-2 bg-orange-50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {rx.medication}
                            </p>
                            <p className="text-sm text-gray-600">
                              {rx.dosage} - {rx.patientName}
                            </p>
                            {rx.controlled && (
                              <Badge variant="warning" className="mt-1">
                                ⚠️ Controlled substance
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Reject
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Connected to Surescripts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>PDMP checked</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-600" />
                  Recent Patients
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Search
                  </Button>
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center text-teal-700 font-semibold">
                          {patient.name.split(" ")[0][0]}
                          {patient.name.split(" ")[1]?.[0] || ""}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            DOB: {patient.dob}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {patient.condition}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last Visit: {patient.lastVisit}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">
                          View Chart
                        </Button>
                        <Button size="sm" variant="outline">
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          Labs
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Practice Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                Practice Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Today's Performance
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Patients Seen</span>
                      <span className="font-medium">42/48</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-[87%]"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">RVU Count</span>
                    <span className="font-medium">124.5 / 140</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Collections</span>
                    <span className="font-medium">$18,420</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">A/R</span>
                    <span className="font-medium">$42,500</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Denial Rate</span>
                    <span className="font-medium text-green-600">3.2%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold mb-2">Quality Metrics</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">HbA1c Control</span>
                    <Badge variant="success">78% ✓</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">BP Control</span>
                    <Badge variant="success">82% ✓</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cancer Screening</span>
                    <Badge variant="warning">74% ⚠️</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vaccination</span>
                    <Badge variant="success">91% ✓</Badge>
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Full Analytics Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Panel (Pro Tier) */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              AI Insights
              <Badge variant="info" className="ml-2">Pro Tier</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  💡
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    Risk Alert: 12 patients due for preventive screening this month
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on: Age, history, last screening date
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Recommended: Send automated reminders for mammography, colonoscopy
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Impact: Improve quality metrics, prevent late-stage diagnosis
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      Review List
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Send Reminders
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
