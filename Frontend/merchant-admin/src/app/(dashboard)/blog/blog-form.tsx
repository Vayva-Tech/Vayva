"use client";

import { useState } from "react";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { BackButton } from "@/components/ui/BackButton";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/ui/FileUpload";

type BlogFormProps = {
  initialData?: {
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    featuredImage?: string | null;
    status: string;
    metaTitle?: string | null;
    metaDesc?: string | null;
  };
  action: (formData: FormData) => Promise<{ success: boolean; id?: string }>;
  submitLabel: string;
};

export function BlogForm({ initialData, action, submitLabel }: BlogFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const result = await action(formData);
      if (result.success) {
        toast({ title: "Success", description: "Blog post saved." });
        if (!initialData) {
          // Redirect on create
          router.push("/dashboard/blog");
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to save post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <Input type="hidden" name="status" value={status} />
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={initialData?.title}
            required
            placeholder="My Awesome Article"
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={initialData?.slug}
            required
            placeholder="my-awesome-article"
            pattern="^[a-z0-9-]+$"
            title="Lowercase, numbers, and hyphens only."
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            defaultValue={initialData?.excerpt || ""}
            placeholder="Short summary for SEO cards..."
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="content">Content (Markdown supported)</Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={initialData?.content || ""}
            className="min-h-[300px] font-mono"
            placeholder="# Heading\n\nWrite your story here..."
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
        <h3 className="font-medium">Settings</h3>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Cover Image</Label>
          <FileUpload
            value={initialData?.featuredImage || ""}
            onChange={(url: string) => {
              const input = document.getElementById("featuredImage") as HTMLInputElement;
              if (input) input.value = url;
            }}
            purpose="BLOG_COVER"
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            label="Upload Cover Image"
          />
          <Input type="hidden" id="featuredImage" name="featuredImage" defaultValue={initialData?.featuredImage || ""} />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        <BackButton variant="outline" label="Cancel" />
      </div>
    </form>
  );
}
