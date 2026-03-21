"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookOpen, Plus, PencilSimple as Edit, Trash, Play, Spinner as Loader2, Clock } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface Lesson {
  id: string;
  title: string;
  description: string;
  courseName: string;
  order: number;
  duration: number;
  type: "video" | "text" | "quiz" | "assignment";
  status: "draft" | "published" | "archived";
  contentUrl?: string;
  allowComments: boolean;
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
}

export default function LessonsPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseName: "",
    order: "",
    duration: "",
    type: "video" as "video" | "text" | "quiz" | "assignment",
    status: "draft" as "draft" | "published" | "archived",
    contentUrl: "",
    allowComments: true,
    prerequisites: "",
  });

  useEffect(() => { void fetchLessons(); }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Lesson[]>("/api/education/lessons");
      setLessons(data || []);
    } catch (error) {
      logger.error("[FETCH_LESSONS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" });
      toast.error("Could not load lessons");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.courseName) {
      return toast.error("Title and course name are required");
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        order: formData.order ? Number(formData.order) : 1,
        duration: formData.duration ? Number(formData.duration) : 0,
        prerequisites: formData.prerequisites.split(",").map(p => p.trim()).filter(Boolean),
      };
      if (editingLesson) {
        await apiJson(`/api/education/lessons/${editingLesson.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Lesson updated");
      } else {
        await apiJson("/api/education/lessons", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Lesson created");
      }
      setIsOpen(false);
      setEditingLesson(null);
      resetForm();
      void fetchLessons();
    } catch (error) {
      toast.error("Failed to save lesson");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/education/lessons/${id}`, { method: "DELETE" });
      toast.success("Lesson deleted");
      setDeleteConfirm(null);
      void fetchLessons();
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiJson(`/api/education/lessons/${id}/publish`, { method: "POST" });
      toast.success("Lesson published");
      void fetchLessons();
    } catch (error) {
      toast.error("Failed to publish");
    }
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      courseName: lesson.courseName,
      order: String(lesson.order),
      duration: String(lesson.duration),
      type: lesson.type,
      status: lesson.status,
      contentUrl: lesson.contentUrl || "",
      allowComments: lesson.allowComments,
      prerequisites: lesson.prerequisites?.join(", ") || "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", courseName: "", order: "", duration: "", type: "video", status: "draft", contentUrl: "", allowComments: true, prerequisites: "" });
  };

  const filteredLessons = lessons.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-600">Published</Badge>;
      case "draft": return <Badge variant="default">Draft</Badge>;
      case "archived": return <Badge variant="outline">Archived</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Course Lessons" description="Manage lessons and course content" primaryAction={{
        label: "New Lesson",
        icon: "Plus",
        onClick: () => { setEditingLesson(null); resetForm(); setIsOpen(true); }
      }} />

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search lessons..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-white">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-white  rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
        ) : filteredLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="font-semibold">No lessons yet</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first course lesson.</p>
            <Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New Lesson</Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="p-4 flex items-start gap-4 hover:bg-gray-100">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-green-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{lesson.title}</h3>
                    {getStatusBadge(lesson.status)}
                    <Badge variant="outline">{lesson.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{lesson.courseName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Lesson {lesson.order}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(lesson.duration)}</span>
                    {lesson.prerequisites.length > 0 && <><span>•</span><span>{lesson.prerequisites.length} prerequisites</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {lesson.status === "draft" && (
                    <Button size="sm" variant="ghost" onClick={() => handlePublish(lesson.id)}><Play className="h-4 w-4 text-green-600" /></Button>
                  )}
                  {lesson.contentUrl && (
                    <Button size="sm" variant="ghost" asChild><a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer"><Play className="h-4 w-4" /></a></Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(lesson)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteConfirm({ id: lesson.id, title: lesson.title })}><Trash className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "New Lesson"}</DialogTitle>
            <DialogDescription>{editingLesson ? "Update lesson details" : "Create a new course lesson"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Lesson title" /></div>
            <div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Lesson description..." className="w-full px-3 py-2 rounded-lg border bg-white" rows={2} /></div>
            <div className="space-y-2"><Label>Course Name *</Label><Input value={formData.courseName} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} placeholder="e.g., Introduction to React" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Order</Label><Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} placeholder="1" /></div>
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="0" /></div>
              <div className="space-y-2"><Label>Type</Label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="video">Video</option><option value="text">Text</option><option value="quiz">Quiz</option><option value="assignment">Assignment</option></select></div>
            </div>
            <div className="space-y-2"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
            <div className="space-y-2"><Label>Content URL</Label><Input value={formData.contentUrl} onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Prerequisites (comma-separated)</Label><Input value={formData.prerequisites} onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })} placeholder="Lesson 1, Lesson 2" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={formData.allowComments} onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })} id="allowComments" /><Label htmlFor="allowComments">Allow comments</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingLesson ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Lesson" message={`Delete lesson "${deleteConfirm?.title}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}

