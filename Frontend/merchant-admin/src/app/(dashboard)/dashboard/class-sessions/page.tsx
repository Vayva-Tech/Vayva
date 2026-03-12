"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Input, Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import {
  Spinner as Loader2,
  VideoConference as SessionIcon,
  Plus,
  MagnifyingGlass as Search,
  Calendar,
  Clock,
  Users,
  VideoCamera,
} from "@phosphor-icons/react/ssr";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface ClassSession {
  id: string;
  title: string;
  description?: string;
  sessionType: "live" | "recorded" | "hybrid";
  startTime: string;
  endTime: string;
  timezone: string;
  meetingUrl?: string;
  recordingUrl?: string;
  capacity: number;
  enrolledCount: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  courseId: string;
  instructorId: string;
  createdAt: string;
}

interface SessionsResponse {
  data: ClassSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ClassSessionsPage() {
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    void loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("sessionType", typeFilter);

      const data = await apiJson<SessionsResponse>(
        `/api/education/class-sessions?${params.toString()}`,
      );
      setSessions(data.data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[CLASS_SESSIONS_PAGE]", { error: errorMessage });
      setError(errorMessage || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "live": return <VideoCamera className="w-4 h-4" />;
      case "recorded": return <SessionIcon className="w-4 h-4" />;
      case "hybrid": return <Users className="w-4 h-4" />;
      default: return <SessionIcon className="w-4 h-4" />;
    }
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
            <SessionIcon className="w-8 h-8" />
            Class Sessions
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage live classes, webinars, and recorded sessions
          </p>
        </div>
        <Link href="/dashboard/class-sessions/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Schedule Session
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="live">Live</option>
            <option value="recorded">Recorded</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <Button variant="outline" onClick={() => void loadSessions()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/dashboard/class-sessions/${session.id}`}
              className="block"
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{session.title}</h3>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getTypeIcon(session.sessionType)}
                        {session.sessionType}
                      </Badge>
                    </div>
                    {session.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(session.startTime), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(parseISO(session.startTime), "h:mm a")} -{" "}
                        {format(parseISO(session.endTime), "h:mm a")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.enrolledCount} / {session.capacity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.meetingUrl && (
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <SessionIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No sessions scheduled</h3>
            <p className="text-muted-foreground mt-1">
              Schedule your first class session to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
