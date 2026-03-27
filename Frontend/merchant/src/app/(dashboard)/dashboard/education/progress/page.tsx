/**
 * Education - Progress Tracking Page
 * Monitor student academic progress and performance
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";

interface StudentProgress {
  id: string;
  studentName: string;
  courseId: string;
  courseName: string;
  completionPercentage: number;
  currentGrade: number;
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  lastActivity: string;
  riskLevel: "low" | "medium" | "high";
}

export default function EducationProgressPage() {
  const router = useRouter();

  const progress: StudentProgress[] = [
    { id: "1", studentName: "John Smith", courseId: "CS101", courseName: "Python Programming", completionPercentage: 65, currentGrade: 88, assignmentsSubmitted: 5, assignmentsTotal: 8, lastActivity: "2024-01-15", riskLevel: "low" },
    { id: "2", studentName: "Emily Chen", courseId: "CS201", courseName: "Data Science", completionPercentage: 78, currentGrade: 92, assignmentsSubmitted: 7, assignmentsTotal: 9, lastActivity: "2024-01-16", riskLevel: "low" },
    { id: "3", studentName: "Mike Wilson", courseId: "CS102", courseName: "Web Development", completionPercentage: 45, currentGrade: 72, assignmentsSubmitted: 3, assignmentsTotal: 7, lastActivity: "2024-01-12", riskLevel: "medium" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/education")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Progress Tracking</h1>
            <p className="text-muted-foreground">Monitor student academic performance</p>
          </div>
        </div>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">62%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Grade</p>
                <p className="text-2xl font-bold">84%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-orange-600">1</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-green-600">{progress.filter(p => p.riskLevel === "low").length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Student</th>
                  <th className="py-3 px-4 font-medium">Course</th>
                  <th className="py-3 px-4 font-medium">Completion</th>
                  <th className="py-3 px-4 font-medium">Grade</th>
                  <th className="py-3 px-4 font-medium">Assignments</th>
                  <th className="py-3 px-4 font-medium">Last Activity</th>
                  <th className="py-3 px-4 font-medium">Risk Level</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {progress.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{p.studentName}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{p.courseName}</p>
                        <p className="text-xs text-muted-foreground">{p.courseId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${p.completionPercentage >= 75 ? 'bg-green-500' : p.completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${p.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm">{p.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={p.currentGrade >= 80 ? "default" : "outline"}>{p.currentGrade}%</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{p.assignmentsSubmitted}/{p.assignmentsTotal}</td>
                    <td className="py-3 px-4 text-sm">{p.lastActivity}</td>
                    <td className="py-3 px-4">
                      <Badge variant={p.riskLevel === "low" ? "default" : p.riskLevel === "medium" ? "secondary" : "destructive"}>
                        {p.riskLevel}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/education/progress/${p.id}`)}>
                        Details
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
