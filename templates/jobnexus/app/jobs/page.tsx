"use client";

import { Search, MapPin, Building2, DollarSign, Clock, Filter, Bookmark, Share2, ChevronDown, Bell, User, Briefcase, TrendingUp, Users, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const jobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    logo: "🔵",
    location: "San Francisco, CA",
    salary: "$140K - $180K",
    type: "Full-time",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Node.js"],
    applicants: 45,
    saved: false,
  },
  {
    id: 2,
    title: "Product Designer",
    company: "DesignStudio",
    logo: "🎨",
    location: "Remote",
    salary: "$120K - $150K",
    type: "Full-time",
    posted: "1 day ago",
    tags: ["Figma", "UI/UX", "Design Systems"],
    applicants: 32,
    saved: true,
  },
  {
    id: 3,
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    logo: "🚀",
    location: "New York, NY",
    salary: "$130K - $170K",
    type: "Full-time",
    posted: "3 days ago",
    tags: ["Python", "React", "AWS"],
    applicants: 67,
    saved: false,
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "Cloud Systems",
    logo: "☁️",
    location: "Austin, TX",
    salary: "$125K - $160K",
    type: "Full-time",
    posted: "5 hours ago",
    tags: ["Kubernetes", "Docker", "CI/CD"],
    applicants: 23,
    saved: false,
  },
];

const categories = [
  { name: "Software Engineering", count: 2340, icon: "💻" },
  { name: "Design", count: 890, icon: "🎨" },
  { name: "Marketing", count: 567, icon: "📢" },
  { name: "Sales", count: 445, icon: "🤝" },
  { name: "Data Science", count: 334, icon: "📊" },
  { name: "Product", count: 223, icon: "📱" },
];

const topCompanies = [
  { name: "Google", rating: 4.8, jobs: 123, logo: "🔍" },
  { name: "Meta", rating: 4.5, jobs: 89, logo: "👥" },
  { name: "Netflix", rating: 4.7, jobs: 45, logo: "🎬" },
  { name: "Apple", rating: 4.9, jobs: 67, logo: "🍎" },
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [savedJobs, setSavedJobs] = useState<number[]>([2]);

  const toggleSave = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JobNexus</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-blue-600 font-medium">Find Jobs</Link>
              <Link href="/companies" className="text-gray-600 hover:text-gray-900">Companies</Link>
              <Link href="/salaries" className="text-gray-600 hover:text-gray-900">Salaries</Link>
              <Link href="/resources" className="text-gray-600 hover:text-gray-900">Resources</Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <Link href="/profile" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  JD
                </div>
              </Link>
              <Link href="/employer" className="hidden md:block px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                For Employers
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Search */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-blue-100 text-center mb-8 text-lg">
            Discover 50,000+ jobs at top companies and startups
          </p>
          <div className="bg-white rounded-xl p-2 shadow-lg">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title, keywords, or company"
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, state, or remote"
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                />
              </div>
              <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                Search
              </button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="text-blue-200 text-sm">Popular:</span>
            {["Remote", "Engineering", "Design", "Marketing", "Product"].map((tag) => (
              <button key={tag} className="px-3 py-1 bg-white/20 text-white text-sm rounded-full hover:bg-white/30">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-center">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3 className="font-medium text-gray-900 text-sm">{cat.name}</h3>
              <p className="text-xs text-gray-500">{cat.count} jobs</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button className="text-blue-600 text-sm">Reset</button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                      <label key={type} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3">Experience</h4>
                  <div className="space-y-2">
                    {["Entry Level", "Mid Level", "Senior", "Lead"].map((exp) => (
                      <label key={exp} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-600">{exp}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3">Salary Range</h4>
                  <div className="space-y-2">
                    {["$50K - $80K", "$80K - $120K", "$120K - $160K", "$160K+"].map((range) => (
                      <label key={range} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-600">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">{jobs.length} jobs found</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <button className="flex items-center gap-1 text-sm font-medium">
                  Most relevant <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                      {job.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 cursor-pointer">
                            {job.title}
                          </h3>
                          <p className="text-gray-600">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSave(job.id)}
                            className={`p-2 rounded-lg ${savedJobs.includes(job.id) ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:bg-gray-100"}`}
                          >
                            <Bookmark className={`w-5 h-5 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                          </button>
                          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.posted}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="text-sm text-gray-500">{job.applicants} applicants</span>
                        <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Companies */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Top Hiring Companies</h3>
              <div className="space-y-4">
                {topCompanies.map((company) => (
                  <div key={company.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {company.logo}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{company.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{company.rating}</span>
                        <span>•</span>
                        <span>{company.jobs} jobs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Upload */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">Get Discovered</h3>
              <p className="text-blue-200 text-sm mb-4">
                Upload your resume and let employers find you.
              </p>
              <button className="w-full py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50">
                Upload Resume
              </button>
            </div>

            {/* Job Alerts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-2">Job Alerts</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get notified when new jobs match your search.
              </p>
              <button className="w-full py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50">
                Create Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
