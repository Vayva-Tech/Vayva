"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Button, Input, Badge } from "@vayva/ui";
import {
  BookBookmark,
  Plus,
  MagnifyingGlass,
  Users,
  Clock,
  CheckCircle,
  Spinner,
  Pencil,
  Trash,
  Eye,
  GraduationCap,
  Star,
  TrendUp,
} from "@phosphor-icons/react";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  lessons: number;
  enrolledStudents: number;
  completionRate: number;
  isPublished: boolean;
  thumbnail?: string;
  price?: number;
  createdAt: string;
}

interface CoursesResponse {
  courses: Course[];
  stats: {
    total: number;
    published: number;
    draft: number;
    totalStudents: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    void loadCourses();
  }, [filter, searchQuery]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filter !== "all") params.append("status", filter);

      const data = await apiJson<CoursesResponse>(`/api/education/courses?${params.toString()}`);
      setCourses(data.courses || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[COURSES_PAGE]", { error: errorMessage });
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      await apiJson(`/api/education/courses/${id}`, { method: "DELETE" });
      setCourses(courses.filter((c) => c.id !== id));
      toast.success("Course deleted");
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-50 text-green-700 border-green-200";
      case "intermediate": return "bg-blue-50 text-blue-700 border-blue-200";
      case "advanced": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Calculate metrics for SummaryWidgets
  const publishedCount = courses.filter(c => c.isPublished).length;
  const draftCount = courses.filter(c => !c.isPublished).length;
  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledStudents, 0);
  const avgCompletionRate = courses.length > 0 
    ? (courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length).toFixed(1)
    : "0";

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Courses
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage your curriculum •{" "}
              <span className="font-semibold text-gray-900">{courses.length} courses</span>
            </p>
          </div>
          <Link href="/dashboard/courses/new">
            <Button className="rounded-xl bg-green-600 hover:bg-green-700 font-semibold">
              <Plus size={18} weight="fill" className="mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        <ErrorBoundary serviceName="CoursesDashboard">
          {/* Summary Widgets */}
          <div className="grid grid-cols-4 gap-4">
            <SummaryWidget
              icon={<BookBookmark size={18} weight="fill" />}
              label="Total Courses"
              value={courses.length.toString()}
              trend={`${publishedCount} published`}
              positive={true}
            />
          <SummaryWidget
            icon={<GraduationCap size={18} />}
            label="Total Students"
            value={totalStudents.toLocaleString()}
            trend="Enrolled learners"
            positive={true}
          />
          <SummaryWidget
            icon={<Star size={18} weight="fill" />}
            label="Published"
            value={publishedCount.toString()}
            trend={`${draftCount} drafts`}
            positive={true}
          />
          <SummaryWidget
            icon={<TrendUp size={18} weight="fill" />}
            label="Avg Completion"
            value={`${avgCompletionRate}%`}
            trend="Success rate"
            positive={true}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search courses by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <option value="all">All Courses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size={32} weight="fill" className="animate-spin text-green-600" />
        </div>
      ) : courses.length === 0 ? (
        <Card className="rounded-2xl border border-gray-100 p-12 text-center">
          <BookBookmark size={48} weight="fill" className="mx-auto text-gray-400 mb-4" />
          <h3 className="font-bold text-gray-900 text-lg mb-1">No courses yet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create your first course to start teaching
          </p>
          <Link href="/dashboard/courses/new">
            <Button className="rounded-xl bg-green-600 hover:bg-green-700 font-semibold">
              <Plus size={16} weight="fill" className="mr-2" />
              Create Course
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookBookmark size={24} weight="fill" className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-gray-500">{course.category}</p>
                  </div>
                </div>
                {course.isPublished ? (
                  <Badge className="bg-green-50 text-green-700 border-green-200 font-semibold">Live</Badge>
                ) : (
                  <Badge className="bg-gray-50 text-gray-700 border-gray-200 font-semibold">Draft</Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.description || "No description"}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1.5">
                  <Users size={16} />
                  <span className="font-medium text-gray-900">{course.enrolledStudents}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} />
                  <span className="font-medium text-gray-900">{course.duration} min</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={16} weight="fill" />
                  <span className="font-medium text-gray-900">{course.lessons}</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <Badge className={`font-semibold border ${getLevelColor(course.level)}`}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
                <div className="flex gap-2">
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="rounded-xl font-semibold"
                    >
                      <Eye size={16} weight="fill" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/courses/${course.id}/edit`}>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="rounded-xl font-semibold"
                    >
                      <Pencil size={16} weight="fill" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl font-semibold text-red-600 hover:text-red-700"
                    onClick={() => deleteCourse(course.id, course.title)}
                  >
                    <Trash size={16} weight="fill" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      </ErrorBoundary>
    </div>
  );
}

// ============================================================
// Summary Widget Component
// ============================================================
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
