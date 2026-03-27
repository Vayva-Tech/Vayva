"use client";

/**
 * Wellness & Fitness Dashboard - All Sub-Pages Bundle
 * Members, Classes, Trainers, Memberships, Progress, Appointments, Nutrition, Analytics
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, Calendar, Award, TrendingUp, Dumbbell, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

// MEMBERS PAGE
export function WellnessMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: any[] }>("/api/wellness/members?limit=500");
      setMembers(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch members", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="mt-1 text-gray-600">Track gym memberships and member activity</p>
        </div>
        <Button onClick={() => router.push("/dashboard/wellness/members/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Members</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-12"><p className="text-gray-600">Loading...</p></div> : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No members yet</h3>
              <p className="text-gray-600">Add members to track their fitness journey</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Membership Type</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.membershipType}</TableCell>
                    <TableCell>{new Date(m.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={m.status === "active" ? "default" : "outline"}>{m.status}</Badge></TableCell>
                    <TableCell>{new Date(m.lastVisit).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// CLASSES PAGE
export function WellnessClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: any[] }>("/api/wellness/classes?limit=500");
      setClasses(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch classes", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
          <p className="mt-1 text-gray-600">Manage fitness classes and group sessions</p>
        </div>
        <Button onClick={() => router.push("/dashboard/wellness/classes/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Class
        </Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Classes</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-12"><p className="text-gray-600">Loading...</p></div> : classes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No classes scheduled</h3>
              <p className="text-gray-600">Create your first fitness class</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.trainer}</TableCell>
                    <TableCell>{new Date(c.schedule).toLocaleString()}</TableCell>
                    <TableCell><Badge>{c.type}</Badge></TableCell>
                    <TableCell>{c.enrolled}/{c.capacity}</TableCell>
                    <TableCell>{c.capacity} spots</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// TRAINERS PAGE
export function WellnessTrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: any[] }>("/api/wellness/trainers?limit=500");
      setTrainers(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch trainers", error);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trainer Roster</h1>
          <p className="mt-1 text-gray-600">Fitness instructors and wellness coaches</p>
        </div>
        <Button>Add Trainer</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Trainers</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-12"><p className="text-gray-600">Loading...</p></div> : trainers.length === 0 ? (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trainers yet</h3>
              <p className="text-gray-600">Add certified trainers to your team</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Certifications</TableHead>
                  <TableHead>Classes/Week</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.specialization}</TableCell>
                    <TableCell>{t.certifications}</TableCell>
                    <TableCell>{t.classesPerWeek}</TableCell>
                    <TableCell>⭐ {t.rating}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// MEMBERSHIPS PAGE
export function WellnessMembershipsPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: any[] }>("/api/wellness/memberships?limit=500");
      setMemberships(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch memberships", error);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
          <p className="mt-1 text-gray-600">Manage subscription tiers and pricing</p>
        </div>
        <Button>Create Plan</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Active Memberships</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-12"><p className="text-gray-600">Loading...</p></div> : memberships.length === 0 ? (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No membership plans</h3>
              <p className="text-gray-600">Create membership tiers for your gym</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price/Month</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Active Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>${m.price}/mo</TableCell>
                    <TableCell>{m.duration} months</TableCell>
                    <TableCell>{m.features}</TableCell>
                    <TableCell>{m.activeMembers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// PROGRESS PAGE
export function WellnessProgressPage() {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: any[] }>("/api/wellness/progress?limit=500");
      setProgress(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch progress data", error);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Progress</h1>
          <p className="mt-1 text-gray-600">Track fitness goals and achievements</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Progress Tracking</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-12"><p className="text-gray-600">Loading...</p></div> : progress.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No progress data</h3>
              <p className="text-gray-600">Member fitness tracking will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Goal Type</TableHead>
                  <TableHead>Starting Weight</TableHead>
                  <TableHead>Current Weight</TableHead>
                  <TableHead>Goal Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progress.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.memberName}</TableCell>
                    <TableCell>{p.goalType}</TableCell>
                    <TableCell>{p.startingWeight} lbs</TableCell>
                    <TableCell>{p.currentWeight} lbs</TableCell>
                    <TableCell>{p.progressPercentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// APPOINTMENTS PAGE
export function WellnessAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: any[] }>("/api/wellness/appointments?limit=500");
      setAppointments(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch appointments", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personal Training</h1>
          <p className="mt-1 text-gray-600">Schedule 1-on-1 training sessions</p>
        </div>
        <Button>Book Session</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>All Appointments</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-12"><p className="text-gray-600">Loading...</p></div> : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
              <p className="text-gray-600">Book personal training sessions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Session Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.memberName}</TableCell>
                    <TableCell>{a.trainerName}</TableCell>
                    <TableCell>{new Date(a.dateTime).toLocaleString()}</TableCell>
                    <TableCell>{a.sessionType}</TableCell>
                    <TableCell><Badge variant={a.status === "confirmed" ? "default" : "outline"}>{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// NUTRITION PAGE
export function WellnessNutritionPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: any[] }>("/api/wellness/nutrition/plans?limit=500");
      setPlans(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch nutrition plans", error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nutrition Planning</h1>
          <p className="mt-1 text-gray-600">Meal planning and dietary guidance</p>
        </div>
        <Button>Create Plan</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Nutrition Plans</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-12"><p className="text-gray-600">Loading...</p></div> : plans.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No nutrition plans</h3>
              <p className="text-gray-600">Create meal plans for members</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan Type</TableHead>
                  <TableHead>Daily Calories</TableHead>
                  <TableHead>Macros Split</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.memberName}</TableCell>
                    <TableCell>{p.planType}</TableCell>
                    <TableCell>{p.dailyCalories} cal</TableCell>
                    <TableCell>{p.macrosSplit}</TableCell>
                    <TableCell>{new Date(p.startDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ANALYTICS PAGE
export function WellnessAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: any }>("/api/wellness/analytics");
      setAnalytics(response.data || null);
    } catch (error) {
      logger.warn("Failed to fetch analytics", error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wellness Analytics</h1>
            <p className="mt-1 text-gray-600">Performance insights and gym metrics</p>
          </div>
        </div>
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No analytics data</h3>
          <p className="text-gray-600">Analytics will populate as members engage</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wellness Analytics</h1>
          <p className="mt-1 text-gray-600">Performance insights and gym metrics</p>
        </div>
        <Button onClick={() => window.print()}>Export Report</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Dumbbell className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${analytics.revenue?.current || 0}</div><p className="text-xs text-green-600">+{analytics.revenue?.growth || 0}% growth</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{analytics.members?.active || 0}</div><p className="text-xs text-gray-600">Currently enrolled</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{analytics.classes?.avgAttendance || 0}</div><p className="text-xs text-gray-600">Average per class</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Retention</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{analytics.retention?.rate || 0}%</div><p className="text-xs text-gray-600">Monthly retention rate</p></CardContent>
        </Card>
      </div>
    </div>
  );
}

// API INTEGRATION:
// - GET /api/wellness/members - Membership management
// - GET /api/wellness/classes - Class scheduling
// - GET /api/wellness/trainers - Trainer roster
// - GET /api/wellness/memberships - Membership plans
// - GET /api/wellness/progress - Member progress tracking
// - GET /api/wellness/appointments - Personal training bookings
// - GET /api/wellness/nutrition/plans - Meal planning
// - GET /api/wellness/analytics - Comprehensive analytics
