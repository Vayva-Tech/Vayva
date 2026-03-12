"use client";

import Header from "@/components/Header";
import { Search, Filter, Clock, Users, Star, Play } from "lucide-react";

const categories = ["All", "3D Design", "Animation", "Visual Effects", "Motion Graphics", "Game Design"];

const courses = [
  {
    id: 1,
    title: "Blender 3D Fundamentals",
    instructor: "Ethan Brantley",
    duration: "12h 30m",
    students: 1240,
    rating: 4.9,
    level: "Beginner",
    image: "blender",
    category: "3D Design",
  },
  {
    id: 2,
    title: "Advanced Cinema 4D Techniques",
    instructor: "Sarah Chen",
    duration: "18h 45m",
    students: 856,
    rating: 4.8,
    level: "Advanced",
    image: "c4d",
    category: "Motion Graphics",
  },
  {
    id: 3,
    title: "Houdini for Visual Effects",
    instructor: "Marcus Johnson",
    duration: "24h 00m",
    students: 623,
    rating: 4.9,
    level: "Advanced",
    image: "houdini",
    category: "Visual Effects",
  },
  {
    id: 4,
    title: "Unreal Engine 5 for Beginners",
    instructor: "Alex Rivera",
    duration: "15h 20m",
    students: 2100,
    rating: 4.7,
    level: "Beginner",
    image: "unreal",
    category: "Game Design",
  },
  {
    id: 5,
    title: "After Effects Motion Design",
    instructor: "Lisa Park",
    duration: "10h 15m",
    students: 1567,
    rating: 4.8,
    level: "Intermediate",
    image: "ae",
    category: "Motion Graphics",
  },
  {
    id: 6,
    title: "Character Animation in Maya",
    instructor: "David Kim",
    duration: "20h 30m",
    students: 934,
    rating: 4.9,
    level: "Intermediate",
    image: "maya",
    category: "Animation",
  },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Courses" }]} />

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
          <p className="text-gray-500">Learn from industry professionals with hands-on projects</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category, idx) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                idx === 0
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="card overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white/30" />
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-white/90 text-xs font-medium text-gray-800 rounded-md">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{course.instructor}</p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students.toLocaleString()}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-900">{course.rating}</span>
                    <span className="text-gray-400 text-sm">(128)</span>
                  </div>
                  <button className="btn-primary text-xs">Enroll now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
