"use client";

import Header from "@/components/Header";
import { Star, Users, Award, MessageSquare } from "lucide-react";

const mentors = [
  {
    id: 1,
    name: "Ethan Brantley",
    role: "Senior 3D Artist",
    company: "Pixar Animation",
    students: 2847,
    courses: 12,
    rating: 4.9,
    reviews: 324,
    expertise: ["Blender", "3D Modeling", "Rendering"],
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Motion Design Lead",
    company: "Google Creative Lab",
    students: 1923,
    courses: 8,
    rating: 4.8,
    reviews: 218,
    expertise: ["After Effects", "Cinema 4D", "Motion Graphics"],
  },
  {
    id: 3,
    name: "Marcus Johnson",
    role: "VFX Supervisor",
    company: "Industrial Light & Magic",
    students: 1542,
    courses: 6,
    rating: 4.9,
    reviews: 187,
    expertise: ["Houdini", "Nuke", "Compositing"],
  },
  {
    id: 4,
    name: "Lisa Park",
    role: "Creative Director",
    company: "Buck Design",
    students: 3211,
    courses: 15,
    rating: 4.7,
    reviews: 412,
    expertise: ["Motion Design", "Brand Identity", "Animation"],
  },
];

export default function MentorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Mentors" }]} />

      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Mentors</h1>
          <p className="text-gray-500">Learn from industry experts at top companies</p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="card p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {mentor.name.split(" ").map(n => n[0]).join("")}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{mentor.name}</h3>
                  <p className="text-gray-500 text-sm mb-1">{mentor.role}</p>
                  <p className="text-gray-400 text-sm mb-3">{mentor.company}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      {mentor.students.toLocaleString()} students
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Award className="w-4 h-4" />
                      {mentor.courses} courses
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {mentor.rating} ({mentor.reviews})
                    </span>
                  </div>

                  {/* Expertise */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="btn-primary flex-1">View profile</button>
                    <button className="btn-secondary px-3">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
