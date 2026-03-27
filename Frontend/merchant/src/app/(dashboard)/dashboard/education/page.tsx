"use client";

/**
 * Education & E-Learning Dashboard - Main Page
 * Comprehensive LMS and course management platform
 * Theme: Green to Yellow gradient
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, TrendingUp, DollarSign, Award, Calendar, Star, PlayCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface DashboardStats {
  totalRevenue: number;
  activeStudents: number;
  totalCourses: number;
  completionRate: number;
  averageGrade: number;
  instructorCount: number;
  enrollmentGrowth: number;
  certificateIssued: number;
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  students: number;
  rating: number;
  price: number;
  status: "active" | "draft" | "archived";
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  completedCourses: number;
  averageGrade: number;
}

export default function EducationDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchCourses(),
        fetchStudents(),
      ]);
    } catch (error) {
      logger.error("Failed to fetch education dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiJson<{ data: DashboardStats }>("/api/education/stats");
      setStats(response.data || null);
    } catch (error) {
      logger.warn("Failed to fetch education stats", error);
      setStats(null);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiJson<{ data: Course[] }>("/api/education/courses?limit=10");
      setCourses(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch courses", error);
      setCourses([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiJson<{ data: Student[] }>("/api/education/students?limit=10");
      setStudents(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch students", error);
      setStudents([]);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Education & E-Learning Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage courses, students, and learning progress</p>
        </div>
        <Button onClick={() => router.push("/dashboard/education/courses/new")}>
          Create Course
        </Button>
      </div>

      {/* Stats Cards */}
      <ErrorBoundary serviceName="EducationStatsCards">
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <StatCard title="Total Revenue" value={stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : "N/A"} icon={DollarSign} trend="+15.2%" description="This month" color="green" />
          <StatCard title="Active Students" value={stats?.activeStudents?.toString() || "0"} icon={Users} trend="+12.5%" description="Current" color="emerald" />
          <StatCard title="Total Courses" value={stats?.totalCourses?.toString() || "0"} icon={BookOpen} description="Available" color="blue" />
          <StatCard title="Completion Rate" value={stats?.completionRate ? `${stats.completionRate}%` : "N/A"} icon={Award} trend="+3.2%" description="Average" color="yellow" />
          <StatCard title="Avg Grade" value={stats?.averageGrade?.toString() || "N/A"} icon={Star} description="Out of 100" color="purple" />
          <StatCard title="Instructors" value={stats?.instructorCount?.toString() || "0"} icon={Users} description="Teaching" color="indigo" />
          <StatCard title="Enrollment Growth" value={stats?.enrollmentGrowth ? `${stats.enrollmentGrowth}%` : "N/A"} icon={TrendingUp} trend="+8.7%" description="MoM" color="orange" />
          <StatCard title="Certificates" value={stats?.certificateIssued?.toString() || "0"} icon={Award} description="Issued" color="teal" />
        </div>
      </ErrorBoundary>

      {/* Main Content Tabs */}
      <ErrorBoundary serviceName="EducationMainContent">
        <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Courses</CardTitle>
                  <CardDescription>Your course catalog and enrollments</CardDescription>
                </div>
                <Button onClick={() => router.push("/dashboard/education/courses")}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <EmptyState
                  title="No courses yet"
                  description="Create your first course to start teaching"
                  actionLabel="Create Course"
                  onAction={() => router.push("/dashboard/education/courses/new")}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.students} enrolled</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(course.price)}</TableCell>
                        <TableCell><Badge variant={course.status === "active" ? "default" : "outline"}>{course.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Students</CardTitle>
                  <CardDescription>Student enrollment and performance</CardDescription>
                </div>
                <Button onClick={() => router.push("/dashboard/education/students")}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <EmptyState
                  title="No students yet"
                  description="Students will appear here when they enroll"
                  actionLabel="Browse Students"
                  onAction={() => router.push("/dashboard/education/students")}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Avg Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.enrolledCourses} courses</TableCell>
                        <TableCell>{student.completedCourses}</TableCell>
                        <TableCell className="font-semibold">{student.averageGrade}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Learning Analytics</CardTitle>
              <CardDescription>Performance insights and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Analytics dashboard coming soon</p>
                <Button className="mt-4" onClick={() => router.push("/dashboard/education/analytics")}>
                  View Full Analytics
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
      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 p-6">
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
// - GET /api/education/stats - Dashboard statistics
// - GET /api/education/courses - Course management
// - GET /api/education/students - Student enrollment
// - GET /api/education/instructors - Instructor management
// - GET /api/education/enrollments - Enrollment tracking
// - GET /api/education/progress - Learning progress
// - GET /api/education/assessments - Quizzes and grades
// - GET /api/education/certificates - Certificate automation
// - GET /api/education/analytics - Course performance
