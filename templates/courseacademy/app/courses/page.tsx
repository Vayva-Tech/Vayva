"use client";

import { Star, Users, Clock, Filter, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categories = ["All", "Development", "Design", "Marketing", "Business", "Photography"];

const allCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    instructor: "Sarah Johnson",
    rating: 4.9,
    students: 12500,
    duration: "48h",
    price: 89,
    category: "Development",
    level: "Beginner",
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass",
    instructor: "Mike Chen",
    rating: 4.8,
    students: 8300,
    duration: "32h",
    price: 79,
    category: "Design",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Digital Marketing Strategy",
    instructor: "Emma Davis",
    rating: 4.7,
    students: 6200,
    duration: "24h",
    price: 69,
    category: "Marketing",
    level: "Beginner",
  },
  {
    id: 4,
    title: "Python for Data Science",
    instructor: "Dr. Alex Kim",
    rating: 4.9,
    students: 9800,
    duration: "40h",
    price: 99,
    category: "Development",
    level: "Intermediate",
  },
  {
    id: 5,
    title: "Photography Fundamentals",
    instructor: "Maria Garcia",
    rating: 4.8,
    students: 4500,
    duration: "16h",
    price: 59,
    category: "Photography",
    level: "Beginner",
  },
  {
    id: 6,
    title: "Business Strategy 101",
    instructor: "Robert Taylor",
    rating: 4.6,
    students: 3200,
    duration: "20h",
    price: 79,
    category: "Business",
    level: "All Levels",
  },
];

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = allCourses.filter((course) => {
    const matchesCategory = activeCategory === "All" || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary-700">CourseAcademy</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/courses" className="text-gray-900 font-medium">Courses</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-gray-400 text-lg">Find the perfect course to advance your career</p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            {/* Sort */}
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Sort by
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`} className="group">
                <div className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                        {course.category}
                      </span>
                      <span className="text-xs text-gray-500">{course.level}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">by {course.instructor}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {course.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">${course.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No courses found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2024 CourseAcademy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
