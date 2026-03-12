"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Input, Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import {
  Spinner as Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  Calendar,
  Users,
  Export,
} from "@phosphor-icons/react/ssr";
import { format, parseISO } from "date-fns";
import { apiJson } from "@/lib/api-client-shared";

interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: "present" | "absent" | "late" | "excused";
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number;
  notes?: string;
  markedBy: string;
  markedAt: string;
  excuseReason?: string;
  studentName?: string;
  sessionTitle?: string;
}

interface AttendanceResponse {
  data: AttendanceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    void loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sessionId) params.append("sessionId", sessionId);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);

      const data = await apiJson<AttendanceResponse>(
        `/api/education/attendance?${params.toString()}`,
      );
      setRecords(data.data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[ATTENDANCE_PAGE]", { error: errorMessage });
      setError(errorMessage || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "absent": return <XCircle className="w-5 h-5 text-red-500" />;
      case "late": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "excused": return <Check className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800";
      case "absent": return "bg-red-100 text-red-800";
      case "late": return "bg-yellow-100 text-yellow-800";
      case "excused": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const exportAttendance = () => {
    const csv = [
      ["Student", "Session", "Status", "Check In", "Duration", "Notes"].join(","),
      ...records.map((r) => [
        r.studentName || r.studentId,
        r.sessionTitle || r.sessionId,
        r.status,
        r.checkInTime ? format(parseISO(r.checkInTime), "h:mm a") : "",
        r.duration ? `${r.duration} min` : "",
        r.notes || "",
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Attendance
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage student attendance for class sessions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportAttendance}
          className="flex items-center gap-2"
        >
          <Export className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Filter by session ID..."
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          />
          <Button variant="outline" onClick={() => void loadAttendance()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-3">
          {records.map((record) => (
            <Card key={record.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium">
                      {record.studentName || record.studentId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {record.sessionTitle || record.sessionId}
                    </p>
                    {record.excuseReason && (
                      <p className="text-sm text-blue-600">
                        Excuse: {record.excuseReason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(record.status)}>
                    {record.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(record.markedAt), "MMM d, h:mm a")}
                  </p>
                  {record.checkInTime && (
                    <p className="text-sm text-muted-foreground">
                      Checked in: {format(parseISO(record.checkInTime), "h:mm a")}
                    </p>
                  )}
                  {record.duration && (
                    <p className="text-sm text-muted-foreground">
                      Duration: {Math.round(record.duration / 60)} min
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {records.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No attendance records</h3>
            <p className="text-muted-foreground mt-1">
              Start marking attendance for your class sessions
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
