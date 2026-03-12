"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Button, Input, Badge } from "@vayva/ui";
import {
  FileText,
  Plus,
  MagnifyingGlass as Search,
  Users,
  Clock,
  Calendar,
  Spinner as Loader2,
  Pencil,
  Trash,
  Eye,
  CheckCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  maxScore: number;
  submissionType: "file" | "text" | "link" | "quiz";
  allowLateSubmission: boolean;
  submissionsCount: number;
  gradedCount: number;
  isPublished: boolean;
  createdAt: string;
}

interface AssignmentsResponse {
  assignments: Assignment[];
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    void loadAssignments();
  }, [filter, searchQuery]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filter !== "all") params.append("status", filter);

      const data = await apiJson<AssignmentsResponse>(`/api/education/assignments?${params.toString()}`);
      setAssignments(data.assignments || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[ASSIGNMENTS_PAGE]", { error: errorMessage });
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      await apiJson(`/api/education/assignments/${id}`, { method: "DELETE" });
      setAssignments(assignments.filter((a) => a.id !== id));
      toast.success("Assignment deleted");
    } catch (error) {
      toast.error("Failed to delete assignment");
    }
  };

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case "file": return <FileText className="w-4 h-4" />;
      case "quiz": return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <DashboardPageShell
      title="Assignments"
      description="Create and manage student assignments"
      actions={
        <Link href="/dashboard/assignments/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Assignment
          </Button>
        </Link>
      }
    >
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <Input
            placeholder="Search assignments..."
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
          <option value="all">All Assignments</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-text-tertiary mb-4" />
          <h3 className="font-semibold text-lg">No assignments yet</h3>
          <p className="text-text-tertiary mt-1">
            Create your first assignment for students
          </p>
          <Link href="/dashboard/assignments/new">
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getSubmissionTypeIcon(assignment.submissionType)}
                    </div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    {assignment.isPublished ? (
                      <Badge className="bg-success text-text-inverse">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                    {assignment.allowLateSubmission && (
                      <Badge variant="outline">Late submissions OK</Badge>
                    )}
                  </div>

                  <p className="text-sm text-text-tertiary mb-2">
                    Course: {assignment.courseName}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {format(parseISO(assignment.dueDate), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {assignment.submissionsCount} submissions
                    </span>
                    <span>
                      {assignment.gradedCount}/{assignment.submissionsCount} graded
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {assignment.maxScore} points
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/dashboard/assignments/${assignment.id}`}>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/assignments/${assignment.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteAssignment(assignment.id, assignment.title)}
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

