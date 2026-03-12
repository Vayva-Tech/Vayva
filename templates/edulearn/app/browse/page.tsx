"use client";

import Header from "@/components/Header";
import { Search, Filter, Grid3X3, List, Heart, Clock, Users, ChevronRight, Compass } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const categories = [
  { name: "All", count: 156 },
  { name: "3D Design", count: 42 },
  { name: "Animation", count: 38 },
  { name: "Visual Effects", count: 29 },
  { name: "Motion Graphics", count: 24 },
  { name: "Game Design", count: 18 },
  { name: "UI/UX Design", count: 15 },
  { name: "Photography", count: 12 },
  { name: "Audio Production", count: 8 },
];

const featuredCourses = [
  {
    id: 1,
    title: "Blender 3D Masterclass: From Zero to Hero",
    instructor: "Ethan Brantley",
    instructorAvatar: "EB",
    thumbnail: "3d-design",
    category: "3D Design",
    level: "Beginner",
    duration: "24h 30m",
    students: 12450,
    rating: 4.9,
    reviews: 2847,
    price: 49.99,
    originalPrice: 129.99,
    isBestseller: true,
  },
  {
    id: 2,
    title: "Advanced Houdini FX: Pro Workflows",
    instructor: "Marcus Johnson",
    instructorAvatar: "MJ",
    thumbnail: "vfx",
    category: "Visual Effects",
    level: "Advanced",
    duration: "32h 15m",
    students: 3824,
    rating: 4.9,
    reviews: 892,
    price: 79.99,
    originalPrice: 199.99,
    isNew: true,
  },
  {
    id: 3,
    title: "Motion Design in After Effects 2024",
    instructor: "Sarah Chen",
    instructorAvatar: "SC",
    thumbnail: "motion",
    category: "Motion Graphics",
    level: "Intermediate",
    duration: "18h 45m",
    students: 8923,
    rating: 4.8,
    reviews: 1523,
    price: 59.99,
    originalPrice: 149.99,
  },
];

const trendingCourses = [
  {
    id: 4,
    title: "Unreal Engine 5: Complete Game Dev",
    instructor: "Alex Rivera",
    thumbnail: "game",
    category: "Game Design",
    level: "Beginner",
    duration: "45h 00m",
    students: 15234,
    rating: 4.7,
    price: 69.99,
  },
  {
    id: 5,
    title: "Character Animation in Maya",
    instructor: "David Kim",
    thumbnail: "animation",
    category: "Animation",
    level: "Intermediate",
    duration: "28h 20m",
    students: 6234,
    rating: 4.8,
    price: 59.99,
  },
  {
    id: 6,
    title: "Cinema 4D for Motion Designers",
    instructor: "Lisa Park",
    thumbnail: "c4d",
    category: "Motion Graphics",
    level: "Intermediate",
    duration: "15h 30m",
    students: 4521,
    rating: 4.9,
    price: 54.99,
  },
  {
    id: 7,
    title: "Photorealistic Rendering with V-Ray",
    instructor: "James Wilson",
    thumbnail: "render",
    category: "3D Design",
    level: "Advanced",
    duration: "22h 45m",
    students: 3847,
    rating: 4.8,
    price: 64.99,
  },
  {
    id: 8,
    title: "Unity 3D: Mobile Game Development",
    instructor: "Nina Patel",
    thumbnail: "unity",
    category: "Game Design",
    level: "Beginner",
    duration: "36h 00m",
    students: 11234,
    rating: 4.6,
    price: 49.99,
  },
];

export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Browse" }]} />

      {/* Hero Search */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">What do you want to learn today?</h1>
          <p className="text-gray-400 mb-8">Discover 156+ courses from world-class instructors</p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for courses, skills, or instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-white/20"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="text-gray-400 text-sm">Popular:</span>
            {["Blender", "After Effects", "Unreal Engine", "Houdini", "Maya"].map((term) => (
              <button
                key={term}
                className="text-sm text-gray-300 hover:text-white underline underline-offset-2"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.name
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {category.name}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeCategory === category.name
                    ? "bg-white/20"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeCategory === "All" ? "Featured Courses" : `${activeCategory} Courses`}
          </h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
              <option>Most Popular</option>
              <option>Newest</option>
              <option>Highest Rated</option>
              <option>Price: Low to High</option>
            </select>
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredCourses.map((course) => (
            <Link href={`/courses/${course.id}`} key={course.id}>
              <div className="card overflow-hidden hover:shadow-xl transition-all group">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-900">
                  {course.isBestseller && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-md">
                      Bestseller
                    </div>
                  )}
                  {course.isNew && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md">
                      New
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-md">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Compass className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {/* Instructor */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                      {course.instructorAvatar}
                    </div>
                    <span className="text-sm text-gray-600">{course.instructor}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 font-bold">{course.rating}</span>
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-400 text-sm">({course.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">${course.originalPrice}</span>
                      <span className="font-bold text-gray-900">${course.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trending Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Trending Now</h2>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingCourses.map((course) => (
              <Link href={`/courses/${course.id}`} key={course.id}>
                <div className="card p-4 hover:shadow-lg transition-all group">
                  <div className="h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg mb-3 flex items-center justify-center">
                    <Compass className="w-10 h-10 text-white/30" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-gray-700">
                    {course.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">{course.instructor}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.students.toLocaleString()}
                    </span>
                    <span className="font-bold text-gray-900">${course.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Topics You Might Like */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Topics</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "3D Modeling", "Character Design", "Texturing", "Lighting", "Rigging",
              "Visual Effects", "Compositing", "Color Grading", "Motion Tracking",
              "Game Assets", "Level Design", "Shader Programming", "Python Scripting",
              "UI Animation", "Logo Animation", "Typography", "Storyboarding"
            ].map((topic) => (
              <button
                key={topic}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
