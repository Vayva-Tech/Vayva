"use client";

import { Code, Play, Clock, Star, Users, BookOpen, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const courses = [
  {
    id: 1,
    title: "Full-Stack JavaScript",
    description: "Master Node.js, React, and modern JavaScript development",
    duration: "12 weeks",
    students: 2847,
    rating: 4.9,
    level: "Beginner",
    icon: "🟨",
  },
  {
    id: 2,
    title: "Python for Data Science",
    description: "Learn Python, pandas, NumPy, and machine learning basics",
    duration: "10 weeks",
    students: 1923,
    rating: 4.8,
    level: "Intermediate",
    icon: "🐍",
  },
  {
    id: 3,
    title: "Web Development Bootcamp",
    description: "HTML, CSS, JavaScript, and responsive design fundamentals",
    duration: "8 weeks",
    students: 4521,
    rating: 4.9,
    level: "Beginner",
    icon: "🌐",
  },
  {
    id: 4,
    title: "React & Next.js Mastery",
    description: "Build modern web apps with React, Next.js, and TypeScript",
    duration: "10 weeks",
    students: 2156,
    rating: 4.8,
    level: "Advanced",
    icon: "⚛️",
  },
  {
    id: 5,
    title: "Mobile App Development",
    description: "Create iOS and Android apps with React Native",
    duration: "12 weeks",
    students: 1432,
    rating: 4.7,
    level: "Intermediate",
    icon: "📱",
  },
  {
    id: 6,
    title: "Cloud Computing with AWS",
    description: "Deploy and scale applications on Amazon Web Services",
    duration: "8 weeks",
    students: 987,
    rating: 4.8,
    level: "Advanced",
    icon: "☁️",
  },
];

const benefits = [
  "Project-based learning",
  "1-on-1 mentor support",
  "Job placement assistance",
  "Lifetime course access",
  "Industry-recognized certificates",
  "Active community forum",
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CodeCamp</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/courses" className="text-emerald-600 font-medium">Courses</Link>
              <Link href="/tutorials" className="text-gray-600 hover:text-gray-900">Tutorials</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </div>
            <Link href="/signup" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
              Start Learning
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Learn to Code</h1>
          <p className="text-xl text-emerald-100 mb-8">
            Interactive coding courses taught by industry experts
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-100">
              Start Free Trial
            </Link>
            <Link href="/tutorials" className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10">
              Browse Tutorials
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Course Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Popular Courses</h2>
            <Link href="/courses/all" className="text-emerald-600 font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-6xl">
                  {course.icon}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      course.level === "Beginner" ? "bg-green-100 text-green-700" :
                      course.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {course.level}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {course.rating}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students.toLocaleString()} students
                    </span>
                  </div>
                  <Link href={`/course/${course.id}`} className="block w-full py-3 bg-emerald-500 text-white text-center rounded-lg hover:bg-emerald-600">
                    Enroll Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white rounded-2xl p-12 border border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why CodeCamp?</h2>
            <p className="text-gray-600">Everything you need to become a developer</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <span className="text-lg text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
