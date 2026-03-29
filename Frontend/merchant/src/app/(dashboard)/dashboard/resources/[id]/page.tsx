"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, Label, Select, Textarea } from "@vayva/ui";
import { CaretLeft, FloppyDisk, Trash } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Resource {
  id: string;
  name: string;
  title: string;
  price: number;
  image: string | null;
  status: string;
  description?: string;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchResource = async () => {
      try {
        // Try to get from list API first
        const res = await fetch("/resources/list?type=service");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const found = data?.find((r: Resource) => r.id === id);
        if (found) {
          setResource(found);
          setName(found.name);
          setPrice(found.price?.toString());
          setDescription(found.description || "");
          setStatus((found as any).status);
        } else {
          toast.error("Resource not found");
          router.push("/dashboard/resources");
        }
      } catch {
        toast.error("Failed to load resource");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResource();
  }, [id, router]);

  const saveResource = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price) || 0,
          description: description.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Resource updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

  const deleteResource = () => {
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Resource deleted");
      router.push("/dashboard/resources");
    } catch {
      toast.error("Failed to delete resource");
    } finally {
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-50 rounded w-1/3" />
          <Card className="h-32 bg-gray-50"><div /></Card>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/resources"
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <CaretLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Edit Resource</h1>
          <p className="text-gray-700 text-sm">{resource.title || resource.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={deleteResource} className="text-red-500">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={saveResource} disabled={saving}>
            <FloppyDisk className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <Label className="text-xs">Name *</Label>
          <Input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target?.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Price</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target?.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Status</Label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target?.value)}
            className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
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
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Resource"
        message="Delete this resource? This cannot be undone."
      />
    </div>
  );
}
