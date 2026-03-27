"use client";

import { useState, useRef } from "react";
import { Card, Button, Input, Label, Textarea, Badge, cn } from "@vayva/ui";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { logger } from "@vayva/shared";
import {
  Upload,
  Image,
  Trash2,
  Edit,
  Check,
  X,
  Eye,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Filter,
  Loader2,
} from "lucide-react";

interface Photo {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  status: string;
  createdAt: string;
  stylist?: {
    firstName: string;
    lastName: string;
  };
  metadata?: any;
}

export default function BeautyGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "hair",
    stylistId: "",
    isBeforeAfter: false,
    requiresApproval: true,
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", uploadForm.title || file.name);
      formData.append("description", uploadForm.description);
      formData.append("category", uploadForm.category);
      formData.append("stylistId", uploadForm.stylistId);
      formData.append("isBeforeAfter", uploadForm.isBeforeAfter.toString());
      formData.append("requiresApproval", uploadForm.requiresApproval.toString());

      const response = await fetch("/api/beauty/gallery", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setPhotos([result.data, ...photos]);
        setShowUploadModal(false);
        setUploadForm({
          title: "",
          description: "",
          category: "hair",
          stylistId: "",
          isBeforeAfter: false,
          requiresApproval: true,
        });
      }
    } catch (error) {
      logger.error("[GALLERY_UPLOAD_ERROR]", { error });
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/beauty/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      const result = await response.json();
      if (result.success) {
        setPhotos(photos.map(p => p.id === id ? result.data : p));
        toast.success("Photo approved successfully");
      }
    } catch (error) {
      logger.error("[GALLERY_APPROVE_ERROR]", { error });
      toast.error("Failed to approve photo");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await fetch(`/api/beauty/gallery/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setPhotos(photos.filter(p => p.id !== id));
        toast.success("Photo deleted successfully");
      }
    } catch (error) {
      logger.error("[GALLERY_DELETE_ERROR]", { error });
      toast.error("Failed to delete photo");
    }
  };

  const categories = [
    { value: "hair", label: "Hair" },
    { value: "nails", label: "Nails" },
    { value: "makeup", label: "Makeup" },
    { value: "skincare", label: "Skincare" },
    { value: "lashes", label: "Lashes & Brows" },
    { value: "spa", label: "Spa" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gallery Management</h1>
          <p className="text-gray-700">Manage before/after photos and portfolio</p>
        </div>
        <Button 
          className="accent-gradient"
          onClick={() => setShowUploadModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Photo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-panel p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm">Total Photos</p>
              <p className="text-2xl font-bold text-white">{photos.length}</p>
            </div>
            <Image className="w-8 h-8 text-green-600-primary" />
          </div>
        </Card>
        <Card className="glass-panel p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm">Pending Approval</p>
              <p className="text-2xl font-bold text-amber-500">
                {photos.filter(p => p.status === "pending").length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-amber-500" />
          </div>
        </Card>
        <Card className="glass-panel p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-500">
                {photos.filter(p => p.status === "approved").length}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="glass-panel p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-sm">Total Likes</p>
              <p className="text-2xl font-bold text-pink-500">
                {photos.reduce((acc, p) => acc + (p.metadata?.likes || 0), 0)}
              </p>
            </div>
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-panel p-4 border border-white/10">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
              <Input 
                placeholder="Search photos..." 
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
              <option>All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
              <option>All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <Card key={photo.id} className="glass-panel overflow-hidden border border-white/10 group">
            <div className="relative aspect-square overflow-hidden">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="glass-button"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="glass-button"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="glass-button"
                  onClick={() => handleDelete(photo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {photo.status === "pending" && (
                <Badge variant="warning" className="absolute top-2 right-2">
                  Pending
                </Badge>
              )}
              {photo.status === "approved" && (
                <Badge variant="success" className="absolute top-2 right-2">
                  Approved
                </Badge>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-white truncate">{photo.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>{photo.category}</span>
                {photo.stylist && (
                  <span>{photo.stylist.firstName} {photo.stylist.lastName.charAt(0)}.</span>
                )}
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1 text-pink-500">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{photo.metadata?.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-500">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{photo.metadata?.comments || 0}</span>
                </div>
              </div>
              {photo.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(photo.id)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80  z-50 flex items-center justify-center p-4">
          <Card className="glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Upload Photo</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-button"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-accent-primary/50 transition-colors cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div onClick={() => fileInputRef.current?.click()}>
                  {uploading ? (
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-green-600-primary mb-4" />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-gray-700 mb-4" />
                      <p className="text-white font-medium mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-700 text-sm">
                        PNG, JPG up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="e.g., Blonde Balayage Transformation"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Describe the service and results..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Stylist</Label>
                    <Input
                      value={uploadForm.stylistId}
                      onChange={(e) => setUploadForm({ ...uploadForm, stylistId: e.target.value })}
                      placeholder="Select stylist..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadForm.isBeforeAfter}
                      onChange={(e) => setUploadForm({ ...uploadForm, isBeforeAfter: e.target.checked })}
                      className="rounded bg-white/10 border-white/20"
                    />
                    <span className="text-gray-700">This is a before/after photo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadForm.requiresApproval}
                      onChange={(e) => setUploadForm({ ...uploadForm, requiresApproval: e.target.checked })}
                      className="rounded bg-white/10 border-white/20"
                    />
                    <span className="text-gray-700">Requires approval before publishing</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
