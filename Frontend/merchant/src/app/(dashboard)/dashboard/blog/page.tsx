"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Article, Plus, PencilSimple as Edit, Trash, CheckCircle, FileText, Eye, ClockCounterClockwise } from "@phosphor-icons/react";
import { logger } from "@vayva/shared";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

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

  // Calculate metrics
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;
  const draftPosts = posts.filter(p => p.status === 'draft').length;
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-50 text-green-600 border-green-200">Published</Badge>;
      case "draft": return <Badge className="bg-gray-50 text-gray-600 border-gray-200">Draft</Badge>;
      case "scheduled": return <Badge className="bg-orange-50 text-orange-600 border-orange-200">Scheduled</Badge>;
      default: return <Badge className="bg-gray-50 text-gray-600 border-gray-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Button
                  onClick={() => { setEditingPost(null); resetForm(); setIsOpen(true); }}
                  className="bg-green-600 hover:bg-green-700 text-white h-10 rounded-xl font-semibold justify-between"
                >
                  <span>New post</span>
                  <Plus size={18} />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                KPI snapshot
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Published</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {publishedPosts}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Drafts</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {draftPosts}
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      >
        <PageHeader
          title="Blog"
          subtitle="Manage your blog content and articles"
          actions={
            <Button 
              onClick={() => { setEditingPost(null); resetForm(); setIsOpen(true); }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold"
            >
              <Plus size={18} className="mr-2" />
              New Post
            </Button>
          }
        />

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<FileText size={18} />}
          label="Total Posts"
          value={String(totalPosts)}
          trend="articles"
          positive
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Published"
          value={String(publishedPosts)}
          trend="live"
          positive
        />
        <SummaryWidget
          icon={<Edit size={18} />}
          label="Drafts"
          value={String(draftPosts)}
          trend="in progress"
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="Scheduled"
          value={String(scheduledPosts)}
          trend="upcoming"
          positive
        />
        <SummaryWidget
          icon={<Eye size={18} />}
          label="Total Views"
          value={String(totalViews)}
          trend="readership"
          positive
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-gray-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Article size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No blog posts found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first blog post to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(post.status)}
                      <span className="text-xs text-gray-500">{post.category}</span>
                      <span className="text-xs text-gray-500">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Eye size={14} /> {post.views} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {post.status === 'draft' && (
                      <Button 
                        onClick={() => handlePublish(post.id)}
                        variant="outline" 
                        className="border-green-200 text-green-600 hover:bg-green-50 px-3 h-9 rounded-xl font-semibold"
                      >
                        Publish
                      </Button>
                    )}
                    <Button 
                      onClick={() => openEdit(post)}
                      variant="outline" 
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 px-3 h-9 rounded-xl font-semibold"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      onClick={() => setDeleteConfirm({ id: post.id, title: post.title })}
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50 px-3 h-9 rounded-xl font-semibold"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
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
              <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Brief summary..." className="w-full px-3 py-2 rounded-lg border bg-white" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write your post content..." className="w-full px-3 py-2 rounded-lg border bg-white min-h-[200px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., News, Tips" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white">
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
      </PageWithInsights>
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

