"use client";

import { BookOpen, Clock, Trophy, Zap, Code, Play, CheckCircle, Lock, Star, ChevronRight, Award, Flame, Target, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const userStats = {
  streak: 12,
  totalLessons: 47,
  completedLessons: 23,
  xp: 2450,
  level: 8,
  rank: "Intermediate",
};

const currentCourses = [
  {
    id: 1,
    name: "JavaScript Fundamentals",
    progress: 65,
    totalLessons: 20,
    completedLessons: 13,
    lastAccessed: "2 hours ago",
    icon: "🟨",
    color: "bg-yellow-500/20",
  },
  {
    id: 2,
    name: "React for Beginners",
    progress: 30,
    totalLessons: 25,
    completedLessons: 8,
    lastAccessed: "1 day ago",
    icon: "⚛️",
    color: "bg-blue-500/20",
  },
];

const recommendedCourses = [
  { name: "Advanced TypeScript", level: "Advanced", duration: "12 hours", icon: "🔷" },
  { name: "Node.js Backend", level: "Intermediate", duration: "15 hours", icon: "🟢" },
  { name: "Python for Data Science", level: "Beginner", duration: "20 hours", icon: "🐍" },
];

const dailyChallenge = {
  title: "Array Methods Practice",
  difficulty: "Medium",
  xp: 50,
  time: "10 min",
};

const achievements = [
  { name: "First Steps", description: "Complete your first lesson", icon: "👣", earned: true },
  { name: "7-Day Streak", description: "Code for 7 days straight", icon: "🔥", earned: true },
  { name: "Problem Solver", description: "Solve 50 coding challenges", icon: "🧩", earned: false },
  { name: "Full Stack", description: "Complete a frontend and backend course", icon: "🥞", earned: false },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-green-500">CodeCamp</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/tracks" className="text-gray-300 hover:text-white">Tracks</Link>
              <Link href="/tutorials" className="text-gray-300 hover:text-white">Tutorials</Link>
              <Link href="/community" className="text-gray-300 hover:text-white">Community</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-300">{userStats.streak}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-300">{userStats.xp} XP</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back, Alex! 👋
            </h1>
            <p className="text-gray-400">Keep up your {userStats.streak}-day streak!</p>
          </div>
          <Link
            href="/courses/javascript/continue"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Continue Learning
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">Lessons</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.completedLessons}/{userStats.totalLessons}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-400 text-sm">Level</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.level}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-gray-400 text-sm">Streak</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.streak} days</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <span className="text-gray-400 text-sm">XP Points</span>
            </div>
            <p className="text-2xl font-bold text-white">{userStats.xp.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Continue Learning</h2>
                <Link href="/courses" className="text-green-500 text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                {currentCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl">
                    <div className={`w-12 h-12 ${course.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {course.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{course.name}</h3>
                      <p className="text-sm text-gray-400">
                        {course.completedLessons}/{course.totalLessons} lessons • Last accessed {course.lastAccessed}
                      </p>
                      <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/courses/${course.id}`}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Recommended for You</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {recommendedCourses.map((course) => (
                  <div key={course.name} className="bg-gray-900 rounded-xl p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="text-3xl mb-3">{course.icon}</div>
                    <h3 className="font-semibold text-white text-sm mb-2">{course.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="px-2 py-1 bg-gray-800 rounded">{course.level}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Achievements</h2>
                <Link href="/achievements" className="text-green-500 text-sm hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`text-center p-4 rounded-xl ${
                      achievement.earned ? "bg-gray-900" : "bg-gray-900/50 opacity-50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h3 className="font-medium text-white text-sm">{achievement.name}</h3>
                    <p className="text-xs text-gray-400">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Challenge */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5" />
                <span className="font-medium">Daily Challenge</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{dailyChallenge.title}</h3>
              <div className="flex items-center gap-4 text-sm text-orange-200 mb-4">
                <span>{dailyChallenge.difficulty}</span>
                <span>•</span>
                <span>{dailyChallenge.time}</span>
                <span>•</span>
                <span>+{dailyChallenge.xp} XP</span>
              </div>
              <button className="w-full py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50">
                Start Challenge
              </button>
            </div>

            {/* Leaderboard Preview */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Top Learners</h3>
                <Link href="/leaderboard" className="text-green-500 text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Sarah Chen", xp: 5420, rank: 1 },
                  { name: "Mike Johnson", xp: 4890, rank: 2 },
                  { name: "You", xp: 2450, rank: 8, isUser: true },
                ].map((user) => (
                  <div
                    key={user.name}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      user.isUser ? "bg-green-500/20 border border-green-500/50" : "bg-gray-900"
                    }`}
                  >
                    <span className="text-gray-400 font-mono w-6">#{user.rank}</span>
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                      {user.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{user.name}</p>
                    </div>
                    <span className="text-sm text-gray-400">{user.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Path */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-4">Your Path</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300 text-sm line-through">HTML & CSS Basics</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300 text-sm line-through">JavaScript Fundamentals</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                  <span className="text-white text-sm font-medium">React for Beginners</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-500 text-sm">Advanced React Patterns</span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-500 text-sm">Full Stack Development</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
