"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, Input, Label, Textarea } from "@vayva/ui";
import { Plus, Folder, ArrowSquareOut as ExternalLink, Trash, Image as ImageIcon } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  images: string[];
  createdAt: string;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create");

      toast.success("Portfolio project created");
      setShowNewModal(false);
      setNewTitle("");
      setNewDescription("");
      fetchProjects();
    } catch {
      toast.error("Failed to create project");
    }
  };

  const deleteProject = (id: string, title: string) => {
    setDeleteConfirm({ id, title });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    try {
      await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-background/50 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-background/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-text-secondary text-sm mt-1">
            Showcase your work and projects
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <Folder className="h-12 w-12 mx-auto text-text-tertiary mb-4" />
          <h3 className="font-medium text-lg">No projects yet</h3>
          <p className="text-text-secondary mt-2 mb-4">
            Create your first portfolio project to showcase your work
          </p>
          <Button onClick={() => setShowNewModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden group">
              {/* Image Preview */}
              <div className="aspect-video bg-background/50 flex items-center justify-center relative">
                {project.images && project.images?.length > 0 ? (
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-text-tertiary" />
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => deleteProject(project.id, project.title)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium truncate">{project.title}</h3>
                {project.description && (
                  <p className="text-text-secondary text-sm mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-text-tertiary">
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/portfolio/${project.slug}`}
                      target="_blank"
                      className="text-primary hover:underline text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Link>
                    <Link
                      href={`/dashboard/portfolio/${project.id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">New Portfolio Project</h2>

            <div>
              <Label className="text-xs">Title *</Label>
              <Input
                value={newTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target?.value)}
                placeholder="Project title"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <Textarea
                value={newDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target?.value)}
                placeholder="Brief description of the project"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowNewModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={createProject} className="flex-1">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Project"
        message={deleteConfirm ? `Delete "${deleteConfirm.title}"? This cannot be undone.` : ""}
      />
    </div>
  );
}
