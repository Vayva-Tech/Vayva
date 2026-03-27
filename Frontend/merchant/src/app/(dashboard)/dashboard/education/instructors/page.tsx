/**
 * Education - Instructors Management Page
 * Manage teaching staff and instructor assignments
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, Mail, Star } from "lucide-react";

interface Instructor {
  id: string;
  name: string;
  email: string;
  department: string;
  coursesTeaching: number;
  rating: number;
  totalStudents: number;
  status: "active" | "inactive" | "on-leave";
}

export default function EducationInstructorsPage() {
  const router = useRouter();

  const instructors: Instructor[] = [
    { id: "1", name: "Dr. Sarah Johnson", email: "sarah.j@edu.com", department: "Computer Science", coursesTeaching: 3, rating: 4.8, totalStudents: 245, status: "active" },
    { id: "2", name: "Prof. Michael Brown", email: "michael.b@edu.com", department: "Data Science", coursesTeaching: 2, rating: 4.9, totalStudents: 189, status: "active" },
    { id: "3", name: "Dr. Lisa Anderson", email: "lisa.a@edu.com", department: "Web Development", coursesTeaching: 4, rating: 4.7, totalStudents: 312, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/education")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Instructors</h1>
            <p className="text-muted-foreground">Manage teaching staff and assignments</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Instructor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instructors.map((instructor) => (
          <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{instructor.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{instructor.department}</p>
                </div>
                <Badge variant={instructor.status === "active" ? "default" : "secondary"}>{instructor.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{instructor.email}</span>
              </div>
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Courses:</span>
                  <span className="font-medium">{instructor.coursesTeaching}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Students:</span>
                  <span className="font-medium">{instructor.totalStudents}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{instructor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/education/instructors/${instructor.id}`)}>
                  View Profile
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Assign Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
