"use client";

import { BookOpen, Clock, Award, TrendingUp, Calendar, Target, Zap, ChevronRight, Play, CheckCircle2, Star, MessageSquare, Bell } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const stats = [
  { name: "Courses in Progress", value: "4", icon: BookOpen, color: "blue" },
  { name: "Hours Learned", value: "127", icon: Clock, color: "green" },
  { name: "Certificates", value: "3", icon: Award, color: "purple" },
  { name: "Current Streak", value: "12 days", icon: Zap, color: "yellow" },
];

const continueLearning = [
  {
    id: 1,
    title: "Blender 4.0 Fundamentals",
    instructor: "Ethan Brantley",
    progress: 67,
    totalLessons: 24,
    completedLessons: 16,
    lastAccessed: "2 hours ago",
    thumbnail: "blender",
    nextLesson: "UV Unwrapping Basics",
  },
  {
    id: 2,
    title: "Character Animation in Maya",
    instructor: "Sarah Chen",
    progress: 34,
    totalLessons: 36,
    completedLessons: 12,
    lastAccessed: "1 day ago",
    thumbnail: "maya",
    nextLesson: "Walk Cycle Fundamentals",
  },
  {
    id: 3,
    title: "V-Ray for 3ds Max",
    instructor: "Marcus Johnson",
    progress: 15,
    totalLessons: 18,
    completedLessons: 3,
    lastAccessed: "3 days ago",
    thumbnail: "vray",
    nextLesson: "Material Editor Overview",
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Blender Live: Q&A Session",
    type: "live",
    date: "Today",
    time: "4:00 PM",
    instructor: "Ethan Brantley",
  },
  {
    id: 2,
    title: "Assignment Due: 3D Character",
    type: "deadline",
    date: "Tomorrow",
    time: "11:59 PM",
    course: "Character Animation",
  },
  {
    id: 3,
    title: "Workshop: Advanced Texturing",
    type: "workshop",
    date: "Mar 8",
    time: "2:00 PM",
    instructor: "Sarah Chen",
  },
];

const achievements = [
  { name: "First Steps", description: "Complete your first lesson", earned: true, icon: "🎯" },
  { name: "Week Warrior", description: "7-day learning streak", earned: true, icon: "🔥" },
  { name: "Course Crusher", description: "Complete 3 courses", earned: true, icon: "🏆" },
  { name: "Social Butterfly", description: "Post in the forum 10 times", earned: false, icon: "💬" },
  { name: "Challenge Champion", description: "Win a challenge", earned: false, icon: "👑" },
];

const recommendedCourses = [
  {
    id: 1,
    title: "Advanced Lighting Techniques",
    instructor: "David Park",
    rating: 4.9,
    students: 2341,
    price: 99,
    image: "lighting",
  },
  {
    id: 2,
    title: "Substance Painter Essentials",
    instructor: "Emma Thompson",
    rating: 4.8,
    students: 1567,
    price: 79,
    image: "substance",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-bold">
              JS
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, John! 👋
          </h2>
          <p className="text-gray-500">
            You&apos;re on a 12-day streak! Keep up the momentum.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="card p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                stat.color === "blue" ? "bg-blue-100" :
                stat.color === "green" ? "bg-green-100" :
                stat.color === "purple" ? "bg-purple-100" :
                "bg-yellow-100"
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === "blue" ? "text-blue-600" :
                  stat.color === "green" ? "text-green-600" :
                  stat.color === "purple" ? "text-purple-600" :
                  "text-yellow-600"
                }`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.name}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Continue Learning</h3>
                <Link href="/my-courses" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {continueLearning.map((course) => (
                  <div key={course.id} className="card p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-16 md:w-32 md:h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shrink-0">
                        <Play className="w-8 h-8 text-white/50" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{course.progress}%</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-blue-600">
                            Next: {course.nextLesson}
                          </span>
                        </div>
                      </div>

                      <button className="btn-primary self-center hidden md:block">
                        Continue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendedCourses.map((course) => (
                  <div key={course.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-3 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/30" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {course.rating}
                      </span>
                      <span className="text-gray-400">({course.students})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Upcoming</h3>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      event.type === "live" ? "bg-blue-100" :
                      event.type === "deadline" ? "bg-red-100" :
                      "bg-purple-100"
                    }`}>
                      {event.type === "live" && <Zap className="w-5 h-5 text-blue-600" />}
                      {event.type === "deadline" && <Target className="w-5 h-5 text-red-600" />}
                      {event.type === "workshop" && <Calendar className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.date} • {event.time}
                      </p>
                      {event.instructor && (
                        <p className="text-xs text-gray-400">with {event.instructor}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900">
                View Calendar →
              </button>
            </div>

            {/* Achievements */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Achievements</h3>
                </div>
                <span className="text-sm text-gray-500">3/5 earned</span>
              </div>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.name} className={`flex items-center gap-3 ${
                    !achievement.earned ? "opacity-50" : ""
                  }`}>
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{achievement.name}</p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Daily Goal</h3>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">45 min / 60 min</span>
                  <span className="text-blue-600">75%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-blue-500 rounded-full" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Just 15 more minutes to reach your daily goal!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
