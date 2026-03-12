"use client";

import { Award, Users, Play, ArrowRight } from "lucide-react";
import Link from "next/link";

const instructors = [
  { name: "Sarah Johnson", role: "Lead Instructor", courses: 15, students: "25K" },
  { name: "Mike Chen", role: "Design Expert", courses: 12, students: "18K" },
  { name: "Emma Davis", role: "Marketing Pro", courses: 8, students: "12K" },
];

export default function AboutPage() {
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

      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Empowering Learners Worldwide</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We believe quality education should be accessible to everyone. Our mission is to help you master new skills and advance your career.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, value: "50,000+", label: "Students" },
              { icon: Play, value: "200+", label: "Courses" },
              { icon: Award, value: "4.9", label: "Rating" },
              { icon: Users, value: "50+", label: "Instructors" },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Instructors</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <div key={instructor.name} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">{instructor.name}</h3>
                <p className="text-gray-500 mb-4">{instructor.role}</p>
                <div className="flex justify-center gap-4 text-sm text-gray-600">
                  <span>{instructor.courses} courses</span>
                  <span>•</span>
                  <span>{instructor.students} students</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-100 mb-8">Join thousands of students already learning on CourseAcademy</p>
          <Link href="/auth/signup" className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100">
            Get Started Free
            <ArrowRight className="w-5 h-5 inline ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2024 CourseAcademy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
