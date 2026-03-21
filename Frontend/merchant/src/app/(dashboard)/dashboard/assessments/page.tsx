"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Input, Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import {
  Spinner as Loader2,
  Exam as AssessmentIcon,
  Plus,
  MagnifyingGlass as Search,
  Calendar,
  Timer,
  CheckCircle,
  FileText,
  ListChecks as Quiz,
  TreeStructure as ProjectDiagram,
  Presentation,
} from "@phosphor-icons/react/ssr";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: "quiz" | "exam" | "assignment" | "project" | "presentation";
  courseId: string;
  instructorId: string;
  maxScore: number;
  passingScore: number;
  weight: number;
  dueDate?: string;
  timeLimit?: number;
  maxAttempts: number;
  isPublished: boolean;
  allowLateSubmission: boolean;
  createdAt: string;
}

interface AssessmentsResponse {
  data: Assessment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");

  useEffect(() => {
    void loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (publishedFilter !== "all") {
        params.append("isPublished", publishedFilter === "published" ? "true" : "false");
      }

      const data = await apiJson<AssessmentsResponse>(
        `/api/education/assessments?${params.toString()}`,
      );
      setAssessments(data.data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[ASSESSMENTS_PAGE]", { error: errorMessage });
      setError(errorMessage || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quiz": return <Quiz className="w-5 h-5" />;
      case "exam": return <AssessmentIcon className="w-5 h-5" />;
      case "assignment": return <FileText className="w-5 h-5" />;
      case "project": return <ProjectDiagram className="w-5 h-5" />;
      case "presentation": return <Presentation className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "quiz": return "bg-purple-100 text-purple-800";
      case "exam": return "bg-red-100 text-red-800";
      case "assignment": return "bg-blue-100 text-blue-800";
      case "project": return "bg-green-100 text-green-800";
      case "presentation": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
            <AssessmentIcon className="w-8 h-8" />
            Assessments
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage quizzes, exams, assignments, and projects
          </p>
        </div>
        <Link href="/dashboard/assessments/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Assessment
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="assignment">Assignment</option>
            <option value="project">Project</option>
            <option value="presentation">Presentation</option>
          </select>
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <Button variant="outline" onClick={() => void loadAssessments()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/dashboard/assessments/${assessment.id}`}
              className="block"
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(assessment.type)}
                      <h3 className="font-semibold text-lg">{assessment.title}</h3>
                      <Badge className={getTypeColor(assessment.type)}>
                        {assessment.type}
                      </Badge>
                      {assessment.isPublished ? (
                        <Badge className="bg-green-100 text-green-800">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                    {assessment.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {assessment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {assessment.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: {format(parseISO(assessment.dueDate), "MMM d, yyyy")}
                        </span>
                      )}
                      {assessment.timeLimit && (
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {assessment.timeLimit} min
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {assessment.maxScore} points
                      </span>
                      <span>
                        {assessment.maxAttempts} attempt{assessment.maxAttempts !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Passing: {assessment.passingScore}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Weight: {assessment.weight}%
                    </p>
                    {assessment.allowLateSubmission && (
                      <Badge variant="outline" className="mt-2">
                        Late submissions allowed
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {assessments.length === 0 && (
          <div className="text-center py-12">
            <AssessmentIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h3 className="font-semibold text-lg">No assessments found</h3>
            <p className="text-gray-500 mt-1">
              Create your first assessment to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
