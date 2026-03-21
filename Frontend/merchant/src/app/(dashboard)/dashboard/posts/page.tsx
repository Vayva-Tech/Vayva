"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Article, Plus, PencilSimple as Edit, Trash, Eye, EyeSlash, Star } from "@phosphor-icons/react";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "archived";
  category: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  views: number;
  likes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({ title: "", slug: "", excerpt: "", content: "", status: "draft" as "draft" | "published" | "archived", category: "", tags: "", featuredImage: "" });

  useEffect(() => { void fetchPosts(); }, []);

  const fetchPosts = async () => { try { setLoading(true); const data = await apiJson<Post[]>("/api/posts"); setPosts(data || []); } catch (error) { logger.error("[FETCH_POSTS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" }); toast.error("Could not load posts"); } finally { setLoading(false); } };

  const handleSave = async () => {
    if (!formData.title) return toast.error("Title is required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"), tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean) };
      if (editingPost) { await apiJson(`/api/posts/${editingPost.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast.success("Post updated"); }
      else { await apiJson("/api/posts", { method: "POST", body: JSON.stringify(payload) }); toast.success("Post created"); }
      setIsOpen(false); setEditingPost(null); resetForm(); void fetchPosts();
    } catch { toast.error("Failed to save"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => { try { await apiJson(`/api/posts/${id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteConfirm(null); void fetchPosts(); } catch { toast.error("Failed to delete"); } };
  const handlePublish = async (id: string) => { try { await apiJson(`/api/posts/${id}/publish`, { method: "POST" }); toast.success("Published"); void fetchPosts(); } catch { toast.error("Failed to publish"); } };

  const openEdit = (p: Post) => { setEditingPost(p); setFormData({ title: p.title, slug: p.slug || "", excerpt: p.excerpt || "", content: p.content || "", status: p.status, category: p.category || "", tags: p.tags?.join(", ") || "", featuredImage: p.featuredImage || "" }); setIsOpen(true); };
  const resetForm = () => setFormData({ title: "", slug: "", excerpt: "", content: "", status: "draft", category: "", tags: "", featuredImage: "" });

  const filteredPosts = posts.filter((p) => { const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()); const matchesStatus = statusFilter === "all" || p.status === statusFilter; return matchesSearch && matchesStatus; });

  // Calculate metrics
  const totalPosts = posts.length;
  const published = posts.filter(p => p.status === 'published').length;
  const draft = posts.filter(p => p.status === 'draft').length;
  const archived = posts.filter(p => p.status === 'archived').length;
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage content and articles</p>
        </div>
        <Button onClick={() => { setEditingPost(null); resetForm(); setIsOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          New Post
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <SummaryWidget
          icon={<Article size={18} />}
          label="Total Posts"
          value={String(totalPosts)}
          trend={`${draft} drafts`}
          positive
        />
        <SummaryWidget
          icon={<Eye size={18} />}
          label="Published"
          value={String(published)}
          trend="live now"
          positive
        />
        <SummaryWidget
          icon={<Star size={18} />}
          label="Drafts"
          value={String(draft)}
          trend="unpublished"
          positive={draft === 0}
        />
        <SummaryWidget
          icon={<EyeSlash size={18} />}
          label="Archived"
          value={String(archived)}
          trend="hidden"
          positive
        />
        <SummaryWidget
          icon={<Eye size={18} />}
          label="Total Views"
          value={String(totalViews)}
          trend="all time"
          positive
        />
        <SummaryWidget
          icon={<Star size={18} />}
          label="Total Likes"
          value={String(totalLikes)}
          trend="engagement"
          positive
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-white border-gray-200"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
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
            <h3 className="text-base font-semibold text-gray-900 mb-1">No posts yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first blog post to share with your audience.
            </p>
            <Button onClick={() => { resetForm(); setIsOpen(true); }} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              New Post
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPosts.map((p) => (
              <div key={p.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Article size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.status === 'published'
                            ? "bg-green-50 text-green-600"
                            : p.status === 'draft'
                            ? "bg-gray-50 text-gray-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-medium">{p.category}</span>
                      <span>•</span>
                      <span>{p.views.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{p.likes.toLocaleString()} likes</span>
                      <span>•</span>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === "draft" && (
                      <button
                        onClick={() => handlePublish(p.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Publish"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(p)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: p.id, title: p.title })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Form Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ display: isOpen ? 'flex' : 'none' }}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{editingPost ? "Edit" : "New"} Post</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Title *</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Post title"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Slug</label>
                <input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Category"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                rows={6}
                placeholder="```

```"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tags (comma-separated)</label>
                <input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Featured Image URL</label>
                <input
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end mt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold ml-2"
            >
              {isSubmitting ? "Saving..." : editingPost ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ display: deleteConfirm ? 'flex' : 'none' }}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Post</h2>
          <p className="text-gray-700 mb-4">Delete "{deleteConfirm?.title}"?</p>
          <div className="flex items-center justify-end">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold ml-2"
            >
              Delete
            </button>
          </div>
        </div>
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
