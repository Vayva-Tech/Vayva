"use client";

import { Code, Play, CheckCircle, Lock, Terminal, FileText, MessageSquare, Download, ChevronRight, Clock, Award, Users, Star, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const tutorials = [
  {
    id: 1,
    title: "Building a REST API with Node.js and Express",
    description: "Learn to build scalable APIs with authentication, validation, and database integration",
    category: "Backend",
    level: "Intermediate",
    duration: "2h 30m",
    instructor: "Sarah Chen",
    rating: 4.9,
    students: 8500,
    free: true,
    thumbnail: "🖥️"
  },
  {
    id: 2,
    title: "React Hooks Deep Dive",
    description: "Master useState, useEffect, useContext, and create custom hooks for reusable logic",
    category: "Frontend",
    level: "Intermediate",
    duration: "1h 45m",
    instructor: "Marcus Johnson",
    rating: 4.8,
    students: 12000,
    free: true,
    thumbnail: "⚛️"
  },
  {
    id: 3,
    title: "Docker for Beginners",
    description: "Containerize your applications and deploy with confidence using Docker",
    category: "DevOps",
    level: "Beginner",
    duration: "3h 15m",
    instructor: "Emily Rodriguez",
    rating: 4.9,
    students: 6700,
    free: false,
    thumbnail: "🐳"
  },
  {
    id: 4,
    title: "Machine Learning with Python",
    description: "Build your first ML models using scikit-learn and pandas for data analysis",
    category: "Data Science",
    level: "Beginner",
    duration: "4h 00m",
    instructor: "Dr. Alex Kim",
    rating: 4.7,
    students: 5400,
    free: false,
    thumbnail: "🤖"
  },
  {
    id: 5,
    title: "Advanced TypeScript Patterns",
    description: "Master generics, type guards, and advanced type manipulation in TypeScript",
    category: "Frontend",
    level: "Advanced",
    duration: "2h 00m",
    instructor: "David Park",
    rating: 4.9,
    students: 3200,
    free: true,
    thumbnail: "📘"
  },
  {
    id: 6,
    title: "GraphQL API Design",
    description: "Design efficient GraphQL schemas and implement resolvers with Apollo Server",
    category: "Backend",
    level: "Advanced",
    duration: "2h 45m",
    instructor: "Lisa Wang",
    rating: 4.8,
    students: 2800,
    free: false,
    thumbnail: "◈"
  }
];

const categories = [
  { name: "All", count: 156 },
  { name: "Frontend", count: 42 },
  { name: "Backend", count: 38 },
  { name: "DevOps", count: 24 },
  { name: "Data Science", count: 31 },
  { name: "Mobile", count: 21 }
];

const levels = ["Beginner", "Intermediate", "Advanced"];

export default function TutorialsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTutorials = tutorials.filter(tutorial => {
    if (activeCategory !== "All" && tutorial.category !== activeCategory) return false;
    if (activeLevel && tutorial.level !== activeLevel) return false;
    if (searchQuery && !tutorial.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="border-b border-dark-700 bg-dark-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary-500">CodeCamp</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/tracks" className="text-gray-300 hover:text-white">Tracks</Link>
              <Link href="/tutorials" className="text-primary-500 font-medium">Tutorials</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
              <Link href="/community" className="text-gray-300 hover:text-white">Community</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Free & Premium <span className="text-primary-500">Tutorials</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Learn specific skills with bite-sized, hands-on tutorials taught by industry experts
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <Terminal className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.name
                    ? "bg-primary-600 text-white"
                    : "bg-dark-800 text-gray-400 hover:text-white"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(activeLevel === level ? null : level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeLevel === level
                    ? "bg-primary-600 text-white"
                    : "bg-dark-800 text-gray-400 hover:text-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Tutorials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => (
              <div key={tutorial.id} className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden hover:border-primary-500/50 transition-colors group">
                <div className="h-40 bg-gradient-to-br from-primary-600/20 to-primary-700/20 flex items-center justify-center text-6xl">
                  {tutorial.thumbnail}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-dark-700 text-xs text-gray-300 rounded">
                      {tutorial.category}
                    </span>
                    <span className="px-2 py-1 bg-dark-700 text-xs text-gray-300 rounded">
                      {tutorial.level}
                    </span>
                    {tutorial.free && (
                      <span className="px-2 py-1 bg-green-500/20 text-xs text-green-400 rounded">
                        Free
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-500 transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {tutorial.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {tutorial.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {tutorial.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tutorial.students.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 text-sm font-medium">
                        {tutorial.instructor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-gray-400">{tutorial.instructor}</span>
                    </div>
                    <Link 
                      href={`/tutorials/${tutorial.id}`}
                      className="text-primary-500 hover:text-primary-400"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTutorials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No tutorials found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-dark-900 border-t border-dark-700 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-gray-400 text-sm">
            © 2024 CodeCamp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
