/**
 * Pet Care - Patients Management Page
 * Comprehensive patient records and health tracking
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { logger } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  PawPrint,
  Syringe,
  FileText,
  Calendar,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight?: number;
  color?: string;
  gender: "male" | "female";
  neutered: boolean;
  microchipId?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  lastVisit?: string;
  nextAppointment?: string;
  status: "active" | "inactive" | "critical";
  medicalConditions?: string[];
  allergies?: string[];
  medications?: string[];
}

export default function PetCarePatientsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Patient[] }>("/api/petcare/patients");
      setPatients(response.data || []);
    } catch (error) {
      logger.error("Failed to fetch patients", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = filterSpecies === "all" || patient.species.toLowerCase() === filterSpecies.toLowerCase();
    const matchesStatus = filterStatus === "all" || patient.status === filterStatus;
    return matchesSearch && matchesSpecies && matchesStatus;
  });

  const getSpeciesIcon = (species: string) => {
    if (species.toLowerCase() === "dog") return "🐕";
    if (species.toLowerCase() === "cat") return "🐱";
    if (species.toLowerCase() === "bird") return "🦜";
    if (species.toLowerCase() === "rabbit") return "🐰";
    return "🐾";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "inactive": return "bg-gray-100 text-gray-700";
      case "critical": return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/petcare")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Patients</h1>
            <p className="text-sm text-muted-foreground">Manage patient records and health information</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/petcare/patients/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient or owner name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Species</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="bird">Birds</option>
              <option value="rabbit">Rabbits</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSpeciesIcon(patient.species)}</span>
                  <div>
                    <p className="font-semibold">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.breed}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{patient.age} years</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{patient.gender}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">{patient.ownerName}</p>
                <p className="text-xs text-muted-foreground">{patient.ownerPhone}</p>
              </div>

              {patient.medications && patient.medications.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <Syringe className="h-3 w-3" />
                  <span>{patient.medications.length} medication(s)</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push(`/dashboard/petcare/patients/${patient.id}`)}>
                  <FileText className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/petcare/appointments?patient=${patient.id}`)}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Book
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <PawPrint className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
              <p className="text-muted-foreground mb-4">Add your first patient to get started</p>
              <Button onClick={() => router.push("/dashboard/petcare/patients/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
