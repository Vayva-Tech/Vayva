"use client";

import Header from "@/components/Header";
import { Package, Download, Search, Filter, FileImage, FileVideo, FileAudio, FileArchive, ExternalLink, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "All Assets", count: 3421 },
  { name: "3D Models", count: 892 },
  { name: "Textures", count: 1245 },
  { name: "Materials", count: 567 },
  { name: "HDRIs", count: 234 },
  { name: "Sounds", count: 178 },
  { name: "Plugins", count: 89 },
  { name: "Presets", count: 216 },
];

const assets = [
  {
    id: 1,
    title: "Ultimate 3D Asset Pack",
    description: "500+ production-ready 3D models including vehicles, buildings, and props.",
    type: "3d",
    format: "FBX, OBJ, Blender",
    size: "12.4 GB",
    downloads: 8923,
    rating: 4.9,
    price: 149,
    author: "AssetForge Studio",
    tags: ["3D Models", "Game Ready", "PBR"],
    thumbnail: "3d",
  },
  {
    id: 2,
    title: "8K PBR Texture Collection",
    description: "200 high-resolution textures for architectural visualization.",
    type: "texture",
    format: "PNG, EXR",
    size: "45.2 GB",
    downloads: 5432,
    rating: 4.8,
    price: 99,
    author: "Texture Haven",
    tags: ["Textures", "PBR", "8K"],
    thumbnail: "texture",
  },
  {
    id: 3,
    title: "Cinematic Sound Effects",
    description: "1000+ Hollywood-quality sound effects for video production.",
    type: "audio",
    format: "WAV, MP3",
    size: "8.5 GB",
    downloads: 3214,
    rating: 4.9,
    price: 79,
    author: "SoundPro",
    tags: ["Audio", "SFX", "Cinematic"],
    thumbnail: "audio",
  },
  {
    id: 4,
    title: "HDRi Sky Collection",
    description: "50 high-dynamic-range sky images for realistic lighting.",
    type: "hdri",
    format: "HDR, EXR",
    size: "12.8 GB",
    downloads: 4567,
    rating: 4.7,
    price: 59,
    author: "HDRI Hub",
    tags: ["HDRi", "Lighting", "Sky"],
    thumbnail: "hdri",
  },
  {
    id: 5,
    title: "Blender Addon Bundle",
    description: "20 essential Blender addons for faster workflow.",
    type: "plugin",
    format: "Python",
    size: "45 MB",
    downloads: 12345,
    rating: 4.8,
    price: 49,
    author: "Blender Pros",
    tags: ["Plugin", "Blender", "Tools"],
    thumbnail: "plugin",
  },
  {
    id: 6,
    title: "Motion Graphics Presets",
    description: "After Effects presets for titles, transitions, and effects.",
    type: "preset",
    format: "FFX",
    size: "234 MB",
    downloads: 7891,
    rating: 4.9,
    price: 39,
    author: "Motion Design",
    tags: ["Presets", "After Effects", "Motion"],
    thumbnail: "preset",
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "3d": return <FileArchive className="w-8 h-8 text-blue-500" />;
    case "texture": return <FileImage className="w-8 h-8 text-green-500" />;
    case "audio": return <FileAudio className="w-8 h-8 text-purple-500" />;
    case "hdri": return <FileImage className="w-8 h-8 text-orange-500" />;
    case "plugin": return <Package className="w-8 h-8 text-red-500" />;
    case "preset": return <FileVideo className="w-8 h-8 text-yellow-500" />;
    default: return <Package className="w-8 h-8 text-gray-500" />;
  }
};

export default function AssetsPage() {
  const [activeCategory, setActiveCategory] = useState("All Assets");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Assets" }]} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="px-6 py-12 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Asset Library</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Premium 3D models, textures, sounds, and tools to supercharge your creative workflow.
          </p>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">3,421</div>
            <div className="text-gray-500 text-sm">Total Assets</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">150TB</div>
            <div className="text-gray-500 text-sm">Storage Used</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">89</div>
            <div className="text-gray-500 text-sm">Contributors</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">2.1M</div>
            <div className="text-gray-500 text-sm">Downloads</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filters
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

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="card overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
                {getIcon(asset.type)}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{asset.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{asset.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {asset.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{asset.format}</span>
                  <span>{asset.size}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400">by {asset.author}</span>
                  <span className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">★</span>
                    {asset.rating}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xl font-bold text-gray-900">${asset.price}</span>
                    <span className="text-xs text-gray-400 ml-2">{asset.downloads.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary px-3">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
