"use client";

import Header from "@/components/Header";
import { FileText, Download, Search, Filter, FileImage, FileVideo, FileAudio, FileArchive, ExternalLink, Star, Clock, ChevronRight } from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "All", count: 1245 },
  { name: "PDF Guides", count: 234 },
  { name: "Video Tutorials", count: 567 },
  { name: "Project Files", count: 189 },
  { name: "Textures", count: 145 },
  { name: "3D Models", count: 78 },
  { name: "Audio", count: 32 },
];

const materials = [
  {
    id: 1,
    title: "Blender 4.0 Complete Hotkey Guide",
    description: "Comprehensive keyboard shortcut reference for Blender 4.0 with customizable keymap.",
    type: "pdf",
    size: "2.4 MB",
    downloads: 8923,
    rating: 4.9,
    author: "Blender Foundation",
    date: "2024-01-15",
    tags: ["Blender", "Reference"],
  },
  {
    id: 2,
    title: "8K PBR Texture Pack - Concrete & Stone",
    description: "50 high-quality concrete and stone textures with normal, roughness, and displacement maps.",
    type: "archive",
    size: "4.8 GB",
    downloads: 3421,
    rating: 4.8,
    author: "Texture Haven",
    date: "2024-02-01",
    tags: ["Textures", "PBR", "Materials"],
  },
  {
    id: 3,
    title: "Maya Character Rig - Base Mesh",
    description: "Production-ready character rig with FK/IK switching, facial controls, and customizable body types.",
    type: "project",
    size: "156 MB",
    downloads: 1234,
    rating: 4.7,
    author: "Animation Mentor",
    date: "2024-01-20",
    tags: ["Maya", "Rigging", "Character"],
  },
  {
    id: 4,
    title: "After Effects Title Animation Templates",
    description: "20 professional title animations with editable text and color controls.",
    type: "project",
    size: "45 MB",
    downloads: 5678,
    rating: 4.9,
    author: "Motion Design School",
    date: "2024-02-10",
    tags: ["After Effects", "Motion Graphics"],
  },
  {
    id: 5,
    title: "Unreal Engine 5 Material Function Library",
    description: "50 reusable material functions for common VFX and environment needs.",
    type: "project",
    size: "89 MB",
    downloads: 2341,
    rating: 4.8,
    author: "Epic Games",
    date: "2024-02-15",
    tags: ["Unreal Engine", "Materials", "Blueprints"],
  },
  {
    id: 6,
    title: "SFX Library - UI & Interface Sounds",
    description: "200 royalty-free interface sounds for apps, games, and interactive media.",
    type: "audio",
    size: "128 MB",
    downloads: 1892,
    rating: 4.6,
    author: "Pro Sound Effects",
    date: "2024-01-25",
    tags: ["Audio", "SFX", "UI"],
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="w-8 h-8 text-red-500" />;
    case "video": return <FileVideo className="w-8 h-8 text-blue-500" />;
    case "audio": return <FileAudio className="w-8 h-8 text-green-500" />;
    case "archive": return <FileArchive className="w-8 h-8 text-yellow-500" />;
    case "project": return <FileImage className="w-8 h-8 text-purple-500" />;
    default: return <FileText className="w-8 h-8 text-gray-500" />;
  }
};

export default function MaterialsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Materials" }]} />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Materials</h1>
          <p className="text-gray-500">Downloadable resources, reference guides, and project files</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">1,245</div>
            <div className="text-gray-500 text-sm">Resources</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">45.2K</div>
            <div className="text-gray-500 text-sm">Downloads</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">89</div>
            <div className="text-gray-500 text-sm">Contributors</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">500GB</div>
            <div className="text-gray-500 text-sm">Total Size</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.name
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category.name}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeCategory === category.name ? "bg-white/20" : "bg-gray-100"
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div key={material.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  {getIcon(material.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{material.title}</h3>
                  <p className="text-xs text-gray-500">by {material.author}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {material.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {material.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {material.downloads.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {material.rating}
                </span>
                <span>{material.size}</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="btn-secondary px-3">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            Have resources to share with the community?
          </p>
          <button className="btn-primary">
            Submit Material
          </button>
        </div>
      </div>
    </div>
  );
}
