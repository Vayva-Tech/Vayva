/**
 * Education - Enrollments Management Page
 * Manage student course enrollments and registrations
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Search, Plus } from "lucide-react";
import { useState } from "react";

interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseId: string;
  enrollmentDate: string;
  status: "active" | "completed" | "dropped" | "waitlist";
  progress: number;
  paymentStatus: "paid" | "pending" | "refunded";
}

export default function EducationEnrollmentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const enrollments: Enrollment[] = [
    { id: "1", studentName: "John Smith", studentEmail: "john@email.com", courseName: "Python Programming", courseId: "CS101", enrollmentDate: "2024-01-10", status: "active", progress: 65, paymentStatus: "paid" },
    { id: "2", studentName: "Emily Chen", studentEmail: "emily@email.com", courseName: "Data Science", courseId: "CS201", enrollmentDate: "2024-01-08", status: "active", progress: 78, paymentStatus: "paid" },
    { id: "3", studentName: "Mike Wilson", studentEmail: "mike@email.com", courseName: "Web Development", courseId: "CS102", enrollmentDate: "2024-01-12", status: "active", progress: 45, paymentStatus: "pending" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/education")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Enrollments</h1>
            <p className="text-muted-foreground">Manage student course registrations</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Student</th>
                  <th className="py-3 px-4 font-medium">Course</th>
                  <th className="py-3 px-4 font-medium">Enrollment Date</th>
                  <th className="py-3 px-4 font-medium">Progress</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Payment</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{enrollment.studentName}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.studentEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{enrollment.courseName}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.courseId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{enrollment.enrollmentDate}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                        <span className="text-sm">{enrollment.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>{enrollment.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={enrollment.paymentStatus === "paid" ? "default" : "outline"}>{enrollment.paymentStatus}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/education/enrollments/${enrollment.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
