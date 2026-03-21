"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, Label, Select, Textarea } from "@vayva/ui";
import { CaretLeft, Plus } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

const RESOURCE_TYPES = [
  { value: "service", label: "Service" },
  { value: "campaign", label: "Campaign" },
  { value: "listing", label: "Listing" },
  { value: "course", label: "Course" },
  { value: "post", label: "Post" },
  { value: "stay", label: "Stay" },
  { value: "event", label: "Event" },
  { value: "digital_asset", label: "Digital Asset" },
  { value: "menu_item", label: "Menu Item" },
  { value: "project", label: "Project" },
  { value: "vehicle", label: "Vehicle" },
  { value: "lead", label: "Lead" },
];

export default function NewResourcePage() {
  const router = useRouter();
  const [type, setType] = useState("service");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const createResource = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/resources/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          price: parseFloat(price) || 0,
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create");
      }

      const data = await res.json();
      toast.success("Resource created");
      router.push(`/dashboard/resources/${data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create resource";
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
          href="/dashboard/resources"
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          <CaretLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Resource</h1>
          <p className="text-gray-700 text-sm">Create a new business resource</p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <Label className="text-xs">Resource Type</Label>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label className="text-xs">Name *</Label>
          <Input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Enter resource name"
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Description</Label>
          <Textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Describe this resource..."
            rows={4}
            className="mt-1"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/resources")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={createResource}
            disabled={creating || !name.trim()}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creating ? "Creating..." : "Create Resource"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
