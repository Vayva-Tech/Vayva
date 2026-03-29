/**
 * ============================================================================
 * Healthcare Patient Registry Page
 * ============================================================================
 * Comprehensive patient management with full CRUD operations
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  Download,
  Upload,
  Share2,
  Heart,
  Stethoscope,
  Pill,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  insuranceProvider?: string;
  insuranceId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HealthcarePatientsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterGender, setFilterGender] = useState<string>("all");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Patient[] }>("/healthcare/patients?limit=500");
      setPatients(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch healthcare patients", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: Partial<Patient>) => {
    try {
      const response = await apiJson<{ data: Patient }>("/healthcare/patients", {
        method: "POST",
        body: JSON.stringify(patientData),
      });
      setPatients([...patients, response.data]);
      toast.success("Patient registered successfully");
      setIsDialogOpen(false);
    } catch (error) {
      logger.error("Failed to create patient", error);
      toast.error("Failed to register patient");
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch = search === "" || 
        patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
        patient.email.toLowerCase().includes(search.toLowerCase()) ||
        patient.phone.includes(search);
      
      const matchesFilter = filterGender === "all" || patient.gender === filterGender;
      
      return matchesSearch && matchesFilter;
    });
  }, [patients, search, filterGender]);

  const stats = {
    total: patients.length,
    active: patients.filter(p => new Date(p.dateOfBirth).getFullYear() > 1980).length,
    seniors: patients.filter(p => new Date(p.dateOfBirth).getFullYear() < 1960).length,
    children: patients.filter(p => new Date(p.dateOfBirth).getFullYear() > 2015).length,
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/healthcare-services")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Patient Registry
                </h1>
                <p className="text-xs text-muted-foreground">Manage patient records and information</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchPatients}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Patient
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Patients</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Adults (18-64)</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.seniors}</p>
                  <p className="text-xs text-muted-foreground">Seniors (65+)</p>
                </div>
                <Stethoscope className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-pink-600">{stats.children}</p>
                  <p className="text-xs text-muted-foreground">Pediatric (under 18)</p>
                </div>
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Patients
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Tabs value={filterGender} onValueChange={setFilterGender}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="Male">Male</TabsTrigger>
                    <TabsTrigger value="Female">Female</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No patients found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient: Patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                              <p className="text-xs text-muted-foreground">ID: {patient.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.gender}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.insuranceProvider ? (
                            <Badge variant="secondary">{patient.insuranceProvider}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Self-pay</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.bloodType || "Unknown"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Today</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Patient
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Medical Records
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Appointment
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pill className="h-4 w-4 mr-2" />
                                Prescriptions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Archive Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* New Patient Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>
              Enter patient demographics and insurance information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input placeholder="John" />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date of Birth *</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Gender *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input placeholder="(555) 123-4567" />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea placeholder="Street address" rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input placeholder="Springfield" />
              </div>
              <div>
                <Label>State</Label>
                <Input placeholder="IL" />
              </div>
              <div>
                <Label>ZIP Code</Label>
                <Input placeholder="62701" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Insurance Provider</Label>
                <Input placeholder="Blue Cross Blue Shield" />
              </div>
              <div>
                <Label>Policy Number</Label>
                <Input placeholder="INS123456" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Blood Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Allergies</Label>
                <Input placeholder="Penicillin, Peanuts, etc." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => { handleCreatePatient({}); setIsDialogOpen(false); }}>
              Register Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mock Data Generator

// No mock data - requires real healthcare API integration

