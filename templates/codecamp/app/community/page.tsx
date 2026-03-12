"use client";

import { MessageSquare, Heart, Share2, Users, TrendingUp, Clock, Search, Filter, Plus, Code, BookOpen, Zap, Award } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const discussions = [
  {
    id: 1,
    title: "Best way to learn React hooks?",
    author: "Sarah Chen",
    avatar: "👩‍💻",
    category: "React",
    replies: 24,
    likes: 156,
    views: 1205,
    time: "2 hours ago",
    isHot: true,
  },
  {
    id: 2,
    title: "Stuck on JavaScript closures - need help!",
    author: "Mike Johnson",
    avatar: "👨‍💻",
    category: "JavaScript",
    replies: 18,
    likes: 89,
    views: 678,
    time: "4 hours ago",
    isHot: false,
  },
  {
    id: 3,
    title: "Share your portfolio projects!",
    author: "Alex Rivera",
    avatar: "👩‍💻",
    category: "Showcase",
    replies: 56,
    likes: 234,
    views: 2100,
    time: "6 hours ago",
    isHot: true,
  },
  {
    id: 4,
    title: "Python vs JavaScript for beginners?",
    author: "Emma Watson",
    avatar: "👩‍💻",
    category: "General",
    replies: 45,
    likes: 178,
    views: 1890,
    time: "8 hours ago",
    isHot: true,
  },
];

const studyGroups = [
  { name: "React Mastery", members: 234, active: true, topic: "React" },
  { name: "Python Developers", members: 456, active: true, topic: "Python" },
  { name: "Frontend Friends", members: 678, active: false, topic: "Frontend" },
  { name: "Full Stack Crew", members: 345, active: true, topic: "Full Stack" },
];

const leaderboard = [
  { rank: 1, name: "David Kim", xp: 12500, streak: 45, avatar: "👨‍💻" },
  { rank: 2, name: "Lisa Park", xp: 11200, streak: 38, avatar: "👩‍💻" },
  { rank: 3, name: "James Chen", xp: 10800, streak: 42, avatar: "👨‍💻" },
  { rank: 4, name: "You", xp: 2450, streak: 12, avatar: "🧑‍💻", isUser: true },
];

const categories = ["All", "JavaScript", "React", "Python", "CSS", "General", "Showcase", "Career"];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDiscussions = discussions.filter((d) => {
    const matchesCategory = selectedCategory === "All" || d.category === selectedCategory;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              <Link href="/community" className="text-green-400 font-medium">Community</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white">
              <Zap className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Community</h1>
          <p className="text-gray-400 text-xl">Connect, learn, and grow with fellow developers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold text-white">12,500+</p>
            <p className="text-gray-400">Active Members</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold text-white">3,200+</p>
            <p className="text-gray-400">Discussions</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
            <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-3xl font-bold text-white">890+</p>
            <p className="text-gray-400">Daily Challenges</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search discussions..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="w-4 h-4" />
                New Post
              </button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedCategory === cat
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Discussions */}
            <div className="space-y-4">
              {filteredDiscussions.map((post) => (
                <div key={post.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl shrink-0">
                      {post.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          {post.category}
                        </span>
                        {post.isHot && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Hot
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 hover:text-green-400 cursor-pointer">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.time}
                        </span>
                        <span>•</span>
                        <span>{post.views} views</span>
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-green-400">
                          <MessageSquare className="w-4 h-4" />
                          {post.replies} replies
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-red-400">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Study Groups */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Study Groups</h3>
                <Link href="/groups" className="text-green-500 text-sm hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {studyGroups.map((group) => (
                  <div key={group.name} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-lg">
                      {group.topic === "React" && "⚛️"}
                      {group.topic === "Python" && "🐍"}
                      {group.topic === "Frontend" && "🎨"}
                      {group.topic === "Full Stack" && "🥞"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{group.name}</h4>
                      <p className="text-xs text-gray-400">{group.members} members</p>
                    </div>
                    {group.active && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700">
                Join a Group
              </button>
            </div>

            {/* Leaderboard */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="font-bold text-white mb-4">Top Learners</h3>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div
                    key={user.name}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      user.isUser ? "bg-green-500/20 border border-green-500/50" : "bg-gray-900"
                    }`}
                  >
                    <span className={`font-bold w-6 ${
                      user.rank === 1 ? "text-yellow-400" :
                      user.rank === 2 ? "text-gray-300" :
                      user.rank === 3 ? "text-orange-400" :
                      "text-gray-500"
                    }`}>
                      #{user.rank}
                    </span>
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.xp.toLocaleString()} XP</p>
                    </div>
                    {user.streak > 30 && (
                      <span className="text-orange-500 text-sm">🔥 {user.streak}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-2">Weekly Code Challenge</h3>
              <p className="text-green-100 text-sm mb-4">
                Join our live coding session this Friday at 6PM EST
              </p>
              <button className="w-full py-2 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50">
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
