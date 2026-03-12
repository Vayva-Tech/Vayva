"use client";

import Header from "@/components/Header";
import { Heart, Trash2, ShoppingCart, Clock, Star, BookOpen, ChevronRight, Folder, ExternalLink } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const favorites = [
  {
    id: 1,
    title: "Blender Fundamentals",
    type: "course",
    instructor: "Ethan Brantley",
    thumbnail: "blender",
    progress: 45,
    totalLessons: 24,
    completedLessons: 11,
    duration: "12 hours",
    rating: 4.9,
    price: 89,
    savedAt: "2 days ago",
  },
  {
    id: 2,
    title: "Character Animation in Maya",
    type: "course",
    instructor: "Sarah Chen",
    thumbnail: "maya",
    progress: 0,
    totalLessons: 36,
    completedLessons: 0,
    duration: "18 hours",
    rating: 4.8,
    price: 129,
    savedAt: "1 week ago",
  },
  {
    id: 3,
    title: "V-Ray Lighting Masterclass",
    type: "workshop",
    instructor: "Marcus Johnson",
    thumbnail: "vray",
    date: "Mar 15, 2024",
    duration: "3 hours",
    rating: 4.9,
    price: 149,
    savedAt: "3 days ago",
    spotsLeft: 8,
  },
  {
    id: 4,
    title: "Motion Design Portfolio Template",
    type: "resource",
    format: "After Effects",
    thumbnail: "motion",
    size: "45 MB",
    rating: 4.7,
    downloads: 2341,
    price: 29,
    savedAt: "2 weeks ago",
  },
  {
    id: 5,
    title: "3D Artist Career Program",
    type: "program",
    thumbnail: "program",
    courses: 8,
    duration: "6 months",
    rating: 4.9,
    price: 299,
    originalPrice: 599,
    savedAt: "1 month ago",
  },
];

const collections = [
  { name: "All Favorites", count: 12, icon: Heart },
  { name: "Want to Learn", count: 5, icon: BookOpen },
  { name: "Purchased", count: 3, icon: ShoppingCart },
  { name: "Watch Later", count: 4, icon: Clock },
];

export default function FavoritesPage() {
  const [activeCollection, setActiveCollection] = useState("All Favorites");
  const [items, setItems] = useState(favorites);

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Favorites" }]} />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-500">Courses, workshops, and resources you&apos;ve saved for later</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="card p-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{items.length} items</div>
                  <div className="text-sm text-gray-500">in your library</div>
                </div>
              </div>

              <div className="space-y-1">
                {collections.map((collection) => (
                  <button
                    key={collection.name}
                    onClick={() => setActiveCollection(collection.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                      activeCollection === collection.name
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <collection.icon className="w-4 h-4" />
                      {collection.name}
                    </span>
                    <span className="text-gray-400">{collection.count}</span>
                  </button>
                ))}
              </div>

              <button className="w-full mt-4 p-3 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2">
                <Folder className="w-4 h-4" />
                New Collection
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {items.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-4">
                  Start exploring courses and save the ones you&apos;re interested in.
                </p>
                <Link href="/browse">
                  <button className="btn-primary">Browse Courses</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="card p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Thumbnail */}
                      <div className="w-full md:w-48 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen className="w-12 h-12 text-white/30" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            item.type === "course" ? "bg-blue-100 text-blue-700" :
                            item.type === "workshop" ? "bg-purple-100 text-purple-700" :
                            item.type === "program" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400">Saved {item.savedAt}</span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">
                          {item.type === "resource" ? item.format : `by ${item.instructor}`}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {item.rating}
                          </span>
                          {item.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.duration}
                            </span>
                          )}
                          {item.progress !== undefined && item.progress > 0 && (
                            <span className="text-blue-600">{item.progress}% complete</span>
                          )}
                          {item.spotsLeft && (
                            <span className="text-red-600">{item.spotsLeft} spots left</span>
                          )}
                        </div>

                        {/* Progress bar for courses */}
                        {item.progress !== undefined && item.progress > 0 && (
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          {item.progress !== undefined && item.progress > 0 ? (
                            <button className="btn-primary text-sm">
                              Continue Learning
                            </button>
                          ) : item.type === "workshop" ? (
                            <button className="btn-primary text-sm">
                              Register Now
                            </button>
                          ) : (
                            <button className="btn-primary text-sm">
                              Enroll Now
                            </button>
                          )}
                          <span className="font-semibold text-gray-900">${item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${item.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col items-center md:items-end gap-2">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
