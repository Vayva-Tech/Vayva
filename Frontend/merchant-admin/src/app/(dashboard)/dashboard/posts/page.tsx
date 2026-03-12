"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Article, Plus, PencilSimple as Edit, Trash, Eye, EyeSlash, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

  const getStatusBadge = (status: string) => { switch (status) { case "published": return <Badge className="bg-green-600">Published</Badge>; case "draft": return <Badge variant="default">Draft</Badge>; case "archived": return <Badge variant="outline">Archived</Badge>; default: return <Badge variant="default">{status}</Badge>; } };

  return (
    <div className="space-y-6">
      <PageHeader title="Blog Posts" description="Manage content and articles" primaryAction={{ label: "New Post", icon: "Plus", onClick: () => { setEditingPost(null); resetForm(); setIsOpen(true); } }} />
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background"><option value="all">All Status</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
      </div>
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center"><Article className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="font-semibold">No posts yet</h3><p className="text-sm text-muted-foreground mt-1">Create your first blog post.</p><Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New</Button></div>
        ) : (<div className="divide-y">{filteredPosts.map((p) => (<div key={p.id} className="p-4 flex items-start gap-4 hover:bg-muted/50"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Article className="h-5 w-5 text-primary" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold truncate">{p.title}</h3>{getStatusBadge(p.status)}</div><p className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p><div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground"><span>{p.category}</span><span>•</span><span>{p.views} views</span><span>•</span><span>{p.likes} likes</span><span>•</span><span>{new Date(p.createdAt).toLocaleDateString()}</span></div></div><div className="flex items-center gap-1">{p.status === "draft" && (<Button size="sm" variant="ghost" onClick={() => handlePublish(p.id)}><Eye className="h-4 w-4 text-green-600" /></Button>)}<Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm({ id: p.id, title: p.title })}><Trash className="h-4 w-4" /></Button></div></div>))}</div>)}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingPost ? "Edit" : "New"} Post</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Post title" /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Slug</Label><Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="url-friendly-slug" /></div><div className="space-y-2"><Label>Category</Label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Category" /></div></div><div className="space-y-2"><Label>Excerpt</Label><textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" rows={2} /></div><div className="space-y-2"><Label>Content</Label><textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background font-mono text-sm" rows={6} placeholder="Markdown content..." /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="tag1, tag2, tag3" /></div><div className="space-y-2"><Label>Featured Image URL</Label><Input value={formData.featuredImage} onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })} placeholder="https://..." /></div></div><div className="space-y-2"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div></div><DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingPost ? "Update" : "Create"}</Button></DialogFooter></DialogContent></Dialog>
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Post" message={`Delete "${deleteConfirm?.title}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}
