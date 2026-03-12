"use client";

import { Dumbbell, Clock, Flame, Users, Star, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";

const classes = [
  {
    id: 1,
    name: "HIIT Cardio Blast",
    instructor: "Alex Rivera",
    duration: "45 min",
    calories: "500-700",
    level: "Intermediate",
    time: "6:00 AM",
    image: "🔥",
    rating: 4.9,
    spots: 12,
  },
  {
    id: 2,
    name: "Power Yoga Flow",
    instructor: "Sarah Chen",
    duration: "60 min",
    calories: "200-350",
    level: "All Levels",
    time: "7:00 AM",
    image: "🧘",
    rating: 4.8,
    spots: 8,
  },
  {
    id: 3,
    name: "Strength Training",
    instructor: "Mike Johnson",
    duration: "50 min",
    calories: "400-600",
    level: "Advanced",
    time: "8:00 AM",
    image: "💪",
    rating: 4.9,
    spots: 15,
  },
  {
    id: 4,
    name: "Spin Cycle",
    instructor: "Emma Davis",
    duration: "45 min",
    calories: "600-800",
    level: "Intermediate",
    time: "9:00 AM",
    image: "🚴",
    rating: 4.7,
    spots: 20,
  },
  {
    id: 5,
    name: "Pilates Core",
    instructor: "Lisa Wong",
    duration: "55 min",
    calories: "250-400",
    level: "Beginner",
    time: "10:00 AM",
    image: "🤸",
    rating: 4.8,
    spots: 10,
  },
  {
    id: 6,
    name: "Boxing Fitness",
    instructor: "Carlos Martinez",
    duration: "50 min",
    calories: "500-750",
    level: "Advanced",
    time: "5:00 PM",
    image: "🥊",
    rating: 4.9,
    spots: 14,
  },
];

const categories = ["All", "Cardio", "Strength", "Yoga", "Cycling", "Pilates", "Boxing"];

export default function ClassesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FitPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/classes" className="text-orange-500 font-medium">Classes</Link>
              <Link href="/trainers" className="text-gray-400 hover:text-white">Trainers</Link>
              <Link href="/membership" className="text-gray-400 hover:text-white">Membership</Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
            </div>
            <Link href="/membership" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 to-red-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Group Fitness Classes</h1>
          <p className="text-xl text-orange-100 mb-8">
            Sweat, burn, and transform with our expert-led classes
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full border ${
                cat === "All"
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-orange-900/50 to-red-900/50 flex items-center justify-center text-6xl">
                {cls.image}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    cls.level === "Beginner" ? "bg-green-500/20 text-green-400" :
                    cls.level === "Intermediate" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>
                    {cls.level}
                  </span>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {cls.rating}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{cls.name}</h3>
                <p className="text-gray-400 mb-4">with {cls.instructor}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {cls.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    {cls.calories} cal
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {cls.spots} spots left
                  </div>
                </div>
                <button className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  Book Class
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
