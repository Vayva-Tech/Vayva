"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Article,
  Plus,
  Spinner as Loader2,
  PencilSimple as Edit,
  Trash,
  CheckCircle,
} from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "scheduled";
  category: string;
  tags: string[];
  views: number;
  publishedAt?: string;
}

export default function BlogPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "draft" as "draft" | "published" | "scheduled",
    category: "",
    tags: "",
  });

  useEffect(() => { void fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await apiJson<BlogPost[]>("/api/blog/posts");
      setPosts(data || []);
    } catch (error: unknown) {
      logger.error("[FETCH_BLOG_POSTS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" });
      toast.error("Could not load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title) return toast.error("Title is required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      if (editingPost) {
        await apiJson(`/api/blog/posts/${editingPost.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Post updated");
      } else {
        await apiJson("/api/blog/posts", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Post created");
      }
      setIsOpen(false);
      setEditingPost(null);
      resetForm();
      void fetchPosts();
    } catch (error) {
      toast.error("Failed to save post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/blog/posts/${id}`, { method: "DELETE" });
      toast.success("Post deleted");
      setDeleteConfirm(null);
      void fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiJson(`/api/blog/posts/${id}/publish`, { method: "POST" });
      toast.success("Post published");
      void fetchPosts();
    } catch (error) {
      toast.error("Failed to publish post");
    }
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content || "",
      status: post.status,
      category: post.category || "",
      tags: post.tags?.join(", ") || "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", excerpt: "", content: "", status: "draft", category: "", tags: "" });
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-600">Published</Badge>;
      case "draft": return <Badge variant="default">Draft</Badge>;
      case "scheduled": return <Badge variant="outline">Scheduled</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Posts"
        description="Create and manage your blog content"
        primaryAction={{
          label: "New Post",
          icon: "Plus",
          onClick: () => { setEditingPost(null); resetForm(); setIsOpen(true); }
        }}
      />

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Article className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No posts yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first blog post.</p>
            <Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New Post</Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-4 flex items-start gap-4 hover:bg-muted/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Article className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{post.views} views</span>
                    {post.publishedAt && <><span>•</span><span>{new Date(post.publishedAt).toLocaleDateString()}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {post.status === "draft" && (
                    <Button size="sm" variant="ghost" onClick={() => handlePublish(post.id)}><CheckCircle className="h-4 w-4" /></Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(post)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm({ id: post.id, title: post.title })}><Trash className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "New Post"}</DialogTitle>
            <DialogDescription>{editingPost ? "Update your blog post" : "Create a new blog post"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Post title" />
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Brief summary..." className="w-full px-3 py-2 rounded-lg border bg-background" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write your post content..." className="w-full px-3 py-2 rounded-lg border bg-background min-h-[200px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., News, Tips" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g., business, tips, guide" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingPost ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

