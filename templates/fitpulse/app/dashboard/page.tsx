"use client";

import { Activity, Flame, Heart, Trophy, Timer, Calendar, ChevronRight, Play, Star, User, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const stats = {
  calories: 2840,
  steps: 12450,
  heartRate: 72,
  sleep: 7.5,
  streak: 8,
};

const workouts = [
  { id: 1, name: "HIIT Cardio Blast", duration: "25 min", calories: 350, level: "Intermediate", icon: "🔥", completed: true },
  { id: 2, name: "Morning Yoga Flow", duration: "30 min", calories: 180, level: "Beginner", icon: "🧘", completed: false },
  { id: 3, name: "Strength Training", duration: "45 min", calories: 420, level: "Advanced", icon: "💪", completed: false },
];

const challenges = [
  { name: "30-Day Cardio", participants: 2340, days: 12, totalDays: 30, reward: "Gold Badge" },
  { name: "10K Steps Daily", participants: 5670, days: 8, totalDays: 7, reward: "Streak Master" },
];

const nutrition = {
  calories: { consumed: 1850, goal: 2200 },
  protein: { consumed: 85, goal: 140 },
  carbs: { consumed: 180, goal: 250 },
  fat: { consumed: 55, goal: 70 },
};

const achievements = [
  { name: "Early Bird", description: "Workout before 7 AM", earned: true, icon: "🌅" },
  { name: "Water Warrior", description: "Log water 7 days in a row", earned: true, icon: "💧" },
  { name: "Marathon Runner", description: "Run 42km total", earned: false, icon: "🏃" },
  { name: "Yoga Master", description: "Complete 50 yoga sessions", earned: false, icon: "🧘" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FitPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/workouts" className="text-gray-300 hover:text-white">Workouts</Link>
              <Link href="/nutrition" className="text-gray-300 hover:text-white">Nutrition</Link>
              <Link href="/challenges" className="text-gray-300 hover:text-white">Challenges</Link>
              <Link href="/community" className="text-gray-300 hover:text-white">Community</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-300">{stats.streak} day streak</span>
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Good morning, John! 💪</h1>
            <p className="text-gray-400">You&apos;re on fire! Keep that {stats.streak}-day streak alive!</p>
          </div>
          <button className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600">
            Start Workout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-gray-400 text-sm">Calories</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.calories.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Burned today</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="text-gray-400 text-sm">Steps</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.steps.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Daily goal: 10K</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-gray-400 text-sm">Heart Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.heartRate}</p>
            <p className="text-xs text-gray-500">BPM average</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">Sleep</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.sleep}h</p>
            <p className="text-xs text-gray-500">Last night</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-400 text-sm">Streak</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.streak}</p>
            <p className="text-xs text-gray-500">Days active</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Workouts */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Today&apos;s Workouts</h2>
                <Link href="/workouts" className="text-orange-500 hover:underline text-sm">View All</Link>
              </div>
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <div key={workout.id} className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl hover:bg-gray-700 transition-colors">
                    <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center text-3xl">
                      {workout.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{workout.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span>{workout.duration}</span>
                        <span>•</span>
                        <span>{workout.calories} cal</span>
                        <span>•</span>
                        <span className={`${
                          workout.level === "Beginner" ? "text-green-400" :
                          workout.level === "Intermediate" ? "text-yellow-400" :
                          "text-red-400"
                        }`}>{workout.level}</span>
                      </div>
                    </div>
                    <button className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      workout.completed ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"
                    }`}>
                      {workout.completed ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Tracking */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Nutrition Today</h2>
                <Link href="/nutrition" className="text-orange-500 hover:underline text-sm">Log Meal</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(nutrition).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-gray-900 rounded-xl">
                    <p className="text-gray-400 text-sm capitalize mb-1">{key}</p>
                    <p className="text-xl font-bold text-white">{value.consumed}</p>
                    <p className="text-xs text-gray-500">/ {value.goal}g</p>
                    <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min((value.consumed / value.goal) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Achievements</h2>
                <Link href="/achievements" className="text-orange-500 hover:underline text-sm">View All</Link>
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
            {/* Challenges */}
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-4">Active Challenges</h3>
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.name} className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{challenge.name}</span>
                      <span className="text-sm text-orange-200">Day {challenge.days}</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full mb-2">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${(challenge.days / challenge.totalDays) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-orange-200">{challenge.participants.toLocaleString()} participants</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50">
                Join Challenge
              </button>
            </div>

            {/* Weekly Progress */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-4">Weekly Activity</h3>
              <div className="flex items-end justify-between h-32">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const heights = [60, 80, 40, 90, 70, 100, 85];
                  return (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <div
                        className="w-8 bg-orange-500 rounded-t"
                        style={{ height: `${heights[i]}px` }}
                      />
                      <span className="text-xs text-gray-400">{day}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-gray-400 text-sm mt-4">
                5 workouts this week
              </p>
            </div>

            {/* Goals */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-4">Weekly Goals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Cardio (150 min)</span>
                    <span className="text-white">120/150</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Strength (3 sessions)</span>
                    <span className="text-white">2/3</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: "67%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Calories (14K)</span>
                    <span className="text-white">10.5K/14K</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
