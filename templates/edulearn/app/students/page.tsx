"use client";

import Header from "@/components/Header";
import { Users, Search, Filter, Award, BookOpen, Clock, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";

const filters = [
  { name: "All Students", count: 25432 },
  { name: "My Connections", count: 156 },
  { name: "Top Performers", count: 89 },
  { name: "New Members", count: 234 },
];

const students = [
  {
    id: 1,
    name: "Alexandra Chen",
    handle: "@alexchen_design",
    avatar: "AC",
    location: "San Francisco, CA",
    role: "Motion Designer",
    company: "Freelance",
    skills: ["After Effects", "Cinema 4D", "Illustrator"],
    coursesCompleted: 12,
    hoursLearned: 156,
    achievements: 8,
    isTopPerformer: true,
  },
  {
    id: 2,
    name: "Marcus Williams",
    handle: "@marcus_3d",
    avatar: "MW",
    location: "London, UK",
    role: "3D Artist",
    company: "Framestore",
    skills: ["Blender", "Maya", "Houdini", "Substance"],
    coursesCompleted: 8,
    hoursLearned: 124,
    achievements: 5,
  },
  {
    id: 3,
    name: "Priya Sharma",
    handle: "@priya_vfx",
    avatar: "PS",
    location: "Mumbai, India",
    role: "VFX Artist",
    company: "Red Chillies",
    skills: ["Houdini", "Nuke", "Maya"],
    coursesCompleted: 15,
    hoursLearned: 234,
    achievements: 12,
    isTopPerformer: true,
  },
  {
    id: 4,
    name: "James Rodriguez",
    handle: "@james_unity",
    avatar: "JR",
    location: "Toronto, Canada",
    role: "Game Developer",
    company: "Ubisoft",
    skills: ["Unity", "C#", "Blender", "Unreal"],
    coursesCompleted: 6,
    hoursLearned: 98,
    achievements: 3,
  },
  {
    id: 5,
    name: "Emma Thompson",
    handle: "@emma_motion",
    avatar: "ET",
    location: "Sydney, Australia",
    role: "Animator",
    company: "Animal Logic",
    skills: ["Maya", "Animate", "Toon Boom"],
    coursesCompleted: 10,
    hoursLearned: 142,
    achievements: 7,
  },
  {
    id: 6,
    name: "Yuki Tanaka",
    handle: "@yuki_render",
    avatar: "YT",
    location: "Tokyo, Japan",
    role: "Technical Artist",
    company: "Square Enix",
    skills: ["Houdini", "Python", "Blender", "Unity"],
    coursesCompleted: 18,
    hoursLearned: 267,
    achievements: 15,
    isTopPerformer: true,
  },
];

export default function StudentsPage() {
  const [activeFilter, setActiveFilter] = useState("All Students");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Students" }]} />

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Community</h1>
          <p className="text-gray-500">Connect with 25,000+ creative professionals worldwide</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">25,432</div>
            <div className="text-gray-500 text-sm">Total Students</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">892</div>
            <div className="text-gray-500 text-sm">Online Now</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">156</div>
            <div className="text-gray-500 text-sm">Countries</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">2.4M</div>
            <div className="text-gray-500 text-sm">Hours Learned</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.name
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter.name}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.name ? "bg-white/20" : "bg-gray-100"
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="card p-5 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg font-bold">
                    {student.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.handle}</p>
                  </div>
                </div>
                {student.isTopPerformer && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md">
                    <Award className="w-3 h-3" />
                    Top
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-1">{student.role}</p>
                <p className="text-sm text-gray-500 mb-2">{student.company}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {student.location}
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {student.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {student.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-400 text-xs rounded-md">
                    +{student.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {student.coursesCompleted} courses
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {student.hoursLearned}h
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {student.achievements}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 btn-primary text-sm">Connect</button>
                <button className="btn-secondary px-3">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
