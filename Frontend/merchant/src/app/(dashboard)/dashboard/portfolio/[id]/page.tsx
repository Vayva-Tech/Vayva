"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, Label, Textarea } from "@vayva/ui";
import { CaretLeft as ChevronLeft, FloppyDisk as Save, Trash, Image as ImageIcon, Plus } from "@phosphor-icons/react/ssr";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  images: string[];
  createdAt: string;
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch("/api/portfolio");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const found = data.projects?.find((p: PortfolioProject) => p.id === id);
        if (found) {
          setProject(found);
          setTitle(found.title);
          setDescription(found.description || "");
          setImages(found.images || []);
        } else {
          toast.error("Project not found");
          router.push("/dashboard/portfolio");
        }
      } catch {
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id, router]);

  const saveProject = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          images,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Project updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

  const deleteProject = () => {
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Project deleted");
      router.push("/dashboard/portfolio");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleteConfirm(false);
    }
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-50 rounded w-1/3" />
          <div className="h-64 bg-gray-50 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/portfolio"
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-gray-700 text-sm">{project.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={deleteProject} className="text-red-500">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={saveProject} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Form */}
        <Card className="p-6 space-y-4">
          <div>
            <Label className="text-xs">Title *</Label>
            <Input
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target?.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target?.value)}
              rows={5}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Slug</Label>
            <Input value={project.slug} disabled className="mt-1 bg-gray-50" />
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6 space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Project Images
          </h3>

          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewImageUrl(e.target?.value)}
              placeholder="Image URL"
              className="flex-1"
            />
            <Button onClick={addImage} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-video">
                <img
                  src={img}
                  alt={`Project image ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-2 aspect-video bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                No images added
              </div>
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Delete this portfolio project? This cannot be undone."
      />
    </div>
  );
}
