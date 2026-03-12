"use client";

import { Briefcase, Building2, MapPin, Star, Users, Globe, TrendingUp, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const companies = [
  {
    id: 1,
    name: "TechCorp Inc",
    industry: "Technology",
    location: "San Francisco, CA",
    employees: "1000-5000",
    rating: 4.5,
    reviews: 234,
    logo: "💻",
    openJobs: 45,
  },
  {
    id: 2,
    name: "StartupXYZ",
    industry: "Software",
    location: "New York, NY",
    employees: "100-500",
    rating: 4.8,
    reviews: 89,
    logo: "🚀",
    openJobs: 12,
  },
  {
    id: 3,
    name: "Design Studio Pro",
    industry: "Design",
    location: "Remote First",
    employees: "50-100",
    rating: 4.6,
    reviews: 156,
    logo: "🎨",
    openJobs: 8,
  },
  {
    id: 4,
    name: "DataSystems Corp",
    industry: "Data & Analytics",
    location: "Austin, TX",
    employees: "500-1000",
    rating: 4.3,
    reviews: 178,
    logo: "📊",
    openJobs: 23,
  },
];

const industries = [
  "All",
  "Technology",
  "Software",
  "Design",
  "Finance",
  "Healthcare",
  "E-commerce",
];

export default function CompaniesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter((company) => {
    const matchesIndustry = selectedIndustry === "All" || company.industry === selectedIndustry;
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

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
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900">Find Jobs</Link>
              <Link href="/companies" className="text-blue-600 font-medium">Companies</Link>
              <Link href="/salaries" className="text-gray-600 hover:text-gray-900">Salaries</Link>
              <Link href="/resources" className="text-gray-600 hover:text-gray-900">Resources</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore Top Companies</h1>
          <p className="text-blue-100 mb-6">Discover great places to work and find your next opportunity</p>
          <div className="bg-white rounded-xl p-4 shadow-lg max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies by name or industry"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedIndustry === industry
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border hover:bg-gray-50"
              }`}
            >
              {industry}
            </button>
          ))}
        </div>

        {/* Companies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl p-6 border hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl mb-4">
                {company.logo}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{company.industry}</p>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{company.rating}</span>
                <span className="text-gray-500 text-sm">({company.reviews} reviews)</span>
              </div>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {company.employees} employees
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-blue-600 font-medium">{company.openJobs} open jobs</span>
                <button className="text-gray-400 hover:text-gray-600">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
