/**
 * Education - Students Management Page
 * Manage student records and information
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Plus, Mail } from "lucide-react";
import { useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: number;
  gpa: number;
  totalCredits: number;
  status: "active" | "graduated" | "suspended" | "dropped";
  enrollmentYear: number;
}

export default function EducationStudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const students: Student[] = [
    { id: "1", name: "John Smith", email: "john@email.com", phone: "+1 (555) 123-4567", enrolledCourses: 4, gpa: 3.8, totalCredits: 45, status: "active", enrollmentYear: 2023 },
    { id: "2", name: "Emily Chen", email: "emily@email.com", phone: "+1 (555) 234-5678", enrolledCourses: 5, gpa: 3.9, totalCredits: 52, status: "active", enrollmentYear: 2022 },
    { id: "3", name: "Mike Wilson", email: "mike@email.com", phone: "+1 (555) 345-6789", enrolledCourses: 3, gpa: 3.5, totalCredits: 38, status: "active", enrollmentYear: 2023 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/education")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Students</h1>
            <p className="text-muted-foreground">Manage student records and information</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Class of {student.enrollmentYear}</p>
                </div>
                <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{student.email}</span>
              </div>
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Courses:</span>
                  <span className="font-medium">{student.enrolledCourses}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credits:</span>
                  <span className="font-medium">{student.totalCredits}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">GPA:</span>
                  <Badge variant="outline">{student.gpa.toFixed(2)}</Badge>
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/education/students/${student.id}`)}>
                  View Profile
                </Button>
                <Button size="sm" className="flex-1">
                  Enroll Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
