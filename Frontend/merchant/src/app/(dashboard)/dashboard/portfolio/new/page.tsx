"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, Label, Textarea } from "@vayva/ui";
import { CaretLeft as ChevronLeft, Plus } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

export default function NewPortfolioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const createProject = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create");
      }

      const data = await res.json();
      toast.success("Portfolio project created");
      router.push(`/dashboard/portfolio/${data.project.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create project";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/portfolio"
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Portfolio Project</h1>
          <p className="text-gray-700 text-sm">Create a new project showcase</p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <Label className="text-xs">Project Title *</Label>
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Enter project title"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Description</Label>
          <Textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Describe your project..."
            rows={5}
            className="mt-1"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/portfolio")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={createProject}
            disabled={creating || !title.trim()}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creating ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
