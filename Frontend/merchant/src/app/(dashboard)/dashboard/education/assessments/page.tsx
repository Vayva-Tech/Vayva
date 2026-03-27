/**
 * Education - Assessments Management Page
 * Create and manage quizzes, exams, and student evaluations
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Plus, Clock, CheckCircle } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  courseName: string;
  type: "quiz" | "exam" | "assignment" | "project";
  totalPoints: number;
  duration?: number; // minutes
  dueDate: string;
  status: "draft" | "published" | "completed";
  submissionCount?: number;
}

export default function EducationAssessmentsPage() {
  const router = useRouter();

  const assessments: Assessment[] = [
    { id: "1", title: "Introduction to Python", courseName: "CS101", type: "quiz", totalPoints: 50, duration: 30, dueDate: "2024-01-20", status: "published", submissionCount: 24 },
    { id: "2", title: "Midterm Examination", courseName: "CS101", type: "exam", totalPoints: 200, duration: 120, dueDate: "2024-01-25", status: "published", submissionCount: 18 },
    { id: "3", title: "Data Structures Project", courseName: "CS201", type: "project", totalPoints: 500, dueDate: "2024-02-01", status: "draft" },
    { id: "4", title: "Algorithm Analysis", courseName: "CS201", type: "assignment", totalPoints: 100, dueDate: "2024-01-22", status: "published", submissionCount: 31 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/education")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assessments</h1>
            <p className="text-muted-foreground">Manage quizzes, exams, and assignments</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/education/assessments/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-2xl font-bold">{assessments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{assessments.filter(a => a.status === "published").length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{assessments.filter(a => a.status === "draft").length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{assessments.reduce((sum, a) => sum + (a.submissionCount || 0), 0)}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessments Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{assessment.courseName}</p>
                </div>
                <Badge variant={assessment.status === "published" ? "default" : assessment.status === "completed" ? "secondary" : "outline"}>
                  {assessment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium capitalize">{assessment.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Points:</span>
                  <span className="ml-2 font-medium">{assessment.totalPoints}</span>
                </div>
                {assessment.duration && (
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-medium">{assessment.duration} min</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="ml-2 font-medium">{assessment.dueDate}</span>
                </div>
              </div>
              {assessment.submissionCount !== undefined && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Submissions:</span>
                    <Badge variant="outline">{assessment.submissionCount} submitted</Badge>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/education/assessments/${assessment.id}`)}>
                  Edit
                </Button>
                {assessment.status === "published" && (
                  <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/education/assessments/${assessment.id}/submissions`)}>
                    View Submissions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
