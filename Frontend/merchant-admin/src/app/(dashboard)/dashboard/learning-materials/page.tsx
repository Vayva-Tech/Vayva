"use client";

import { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { Card, Input, Button } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import {
  Spinner as Loader2,
  FileText,
  Video,
  Headphones,
  Image,
  Link as LinkIcon,
  Plus,
  MagnifyingGlass as Search,
  Download,
  Eye,
  Tag,
} from "@phosphor-icons/react/ssr";
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
            <FileText className="w-8 h-8" />
            Learning Materials
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage course content, documents, videos, and resources
          </p>
        </div>
        <Link href="/dashboard/learning-materials/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Material
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
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
            <option value="document">Document</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="image">Image</option>
            <option value="link">Link</option>
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
          <Button variant="outline" onClick={() => void loadMaterials()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(material.type)}
                    <h3 className="font-semibold text-lg">{material.title}</h3>
                    <Badge className={getTypeColor(material.type)}>
                      {material.type}
                    </Badge>
                    {material.isPublished ? (
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                    <Badge variant="outline">{material.accessLevel} access</Badge>
                  </div>
                  {material.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {material.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {material.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {material.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {material.downloadCount} downloads
                    </span>
                    {material.fileSize && (
                      <span>{formatFileSize(material.fileSize)}</span>
                    )}
                    <span>
                      Added {format(parseISO(material.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {material.fileUrl && (
                    <a
                      href={material.fileUrl}
                      download
                      className="text-primary hover:underline text-sm"
                    >
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </a>
                  )}
                  {material.externalUrl && (
                    <a
                      href={material.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      <Button variant="outline" size="sm">
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                    </a>
                  )}
                  <Link href={`/dashboard/learning-materials/${material.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {materials.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No materials found</h3>
            <p className="text-muted-foreground mt-1">
              Add your first learning material to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
