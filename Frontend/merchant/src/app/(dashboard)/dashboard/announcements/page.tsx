"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Input, Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import {
  Spinner as Loader2,
  Megaphone,
  Plus,
  MagnifyingGlass as Search,
  PushPin,
  Eye,
  Users,
  Calendar,
  Trash,
  PencilSimple as Edit,
} from "@phosphor-icons/react/ssr";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high" | "urgent";
  targetType: "all" | "students" | "instructors" | "courses" | "specific";
  targetIds: string[];
  attachmentUrls: string[];
  isPinned: boolean;
  isPublished: boolean;
  publishAt: string;
  expireAt?: string;
  readCount: number;
  createdAt: string;
  createdBy: string;
}

interface AnnouncementsResponse {
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    void loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (priorityFilter !== "all") params.append("priority", priorityFilter);

      const data = await apiJson<AnnouncementsResponse>(
        `/api/education/announcements?${params.toString()}`,
      );
      setAnnouncements(data.data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[ANNOUNCEMENTS_PAGE]", { error: errorMessage });
      setError(errorMessage || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <Megaphone className="w-5 h-5 text-red-600" />;
      case "high": return <Megaphone className="w-5 h-5 text-orange-600" />;
      case "normal": return <Megaphone className="w-5 h-5 text-blue-600" />;
      case "low": return <Megaphone className="w-5 h-5 text-gray-600" />;
      default: return <Megaphone className="w-5 h-5" />;
    }
  };

  const truncateContent = (content: string, length: number = 150) => {
    if (content.length <= length) return content;
    return content.substring(0, length) + "...";
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
            <Megaphone className="w-8 h-8" />
            Announcements
          </h1>
          <p className="text-gray-500 mt-1">
            Publish announcements and updates to students and staff
          </p>
        </div>
        <Link href="/dashboard/announcements/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Announcement
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <Button variant="outline" onClick={() => void loadAnnouncements()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`p-4 hover:shadow-md transition-shadow ${
                announcement.isPinned ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getPriorityIcon(announcement.priority)}
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                    {announcement.isPinned && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <PushPin className="w-3 h-3" />
                        Pinned
                      </Badge>
                    )}
                    {announcement.isPublished ? (
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </div>
                  <p className="text-gray-500 mb-3">
                    {truncateContent(announcement.content)}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(announcement.publishAt), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {announcement.readCount} reads
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Target: {announcement.targetType}
                    </span>
                    {announcement.attachmentUrls.length > 0 && (
                      <span>
                        {announcement.attachmentUrls.length} attachment{announcement.attachmentUrls.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {announcement.expireAt && (
                      <span>
                        Expires: {format(parseISO(announcement.expireAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/announcements/${announcement.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h3 className="font-semibold text-lg">No announcements yet</h3>
            <p className="text-gray-500 mt-1">
              Create your first announcement to communicate with students
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
