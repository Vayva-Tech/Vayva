"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Button, Input, Badge } from "@vayva/ui";
import {
  BookOpen,
  Plus,
  MagnifyingGlass as Search,
  Users,
  Clock,
  CheckCircle,
  Spinner as Loader2,
  Pencil,
  Trash,
  Eye,
} from "@phosphor-icons/react";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { toast } from "sonner";

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
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardPageShell
      title="Courses"
      description="Create and manage your curriculum"
      actions={
        <Link href="/dashboard/courses/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
        </Link>
      }
    >
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="all">All Courses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-text-tertiary mb-4" />
          <h3 className="font-semibold text-lg">No courses yet</h3>
          <p className="text-text-tertiary mt-1">
            Create your first course to start teaching
          </p>
          <Link href="/dashboard/courses/new">
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-text-tertiary">{course.category}</p>
                  </div>
                </div>
                {course.isPublished ? (
                  <Badge className="bg-success text-text-inverse">Live</Badge>
                ) : (
                  <Badge variant="outline">Draft</Badge>
                )}
              </div>

              <p className="text-sm text-text-tertiary mb-4 line-clamp-2">
                {course.description || "No description"}
              </p>

              <div className="flex items-center gap-4 text-sm text-text-tertiary mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.enrolledStudents}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {course.lessons} lessons
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
                <div className="flex gap-2">
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/courses/${course.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteCourse(course.id, course.title)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardPageShell>
  );
}
