"use client";

import { Search, MapPin, Building2, DollarSign, Briefcase, Star, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Technology", jobs: 1234, icon: "💻" },
  { name: "Healthcare", jobs: 856, icon: "🏥" },
  { name: "Finance", jobs: 642, icon: "💰" },
  { name: "Marketing", jobs: 521, icon: "📢" },
  { name: "Design", jobs: 389, icon: "🎨" },
  { name: "Sales", jobs: 467, icon: "📈" },
];

const featuredJobs = [
  { id: 1, title: "Senior Software Engineer", company: "TechCorp", location: "San Francisco", salary: "$120k - $180k", type: "Full-time", logo: "bg-blue-100" },
  { id: 2, title: "Product Manager", company: "InnovateCo", location: "New York", salary: "$110k - $160k", type: "Full-time", logo: "bg-purple-100" },
  { id: 3, title: "UX Designer", company: "DesignHub", location: "Remote", salary: "$90k - $140k", type: "Full-time", logo: "bg-pink-100" },
  { id: 4, title: "Marketing Director", company: "GrowthLabs", location: "Chicago", salary: "$100k - $150k", type: "Full-time", logo: "bg-green-100" },
];

const stats = [
  { value: "10K+", label: "Active Jobs" },
  { value: "5K+", label: "Companies" },
  { value: "1M+", label: "Job Seekers" },
  { value: "50K+", label: "Hires Made" },
];

const features = [
  { icon: CheckCircle, title: "Verified Companies", desc: "All employers are vetted" },
  { icon: Star, title: "Easy Apply", desc: "One-click applications" },
  { icon: Briefcase, title: "Career Tools", desc: "Resume builder & tips" },
  { icon: DollarSign, title: "Salary Insights", desc: "Know your worth" },
];

export default function JobNexusHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JobNexus</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-gray-700 hover:text-primary-600">Find Jobs</Link>
              <Link href="/companies" className="text-gray-700 hover:text-primary-600">Companies</Link>
              <Link href="/salary" className="text-gray-700 hover:text-primary-600">Salaries</Link>
              <Link href="/career-advice" className="text-gray-700 hover:text-primary-600">Career Advice</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Post a Job</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Find Your <span className="text-primary-600">Dream Job</span> Today
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with top employers and discover opportunities that match your skills
            </p>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Job title or keyword" className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0" />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Location" className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0" />
                </div>
                <button className="btn-primary">Search Jobs</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button key={cat.name} className="p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:shadow-md transition-all text-center group">
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{cat.icon}</span>
                <h3 className="font-medium text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.jobs.toLocaleString()} jobs</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Jobs</h2>
            <Link href="/jobs" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="space-y-4">
            {featuredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 ${job.logo} rounded-xl flex items-center justify-center text-2xl`}>🏢</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mt-1">
                    <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">{job.type}</span>
                  <button className="btn-primary">Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Why JobNexus</h2>
            <p className="text-gray-600">The most trusted platform for job seekers and employers</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Next Opportunity?</h2>
          <p className="text-white/80 mb-8">Join thousands of professionals finding their dream jobs</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup" className="px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
              Get Started
            </Link>
            <Link href="/employers" className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
              For Employers
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">JobNexus</span>
              </div>
              <p className="text-sm">Connecting talent with opportunity. Your career journey starts here.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/jobs">Browse Jobs</Link></li>
                <li><Link href="/companies">Browse Companies</Link></li>
                <li><Link href="/salary">Salary Calculator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/post-job">Post a Job</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/resources">Recruiting Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 JobNexus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
