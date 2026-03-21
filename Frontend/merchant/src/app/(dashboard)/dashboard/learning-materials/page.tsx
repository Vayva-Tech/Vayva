"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Input, Button } from "@vayva/ui";
import { FileText, Video, Headphones, Image, Link as LinkIcon, Plus, MagnifyingGlass as Search, Download, Eye, Tag, BookOpen } from "@phosphor-icons/react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  type: "document" | "video" | "audio" | "image" | "link";
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  fileType?: string;
  accessLevel: "all" | "enrolled" | "premium";
  downloadCount: number;
  viewCount: number;
  tags: string[];
  isPublished: boolean;
  courseId?: string;
  createdAt: string;
  createdBy: string;
}

interface MaterialsResponse {
  data: LearningMaterial[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function LearningMaterialsPage() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");

  useEffect(() => {
    void loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (publishedFilter !== "all") {
        params.append("isPublished", publishedFilter === "published" ? "true" : "false");
      }

      const data = await apiJson<MaterialsResponse>(
        `/api/education/learning-materials?${params.toString()}`,
      );
      setMaterials(data.data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[LEARNING_MATERIALS_PAGE]", { error: errorMessage });
      setError(errorMessage || "Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      case "audio": return <Headphones className="w-5 h-5" />;
      case "image": return <Image className="w-5 h-5" />;
      case "link": return <LinkIcon className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document": return "bg-blue-100 text-blue-800";
      case "video": return "bg-red-100 text-red-800";
      case "audio": return "bg-purple-100 text-purple-800";
      case "image": return "bg-green-100 text-green-800";
      case "link": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Calculate metrics
  const totalMaterials = materials.length;
  const documents = materials.filter(m => m.type === 'document').length;
  const videos = materials.filter(m => m.type === 'video').length;
  const published = materials.filter(m => m.isPublished).length;
  const totalDownloads = materials.reduce((sum, m) => sum + m.downloadCount, 0);
  const totalViews = materials.reduce((sum, m) => sum + m.viewCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Learning Materials</h1>
          <p className="text-sm text-gray-500 mt-1">Educational resources and content library</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          New Material
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <SummaryWidget
          icon={<BookOpen size={18} />}
          label="Total Materials"
          value={String(totalMaterials)}
          trend={`${published} published`}
          positive
        />
        <SummaryWidget
          icon={<FileText size={18} />}
          label="Documents"
          value={String(documents)}
          trend="files"
          positive
        />
        <SummaryWidget
          icon={<Video size={18} />}
          label="Videos"
          value={String(videos)}
          trend="media"
          positive
        />
        <SummaryWidget
          icon={<Eye size={18} />}
          label="Published"
          value={String(published)}
          trend="live"
          positive
        />
        <SummaryWidget
          icon={<Download size={18} />}
          label="Downloads"
          value={String(totalDownloads)}
          trend="total"
          positive
        />
        <SummaryWidget
          icon={<Eye size={18} />}
          label="Views"
          value={String(totalViews)}
          trend="engagement"
          positive
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white border-gray-200"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="image">Images</option>
            <option value="link">Links</option>
          </select>
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.length === 0 ? (
          <div className="col-span-full p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No materials found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first learning material to share educational content.
            </p>
            <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              New Material
            </Button>
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  {getTypeIcon(material.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{material.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{material.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(material.type)}`}>
                  {material.type}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  material.isPublished ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600"
                }`}>
                  {material.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {material.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download size={12} />
                    {material.downloadCount}
                  </span>
                </div>
                <span>{format(parseISO(material.createdAt), 'MMM dd, yyyy')}</span>
              </div>

              {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                  {material.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
