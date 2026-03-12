"use client";

import Header from "@/components/Header";
import { Video, Calendar, Clock, Users, ChevronRight, Plus, Star, Check } from "lucide-react";
import { useState } from "react";

const workshops = [
  {
    id: 1,
    title: "Mastering V-Ray for Production",
    description: "Learn professional lighting and rendering techniques used in top VFX studios.",
    instructor: "Marcus Chen",
    instructorRole: "Senior Lighting Artist, ILM",
    date: "Mar 15, 2024",
    time: "10:00 AM PST",
    duration: "3 hours",
    spots: 50,
    spotsLeft: 12,
    price: 149,
    isLive: true,
    isRecorded: true,
    topics: ["Global Illumination", "HDRI Setup", "Render Optimization", "Compositing Prep"],
    level: "Intermediate",
  },
  {
    id: 2,
    title: "Character Rigging Masterclass",
    description: "Advanced rigging techniques for believable character animation in Maya.",
    instructor: "Sarah Williams",
    instructorRole: "Technical Animator, Pixar",
    date: "Mar 22, 2024",
    time: "11:00 AM PST",
    duration: "4 hours",
    spots: 30,
    spotsLeft: 8,
    price: 199,
    isLive: true,
    isRecorded: true,
    topics: ["Joint Setup", "IK/FK Switching", "Facial Rigging", "Automation Scripts"],
    level: "Advanced",
  },
  {
    id: 3,
    title: "Motion Design Portfolio Review",
    description: "Get personalized feedback on your motion design work from industry pros.",
    instructor: "Alex Rivera",
    instructorRole: "Creative Director, Buck",
    date: "Mar 28, 2024",
    time: "2:00 PM PST",
    duration: "2 hours",
    spots: 20,
    spotsLeft: 3,
    price: 99,
    isLive: true,
    isRecorded: false,
    topics: ["Portfolio Strategy", "Case Studies", "Client Work", "Personal Projects"],
    level: "All Levels",
  },
  {
    id: 4,
    title: "Houdini for Beginners",
    description: "Your first step into procedural workflows and FX in Houdini.",
    instructor: "David Park",
    instructorRole: "FX Artist, Weta Digital",
    date: "Apr 5, 2024",
    time: "9:00 AM PST",
    duration: "3 hours",
    spots: 100,
    spotsLeft: 45,
    price: 79,
    isLive: true,
    isRecorded: true,
    topics: ["Node-based Workflow", "Procedural Modeling", "Particles", "Vellum Basics"],
    level: "Beginner",
  },
];

const recordings = [
  {
    id: 101,
    title: "Unreal Engine 5: Nanite & Lumen",
    instructor: "James Miller",
    duration: "2.5 hours",
    rating: 4.9,
    students: 892,
    price: 49,
    preview: "Available",
  },
  {
    id: 102,
    title: "Substance Painter: Advanced Materials",
    instructor: "Emma Thompson",
    duration: "3 hours",
    rating: 4.8,
    students: 645,
    price: 59,
    preview: "Available",
  },
  {
    id: 103,
    title: "After Effects Expressions",
    instructor: "Michael Chen",
    duration: "2 hours",
    rating: 4.7,
    students: 1234,
    price: 39,
    preview: "Available",
  },
];

export default function WorkshopsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "recordings">("upcoming");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Workshops" }]} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="px-6 py-16 max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">
                Live
              </span>
              <span className="text-gray-400">Interactive learning with industry pros</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Live Workshops</h1>
            <p className="text-gray-400 text-lg mb-8">
              Join interactive sessions with top artists from Pixar, ILM, Weta, and more. 
              Ask questions, get feedback, and learn from the best in real-time.
            </p>
            <div className="flex gap-4">
              <button className="btn-primary flex items-center gap-2">
                <Video className="w-4 h-4" />
                Browse Upcoming
              </button>
              <button className="btn-secondary">View Recordings</button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-12 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">250+</div>
            <div className="text-gray-500 text-sm">Workshops Hosted</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">85+</div>
            <div className="text-gray-500 text-sm">Expert Instructors</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">12K+</div>
            <div className="text-gray-500 text-sm">Students Attended</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">4.9</div>
            <div className="text-gray-500 text-sm">Average Rating</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "upcoming"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Upcoming Live Workshops
          </button>
          <button
            onClick={() => setActiveTab("recordings")}
            className={`px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "recordings"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Recorded Workshops
          </button>
        </div>

        {activeTab === "upcoming" ? (
          <div className="space-y-6">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="card overflow-hidden">
                <div className="grid md:grid-cols-4 gap-0">
                  {/* Info */}
                  <div className="p-6 md:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        workshop.level === "Beginner" ? "bg-green-100 text-green-700" :
                        workshop.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                        workshop.level === "Advanced" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {workshop.level}
                      </span>
                      {workshop.isLive && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{workshop.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{workshop.description}</p>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                        {workshop.instructor.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{workshop.instructor}</div>
                        <div className="text-xs text-gray-500">{workshop.instructorRole}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {workshop.topics.map((topic) => (
                        <span key={topic} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="p-6 border-l border-gray-100 bg-gray-50/50">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {workshop.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {workshop.time} • {workshop.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {workshop.spotsLeft} spots left of {workshop.spots}
                      </div>
                    </div>

                    {workshop.isRecorded && (
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                        <Check className="w-4 h-4" />
                        Recording included
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="p-6 border-l border-gray-100 flex flex-col justify-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">${workshop.price}</div>
                    <p className="text-sm text-gray-500 mb-4">per person</p>
                    <button className="w-full btn-primary mb-2">Register Now</button>
                    <button className="w-full text-sm text-gray-600 hover:text-gray-900">
                      Learn more →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {recordings.map((recording) => (
              <div key={recording.id} className="card overflow-hidden group cursor-pointer">
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative">
                  <Video className="w-16 h-16 text-white/30" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{recording.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">by {recording.instructor}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recording.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {recording.rating}
                    </span>
                    <span>{recording.students} students</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">${recording.price}</span>
                    <button className="btn-secondary text-sm">Watch Preview</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 card p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Want to host a workshop?</h3>
              <p className="text-gray-400">
                Share your expertise with thousands of eager students. We handle the tech, you teach.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-5 h-5" />
              Apply to Teach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
