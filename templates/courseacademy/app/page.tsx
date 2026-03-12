"use client";

import { Play, Star, Users, Award, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const stats = [
  { number: "50K+", label: "Students" },
  { number: "200+", label: "Courses" },
  { number: "4.9", label: "Rating" },
  { number: "95%", label: "Success Rate" },
];

const featuredCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    instructor: "Sarah Johnson",
    rating: 4.9,
    students: 12500,
    price: 89,
    originalPrice: 199,
    image: "web",
    tag: "Bestseller",
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass",
    instructor: "Mike Chen",
    rating: 4.8,
    students: 8300,
    price: 79,
    originalPrice: 149,
    image: "design",
    tag: "New",
  },
  {
    id: 3,
    title: "Digital Marketing Strategy",
    instructor: "Emma Davis",
    rating: 4.7,
    students: 6200,
    price: 69,
    originalPrice: 129,
    image: "marketing",
  },
];

const testimonials = [
  {
    name: "Alex Thompson",
    role: "Frontend Developer",
    content: "The web development course completely changed my career. I went from zero to hired in 6 months!",
    avatar: "AT",
  },
  {
    name: "Lisa Park",
    role: "UX Designer",
    content: "Best investment I've made. The instructors are world-class and the community is incredibly supportive.",
    avatar: "LP",
  },
  {
    name: "James Wilson",
    role: "Marketing Manager",
    content: "Finally, courses that teach real-world skills. I've applied everything I learned immediately at work.",
    avatar: "JW",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary-700">
              CourseAcademy
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/courses" className="text-gray-600 hover:text-gray-900">Courses</Link>
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
      <section className="section-padding bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Learn from the{" "}
                <span className="text-primary-600">best experts</span> in the world
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Access 200+ premium courses taught by industry leaders. Start your journey today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/courses" className="btn-primary inline-flex items-center gap-2">
                  Explore Courses
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="btn-secondary inline-flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-2xl">
                <Play className="w-20 h-20 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
              <p className="text-gray-600">Hand-picked by our experts</p>
            </div>
            <Link href="/courses" className="text-primary-600 font-medium hover:underline inline-flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative">
                  {course.tag && (
                    <span className={`absolute top-4 left-4 px-3 py-1 text-sm font-medium rounded-full ${
                      course.tag === "Bestseller" ? "bg-yellow-400 text-yellow-900" : "bg-green-400 text-green-900"
                    }`}>
                      {course.tag}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">by {course.instructor}</p>
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      {course.students.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">${course.price}</span>
                    <span className="text-gray-400 line-through">${course.originalPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CourseAcademy?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide the best learning experience with industry-recognized certifications</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: "Expert Instructors", desc: "Learn from professionals with 10+ years of industry experience" },
              { icon: CheckCircle, title: "Recognized Certificates", desc: "Earn certificates that boost your resume and LinkedIn profile" },
              { icon: Users, title: "Active Community", desc: "Join 50,000+ learners and network with peers worldwide" },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What Our Students Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">&ldquo;{t.content}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-100 text-xl mb-8">Join 50,000+ students and transform your career today</p>
          <Link href="/auth/signup" className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">CourseAcademy</h3>
              <p className="text-sm">Empowering learners worldwide with quality education</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Courses</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="hover:text-white">Development</Link></li>
                <li><Link href="/courses" className="hover:text-white">Design</Link></li>
                <li><Link href="/courses" className="hover:text-white">Marketing</Link></li>
                <li><Link href="/courses" className="hover:text-white">Business</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 CourseAcademy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
