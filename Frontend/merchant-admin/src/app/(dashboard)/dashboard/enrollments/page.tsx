"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Input } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import {
  Spinner as Loader2,
  GraduationCap,
  User,
  Calendar,
  MagnifyingGlass as Search,
} from "@phosphor-icons/react/ssr";
import { format } from "date-fns";

interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  enrolledAt: string;
  status: "active" | "COMPLETED" | "CANCELLED" | "PENDING";
  progress: number;
}

import { apiJson } from "@/lib/api-client-shared";

interface EnrollmentsResponse {
  data: Enrollment[];
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Enrollment[] | EnrollmentsResponse>(
        "/api/education/enrollments",
      );
      const list = Array.isArray(data) ? data : data?.data;
      setEnrollments(Array.isArray(list) ? list : []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_ENROLLMENTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setError(_errMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-success/20 text-success";
      case "COMPLETED":
        return "bg-primary/20 text-primary";
      case "CANCELLED":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-background/30 text-text-primary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Enrollments
          </h1>
          <p className="text-text-tertiary">
            Manage student enrollments and track progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <Input type="text"
              placeholder="Search students or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target?.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:ring-1 focus:ring-text-primary outline-none w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-text-tertiary">Total Enrollments</div>
          <div className="text-2xl font-bold">{enrollments.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-tertiary">Active Students</div>
          <div className="text-2xl font-bold text-success">
            {enrollments.filter((e) => (e as any).status?.toUpperCase() === "ACTIVE").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-tertiary">Completed</div>
          <div className="text-2xl font-bold text-primary">
            {enrollments.filter((e) => (e as any).status === "COMPLETED").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-tertiary">Avg. Progress</div>
          <div className="text-2xl font-bold">
            {enrollments.length > 0
              ? Math.round(
                  enrollments.reduce((sum: number, e) => sum + e.progress, 0) /
                    enrollments.length,
                )
              : 0}
            %
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <h2 className="font-bold">All Enrollments</h2>
        </div>

        {filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="font-bold text-text-primary">No enrollments yet</h3>
            <p className="text-text-tertiary text-sm mt-1">
              {searchQuery
                ? "No results match your search"
                : "Students will appear here when they enroll"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filteredEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="p-4 flex items-center justify-between hover:bg-background/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-background/30 flex items-center justify-center">
                    <User size={18} className="text-text-tertiary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">
                      {enrollment.studentName}
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      {enrollment.studentEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {enrollment.courseName}
                    </p>
                    <p className="text-xs text-text-tertiary flex items-center gap-1">
                      <Calendar size={12} />
                      {format(new Date(enrollment.enrolledAt), "MMM d, yyyy")}
                    </p>
                  </div>

                  <div className="w-24">
                    <div className="text-xs text-text-tertiary mb-1">
                      {enrollment.progress}% complete
                    </div>
                    <div className="h-2 bg-background/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  <Badge className={getStatusColor((enrollment as any).status)}>
                    {enrollment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
