"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  Edit,
  Trash2,
  CheckCircle,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatDate } from "@vayva/shared";

interface Volunteer {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  skills?: string[];
  availability?: Record<string, string>;
  emergencyContact?: string;
  status: string;
  totalHours?: number;
  shiftsCompleted?: number;
  rating?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Shift {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  status: string;
  location?: string;
}

export default function VolunteerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const volunteerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (volunteerId) {
      fetchVolunteer();
    }
  }, [volunteerId]);

  const fetchVolunteer = async () => {
    try {
      setLoading(true);
      const [volunteersRes, shiftsRes] = await Promise.all([
        apiJson<{ data: any[] }>("/nonprofit/volunteers"),
        apiJson<{ data: any[] }>(`/api/nonprofit/volunteers/shifts?volunteerId=${volunteerId}`),
      ]);

      const foundVolunteer = volunteersRes.data?.find((v: any) => v.id === volunteerId);
      if (!foundVolunteer) {
        toast.error("Volunteer not found");
        router.push("/dashboard/nonprofit/volunteers");
        return;
      }

      setVolunteer(foundVolunteer);
      setShifts(shiftsRes.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_VOLUNTEER_ERROR]", { error: _errMsg });
      toast.error(_errMsg || "Failed to load volunteer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiJson(`/api/nonprofit/volunteers/${volunteerId}`, { method: "DELETE" });
      toast.success("Volunteer deleted successfully");
      setDeleteConfirmOpen(false);
      router.push("/dashboard/nonprofit/volunteers");
    } catch (error: unknown) {
      logger.error("[DELETE_VOLUNTEER_ERROR]", { error });
      toast.error("Failed to delete volunteer");
    }
  };

  const handleEmailVolunteer = () => {
    window.open(`mailto:${volunteer?.email}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!volunteer) {
    return null;
  }

  const fullName = `${volunteer.firstName || ""} ${volunteer.lastName || ""}`.trim() || "Unnamed Volunteer";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={volunteer.status === "active" ? "bg-green-500" : "bg-gray-500"}>
                  {volunteer.status.toUpperCase()}
                </Badge>
                {volunteer.rating && volunteer.rating >= 4.5 && (
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                    Top Volunteer
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEmailVolunteer}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-red-500"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteer.totalHours || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Hours volunteered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shifts Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteer.shiftsCompleted || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Assignments finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteer.rating ? `${volunteer.rating}/5` : "—"}</div>
            <p className="text-xs text-gray-500 mt-1">Performance rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joined</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(volunteer.createdAt)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Volunteer since</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="shifts">Shift History</TabsTrigger>
          <TabsTrigger value="skills">Skills & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${volunteer.email}`} className="text-blue-600 hover:underline">
                    {volunteer.email}
                  </a>
                </div>
                {volunteer.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${volunteer.phone}`} className="text-blue-600 hover:underline">
                      {volunteer.phone}
                    </a>
                  </div>
                )}
                {volunteer.emergencyContact && (
                  <div>
                    <p className="text-sm text-gray-500">Emergency Contact</p>
                    <p className="font-medium">{volunteer.emergencyContact}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {volunteer.availability && Object.keys(volunteer.availability).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(volunteer.availability).map(([day, time]) => (
                    <div key={day} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="font-semibold capitalize text-sm">{day}</p>
                      <p className="text-xs text-blue-700 mt-1">{time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shift History ({shifts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {shifts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No shifts assigned yet</p>
                  <Button className="mt-4" onClick={() => router.push("/dashboard/nonprofit/volunteers/schedule")}>
                    Assign Shift
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {shifts.map((shift) => (
                    <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{shift.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(shift.date)} • {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{shift.hours}h</Badge>
                        <Badge className={shift.status === "completed" ? "bg-green-500" : "bg-blue-500"}>
                          {shift.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          {volunteer.skills && volunteer.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills.map((skill, i) => (
                    <Badge key={i} className="capitalize bg-blue-500">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {volunteer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  {volunteer.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {volunteer.tags && volunteer.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {volunteer.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Volunteer"
        message={`Are you sure you want to delete "${fullName}"? This will remove all volunteer data and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
