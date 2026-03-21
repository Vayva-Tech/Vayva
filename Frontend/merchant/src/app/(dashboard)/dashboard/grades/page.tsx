"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Input, Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import {
  Spinner as Loader2,
  ChartBar as GradeIcon,
  Plus,
  MagnifyingGlass as Search,
  Student,
  BookOpen,
  TrendUp,
  Export,
} from "@phosphor-icons/react/ssr";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
  assessmentId?: string;
  gradeItem: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
  weight: number;
  weightedScore?: number;
  notes?: string;
  enteredAt: string;
  studentName?: string;
  courseName?: string;
}

interface GradesResponse {
  data: Grade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentId, setStudentId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");

  useEffect(() => {
    void loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (studentId) params.append("studentId", studentId);
      if (courseId) params.append("courseId", courseId);

      const data = await apiJson<GradesResponse>(
        `/api/education/grades?${params.toString()}`,
      );
      setGrades(data.data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[GRADES_PAGE]", { error: errorMessage });
      setError(errorMessage || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 80) return "bg-blue-100 text-blue-800";
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800";
    if (percentage >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const exportGrades = () => {
    const csv = [
      ["Student", "Course", "Assessment", "Score", "Max", "Percentage", "Grade", "Date"].join(","),
      ...grades.map((g) => [
        g.studentName || g.studentId,
        g.courseName || g.courseId,
        g.gradeItem,
        g.score,
        g.maxScore,
        `${g.percentage.toFixed(1)}%`,
        g.letterGrade || "",
        format(parseISO(g.enteredAt), "yyyy-MM-dd"),
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const stats = {
    total: grades.length,
    avgPercentage: grades.length > 0
      ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
      : 0,
    passing: grades.filter((g) => g.percentage >= 60).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GradeIcon className="w-8 h-8" />
            Grades
          </h1>
          <p className="text-gray-500 mt-1">
            Manage student grades and academic performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportGrades}
            className="flex items-center gap-2"
          >
            <Export className="w-4 h-4" />
            Export
          </Button>
          <Link href="/dashboard/grades/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Grade
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <GradeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Grades</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold">{stats.avgPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Student className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Passing</p>
              <p className="text-2xl font-bold">{stats.passing}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by student or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-40"
          />
          <Input
            placeholder="Course ID"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" onClick={() => void loadGrades()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-3">
          {grades.map((grade) => (
            <Card key={grade.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Student className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {grade.studentName || grade.studentId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {grade.courseName || grade.courseId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {grade.gradeItem}
                    </p>
                    {grade.notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        Note: {grade.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getGradeColor(grade.percentage)}>
                    {grade.score} / {grade.maxScore}
                  </Badge>
                  <p className="text-lg font-bold mt-1">
                    {grade.percentage.toFixed(1)}%
                  </p>
                  {grade.letterGrade && (
                    <p className="text-sm font-medium text-gray-500">
                      Grade: {grade.letterGrade}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Weight: {grade.weight}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(grade.enteredAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {grades.length === 0 && (
          <div className="text-center py-12">
            <GradeIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h3 className="font-semibold text-lg">No grades recorded</h3>
            <p className="text-gray-500 mt-1">
              Start recording grades for your students
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
