"use client";

import Header from "@/components/Header";
import { Trophy, Clock, Users, ChevronRight, Award, Target, Zap, Calendar, Plus } from "lucide-react";
import Link from "next/link";

const activeChallenges = [
  {
    id: 1,
    title: "Monthly 3D Modeling Challenge: Vehicles",
    description: "Create a photorealistic vehicle render. Any type welcome: cars, aircraft, spacecraft, or boats.",
    thumbnail: "vehicle",
    difficulty: "Intermediate",
    participants: 892,
    daysLeft: 12,
    prize: "$1,000 + Software License",
    sponsor: "Chaos Group",
    submissions: 234,
    isFeatured: true,
  },
  {
    id: 2,
    title: "Particle Effects Showdown",
    description: "Create stunning particle simulations using Houdini or Blender. Fire, smoke, magic, or abstract.",
    thumbnail: "particles",
    difficulty: "Advanced",
    participants: 445,
    daysLeft: 8,
    prize: "$500 + Online Course Bundle",
    sponsor: "Rebelway",
    submissions: 128,
  },
  {
    id: 3,
    title: "Beginner's First Render Contest",
    description: "Perfect for newcomers! Create your best still render using any software. Mentors will provide feedback.",
    thumbnail: "beginner",
    difficulty: "Beginner",
    participants: 1234,
    daysLeft: 21,
    prize: "Hardware Bundle + Mentorship",
    sponsor: "Wacom",
    submissions: 567,
    isNew: true,
  },
];

const pastWinners = [
  {
    id: 1,
    challenge: "Character Design Challenge",
    winner: "@CharacterMaster",
    project: "Cyberpunk Samurai",
    likes: 2347,
    image: "samurai",
  },
  {
    id: 2,
    challenge: "Architectural Visualization",
    winner: "@ArchViz_Pro",
    project: "Futuristic Cityscape",
    likes: 1892,
    image: "city",
  },
  {
    id: 3,
    challenge: "Motion Graphics Loop",
    winner: "@MotionWizard",
    project: "Abstract Flow",
    likes: 1567,
    image: "abstract",
  },
];

const leaderboard = [
  { rank: 1, name: "@RenderKing", points: 12450, challenges: 12, wins: 3 },
  { rank: 2, name: "@VFX_Master", points: 11230, challenges: 10, wins: 2 },
  { rank: 3, name: "@3D_Queen", points: 10890, challenges: 11, wins: 2 },
  { rank: 4, name: "@MotionPro", points: 9450, challenges: 9, wins: 1 },
  { rank: 5, name: "@ArtisticSoul", points: 8920, challenges: 8, wins: 1 },
];

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Challenges" }]} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="px-6 py-16 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">Compete, Learn, Win</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Creative Challenges
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Push your skills to the limit. Compete with artists worldwide, get feedback from pros, and win amazing prizes.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn-primary">Browse Active Challenges</button>
            <button className="btn-secondary">View Leaderboard</button>
          </div>
        </div>
      </div>

      <div className="px-6 py-12 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">156</div>
            <div className="text-gray-500 text-sm">Challenges Hosted</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">45.2K</div>
            <div className="text-gray-500 text-sm">Submissions</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">$125K</div>
            <div className="text-gray-500 text-sm">Prizes Awarded</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">8.9K</div>
            <div className="text-gray-500 text-sm">Active Participants</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Active Challenges */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Active Challenges</h2>
                <Link href="/challenges/archive" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  View Archive <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-6">
                {activeChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`card overflow-hidden ${challenge.isFeatured ? 'ring-2 ring-yellow-500' : ''}`}
                  >
                    <div className="grid md:grid-cols-3 gap-0">
                      {/* Image */}
                      <div className="relative h-48 md:h-auto bg-gradient-to-br from-gray-700 to-gray-900">
                        {challenge.isFeatured && (
                          <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                            FEATURED
                          </div>
                        )}
                        {challenge.isNew && (
                          <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            NEW
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            challenge.difficulty === "Beginner" ? "bg-green-100 text-green-700" :
                            challenge.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6 md:col-span-1 border-l border-r border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {challenge.description}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Trophy className="w-4 h-4" />
                            {challenge.prize}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Zap className="w-4 h-4" />
                            Sponsored by {challenge.sponsor}
                          </div>
                        </div>
                      </div>

                      {/* Stats & CTA */}
                      <div className="p-6 bg-gray-50 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              {challenge.participants} participants
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                              <Target className="w-4 h-4" />
                              {challenge.submissions} submissions
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {challenge.daysLeft} days left
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 space-y-2">
                          <button className="w-full btn-primary">Join Challenge</button>
                          <button className="w-full btn-secondary">View Rules</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Winners */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Winners</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pastWinners.map((winner) => (
                  <div key={winner.id} className="card overflow-hidden group cursor-pointer">
                    <div className="h-40 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-white/30" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-gray-500">{winner.challenge}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{winner.project}</h4>
                      <p className="text-sm text-gray-500 mb-2">by {winner.winner}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span className="text-red-500">♥</span>
                        {winner.likes} likes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Leaderboard */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Top Challengers</h3>
              </div>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                      user.rank === 2 ? "bg-gray-100 text-gray-700" :
                      user.rank === 3 ? "bg-orange-100 text-orange-700" :
                      "bg-gray-50 text-gray-500"
                    }`}>
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.points.toLocaleString()} pts • {user.wins} wins</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900">
                View Full Leaderboard →
              </button>
            </div>

            {/* Quick Stats */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Challenges Joined</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Submissions</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wins</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points</span>
                  <span className="font-medium text-gray-900">0</span>
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Coming Soon</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Animation Marathon</div>
                    <div className="text-xs text-gray-500">Starts in 5 days</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">VR Experience Design</div>
                    <div className="text-xs text-gray-500">Starts in 12 days</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="card p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <h3 className="font-semibold mb-2">Have an idea?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Suggest a challenge topic or sponsor one yourself.
              </p>
              <button className="w-full py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Propose Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
