"use client";

/**
 * Education Dashboard - Courses Management Page
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, BookOpen, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface Course {
  id: string;
  title: string;
  description?: string;
  instructor: string;
  students: number;
  rating: number;
  price: number;
  status: "active" | "draft" | "archived";
}

export default function EducationCoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Course[] }>("/education/courses?limit=500");
      setCourses(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch courses", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="mt-1 text-gray-600">Create and manage your educational courses</p>
        </div>
        <Button onClick={() => router.push("/dashboard/education/courses/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Search courses..."
          className="w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12"><p className="text-gray-600">Loading courses...</p></div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">{searchTerm ? "Try adjusting your search" : "Create your first course"}</p>
          {!searchTerm && (
            <Button onClick={() => router.push("/dashboard/education/courses/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description?.substring(0, 80) || "No description"}</CardDescription>
                  </div>
                  <Badge variant={course.status === "active" ? "default" : "outline"}>{course.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">Instructor: <span className="font-medium text-gray-900">{course.instructor}</span></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Students</p>
                      <p className="font-semibold">{course.students}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="font-semibold text-green-600">{formatCurrency(course.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-2 border-t">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// API: GET /api/education/courses, POST /api/education/courses
