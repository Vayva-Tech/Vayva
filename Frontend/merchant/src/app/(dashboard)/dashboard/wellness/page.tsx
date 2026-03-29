"use client";

/**
 * Wellness & Fitness Dashboard - Main Page
 * Gym, fitness studio, and wellness center management
 * Theme: Teal to Lime gradient
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Users, TrendingUp, DollarSign, Calendar, Heart, Award, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface DashboardStats {
  totalRevenue: number;
  activeMembers: number;
  totalClasses: number;
  trainerCount: number;
  membershipGrowth: number;
  averageAttendance: number;
  classCapacity: number;
  appointmentsToday: number;
}

interface FitnessClass {
  id: string;
  name: string;
  trainer: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  type: "yoga" | "pilates" | "cardio" | "strength" | "hiit" | "spinning";
}

interface Member {
  id: string;
  name: string;
  membershipType: string;
  joinDate: string;
  status: "active" | "inactive" | "frozen";
  lastVisit: string;
}

export default function WellnessDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchClasses(),
        fetchMembers(),
      ]);
    } catch (error) {
      logger.error("Failed to fetch wellness dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiJson<{ data: DashboardStats }>("/wellness/stats");
      setStats(response.data || null);
    } catch (error) {
      logger.warn("Failed to fetch wellness stats", error);
      setStats(null);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiJson<{ data: FitnessClass[] }>("/wellness/classes?limit=10");
      setClasses(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch classes", error);
      setClasses([]);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiJson<{ data: Member[] }>("/wellness/members?limit=10");
      setMembers(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch members", error);
      setMembers([]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <ErrorBoundary serviceName="WellnessDashboard">
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wellness & Fitness Dashboard</h1>
            <p className="mt-1 text-gray-600">Manage gym, classes, members, and wellness programs</p>
          </div>
          <Button onClick={() => router.push("/dashboard/wellness/members/new")}>
            Add Member
          </Button>
        </div>

        {/* Stats Cards */}
        <ErrorBoundary serviceName="WellnessStatsCards">
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <StatCard title="Total Revenue" value={stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : "N/A"} icon={DollarSign} trend="+18.3%" description="This month" color="green" />
            <StatCard title="Active Members" value={stats?.activeMembers?.toString() || "0"} icon={Users} trend="+14.7%" description="Current" color="teal" />
            <StatCard title="Total Classes" value={stats?.totalClasses?.toString() || "0"} icon={Calendar} description="Scheduled" color="blue" />
            <StatCard title="Trainers" value={stats?.trainerCount?.toString() || "0"} icon={Award} description="On staff" color="purple" />
            <StatCard title="Membership Growth" value={stats?.membershipGrowth ? `${stats.membershipGrowth}%` : "N/A"} icon={TrendingUp} trend="+12.5%" description="MoM" color="orange" />
            <StatCard title="Avg Attendance" value={stats?.averageAttendance?.toString() || "N/A"} icon={Heart} description="Per class" color="red" />
            <StatCard title="Class Capacity" value={stats?.classCapacity ? `${stats.classCapacity}%` : "N/A"} icon={Dumbbell} description="Utilization" color="indigo" />
            <StatCard title="Appointments Today" value={stats?.appointmentsToday?.toString() || "0"} icon={Clock} description="Scheduled" color="cyan" />
          </div>
        </ErrorBoundary>

        {/* Main Content Tabs */}
        <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="trainers">Trainers</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Classes</CardTitle>
                  <CardDescription>Upcoming fitness classes and sessions</CardDescription>
                </div>
                <Button onClick={() => router.push("/dashboard/wellness/classes")}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <EmptyState
                  title="No classes scheduled"
                  description="Create your first fitness class"
                  actionLabel="Schedule Class"
                  onAction={() => router.push("/dashboard/wellness/classes/new")}
                />
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
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.trainer}</TableCell>
                        <TableCell>{new Date(cls.schedule).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{cls.type}</Badge></TableCell>
                        <TableCell>{cls.enrolled} enrolled</TableCell>
                        <TableCell>{cls.capacity} spots</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Members</CardTitle>
                  <CardDescription>Member enrollment and status</CardDescription>
                </div>
                <Button onClick={() => router.push("/dashboard/wellness/members")}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <EmptyState
                  title="No members yet"
                  description="Add members to track memberships"
                  actionLabel="Add Member"
                  onAction={() => router.push("/dashboard/wellness/members/new")}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Visit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.membershipType}</TableCell>
                        <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={member.status === "active" ? "default" : "outline"}>{member.status}</Badge></TableCell>
                        <TableCell>{new Date(member.lastVisit).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Our Trainers</CardTitle>
                  <CardDescription>Fitness instructors and wellness coaches</CardDescription>
                </div>
                <Button onClick={() => router.push("/dashboard/wellness/trainers")}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Trainer directory coming soon</p>
                <Button className="mt-4" onClick={() => router.push("/dashboard/wellness/trainers")}>
                  View Trainer Roster
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

// Sub-components
function StatCard({ title, value, icon: Icon, trend, description, color }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color || "gray"}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 ${trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
            {trend} {description && `• ${description}`}
          </p>
        )}
        {description && !trend && <p className="text-xs text-gray-600 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description, actionLabel, onAction }: any) {
  return (
    <div className="text-center py-12">
      <Dumbbell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-lime-50 p-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-96 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-3 w-20" /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// API INTEGRATION NOTES:
// Required Endpoints:
// - GET /api/wellness/stats - Dashboard statistics
// - GET /api/wellness/members - Membership management
// - GET /api/wellness/classes - Class scheduling
// - GET /api/wellness/trainers - Trainer roster
// - GET /api/wellness/memberships - Membership plans
// - GET /api/wellness/progress - Member progress tracking
// - GET /api/wellness/appointments - Personal training bookings
// - GET /api/wellness/nutrition - Meal planning
// - GET /api/wellness/analytics - Performance analytics
