"use client";

import Header from "@/components/Header";
import { BookOpen, Clock, Award, ChevronRight, Users, Star, Check } from "lucide-react";
import Link from "next/link";

const programs = [
  {
    id: 1,
    title: "Complete 3D Artist Career Path",
    subtitle: "Master 3D modeling, texturing, lighting, and rendering",
    description: "A comprehensive 6-month program designed to take you from complete beginner to job-ready 3D artist. Learn industry-standard tools and workflows used at top studios.",
    thumbnail: "3d",
    courses: 8,
    duration: "6 months",
    level: "Beginner to Advanced",
    students: 3421,
    rating: 4.9,
    price: 299,
    originalPrice: 599,
    skills: ["Blender", "Maya", "Substance Painter", "ZBrush", "V-Ray"],
    outcomes: [
      "Build a professional 3D portfolio",
      "Master modeling, texturing & lighting",
      "Create photorealistic renders",
      "Prepare for studio jobs",
    ],
    featured: true,
  },
  {
    id: 2,
    title: "Visual Effects Specialist",
    subtitle: "Hollywood-level VFX techniques and workflows",
    description: "Learn the tools and techniques used by VFX artists in blockbuster films. From particle simulations to compositing, master the complete VFX pipeline.",
    thumbnail: "vfx",
    courses: 6,
    duration: "4 months",
    level: "Intermediate",
    students: 1856,
    rating: 4.8,
    price: 349,
    originalPrice: 699,
    skills: ["Houdini", "Nuke", "Maya", "After Effects"],
    outcomes: [
      "Create stunning particle simulations",
      "Master fluid and destruction FX",
      "Professional compositing techniques",
      "Build a VFX demo reel",
    ],
  },
  {
    id: 3,
    title: "Motion Design Masterclass",
    subtitle: "Create stunning motion graphics and animations",
    description: "The ultimate program for aspiring motion designers. Learn animation principles, typography in motion, and how to bring brands to life through motion.",
    thumbnail: "motion",
    courses: 5,
    duration: "3 months",
    level: "Beginner to Intermediate",
    students: 5623,
    rating: 4.9,
    price: 199,
    originalPrice: 399,
    skills: ["After Effects", "Cinema 4D", "Illustrator", "Premiere Pro"],
    outcomes: [
      "Master animation principles",
      "Create brand identity animations",
      "Design kinetic typography",
      "Build a motion design portfolio",
    ],
  },
  {
    id: 4,
    title: "Game Development Bootcamp",
    subtitle: "Build games with Unreal Engine and Unity",
    description: "From game design theory to publishing your first game. Learn programming, level design, and asset creation for games.",
    thumbnail: "game",
    courses: 7,
    duration: "5 months",
    level: "Beginner",
    students: 8923,
    rating: 4.7,
    price: 249,
    originalPrice: 499,
    skills: ["Unreal Engine", "Unity", "C#", "Blender", "Game Design"],
    outcomes: [
      "Build playable game prototypes",
      "Master game engines",
      "Create game assets",
      "Publish your first game",
    ],
  },
];

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Programs" }]} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="px-6 py-16 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/10 text-sm rounded-full">
              Structured Learning Paths
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 max-w-3xl">
            Learning programs designed for career success
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Curated collections of courses that take you from beginner to job-ready professional. 
            Save up to 50% compared to buying individual courses.
          </p>
        </div>
      </div>

      <div className="px-6 py-12 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">12</div>
            <div className="text-gray-500 text-sm">Career Programs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">80+</div>
            <div className="text-gray-500 text-sm">Expert Courses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">25K+</div>
            <div className="text-gray-500 text-sm">Graduates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">92%</div>
            <div className="text-gray-500 text-sm">Career Success</div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="space-y-8">
          {programs.map((program) => (
            <div
              key={program.id}
              className={`card overflow-hidden ${program.featured ? 'ring-2 ring-gray-900' : ''}`}
            >
              <div className="grid md:grid-cols-3 gap-0">
                {/* Left: Image & Quick Stats */}
                <div className="relative h-48 md:h-auto bg-gradient-to-br from-gray-700 to-gray-900 p-6 flex flex-col justify-between">
                  {program.featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div>
                    <div className="text-white/60 text-sm mb-2">Career Program</div>
                    <h3 className="text-2xl font-bold text-white mb-1">{program.title}</h3>
                    <p className="text-white/70 text-sm">{program.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {program.courses} courses
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {program.duration}
                    </span>
                  </div>
                </div>

                {/* Center: Description & Skills */}
                <div className="p-6 md:col-span-1 border-l border-r border-gray-100">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {program.description}
                  </p>

                  <div className="mb-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Skills you&apos;ll learn
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {program.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                      Career outcomes
                    </div>
                    <ul className="space-y-1">
                      {program.outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Enrollment Info */}
                <div className="p-6 bg-gray-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-gray-900">{program.rating}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1 text-gray-600 text-sm">
                        <Users className="w-4 h-4" />
                        {program.students.toLocaleString()} enrolled
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-gray-900">${program.price}</span>
                      <span className="text-gray-400 line-through">${program.originalPrice}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">One-time payment • Lifetime access</p>

                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        Certificate of completion
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Self-paced learning
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        {program.level}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link href={`/programs/${program.id}`}>
                      <button className="w-full btn-primary flex items-center justify-center gap-2">
                        Explore Program
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                    <button className="w-full btn-secondary">
                      Preview courses
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How programs work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Enroll in a program",
                description: "Choose a career path and get instant access to all courses in the program.",
              },
              {
                step: "2",
                title: "Learn at your pace",
                description: "Follow the structured curriculum or jump between courses as needed.",
              },
              {
                step: "3",
                title: "Build your portfolio",
                description: "Complete projects and build a portfolio that gets you hired.",
              },
            ].map((item) => (
              <div key={item.step} className="card p-6">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
