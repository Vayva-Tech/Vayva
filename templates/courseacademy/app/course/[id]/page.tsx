"use client";

import { Star, Users, Clock, Play, CheckCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";

const curriculum = [
  { title: "Introduction to the Course", duration: "15 min", free: true },
  { title: "Setting Up Your Environment", duration: "45 min", free: true },
  { title: "Core Concepts Fundamentals", duration: "2h 30min", free: false },
  { title: "Building Your First Project", duration: "3h", free: false },
  { title: "Advanced Techniques", duration: "4h", free: false },
  { title: "Deployment & Best Practices", duration: "1h 30min", free: false },
];

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary-700">CourseAcademy</Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Course Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <span className="px-3 py-1 bg-primary-600 text-sm font-medium rounded-full">Development</span>
              <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4">Complete Web Development Bootcamp</h1>
              <p className="text-gray-400 text-lg mb-6">Learn to build modern web applications from scratch. Covers HTML, CSS, JavaScript, React, Node.js, and more.</p>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">4.9</span>
                  <span className="text-gray-400">(2,340 reviews)</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-5 h-5" />
                  12,500 students
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  48 hours
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 text-gray-900">
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mb-4">
                <Play className="w-16 h-16 text-primary-600" />
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold">$89</span>
                <span className="text-gray-400 line-through">$199</span>
                <span className="text-green-600 text-sm">55% off</span>
              </div>
              <button className="w-full btn-primary mb-3 flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Enroll Now
              </button>
              <button className="w-full btn-secondary">Preview Course</button>
              <p className="text-center text-sm text-gray-500 mt-4">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* What You'll Learn */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You&apos;ll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Build responsive websites",
                    "Master JavaScript & TypeScript",
                    "Create React applications",
                    "Work with APIs & databases",
                    "Deploy to production",
                    "Best practices & patterns",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Curriculum */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
                <div className="border rounded-xl overflow-hidden">
                  {curriculum.map((section, index) => (
                    <div key={section.title} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{section.title}</p>
                          <p className="text-sm text-gray-500">{section.duration}</p>
                        </div>
                      </div>
                      {section.free && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div>
              <div className="card p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Instructor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Senior Web Developer</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <span>4.9 Rating</span>
                  <span>•</span>
                  <span>15 Courses</span>
                  <span>•</span>
                  <span>25K Students</span>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">This course includes:</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    48 hours on-demand video
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Lifetime access
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
