"use client";

import Header from "@/components/Header";
import { MessageSquare, Search, TrendingUp, Users, Clock, ChevronRight, Plus, ThumbsUp, Eye } from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "All Topics", count: 2847 },
  { name: "General Discussion", count: 523 },
  { name: "Course Help", count: 892 },
  { name: "Showcase", count: 234 },
  { name: "Career Advice", count: 156 },
  { name: "Technical Issues", count: 445 },
  { name: "Inspiration", count: 198 },
  { name: "Off Topic", count: 399 },
];

const trendingTopics = [
  {
    id: 1,
    title: "What's your favorite Blender addon in 2024?",
    author: "@3D_Artist_99",
    category: "General Discussion",
    replies: 127,
    views: 2847,
    likes: 89,
    lastReply: "2 hours ago",
    isHot: true,
  },
  {
    id: 2,
    title: "Showcase: My first photorealistic car render - feedback welcome!",
    author: "@NewbieRenderer",
    category: "Showcase",
    replies: 45,
    views: 1234,
    likes: 234,
    lastReply: "4 hours ago",
    isHot: true,
  },
  {
    id: 3,
    title: "How do you stay motivated during long rendering times?",
    author: "@PatientArtist",
    category: "General Discussion",
    replies: 67,
    views: 1567,
    likes: 56,
    lastReply: "6 hours ago",
  },
  {
    id: 4,
    title: "Career transition: From graphic design to 3D artist - my journey",
    author: "@CareerChanger",
    category: "Career Advice",
    replies: 89,
    views: 3421,
    likes: 312,
    lastReply: "8 hours ago",
    isPinned: true,
  },
  {
    id: 5,
    title: "Houdini vs Blender for VFX - an honest comparison",
    author: "@VFX_Pro",
    category: "Technical Issues",
    replies: 234,
    views: 8923,
    likes: 445,
    lastReply: "12 hours ago",
    isHot: true,
  },
];

const recentDiscussions = [
  {
    id: 6,
    title: "Help with Maya rigging - joint orientation issues",
    author: "@RiggingNoob",
    category: "Course Help",
    replies: 12,
    views: 234,
    likes: 3,
    lastReply: "30 mins ago",
    isNew: true,
  },
  {
    id: 7,
    title: "Looking for critique on my motion reel",
    author: "@MotionNewbie",
    category: "Showcase",
    replies: 8,
    views: 456,
    likes: 23,
    lastReply: "1 hour ago",
  },
  {
    id: 8,
    title: "Best resources for learning Unreal Engine from scratch?",
    author: "@GameDevAspirant",
    category: "Course Help",
    replies: 34,
    views: 1234,
    likes: 67,
    lastReply: "2 hours ago",
  },
];

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Forum" }]} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="px-6 py-12 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
              <p className="text-gray-400">Connect with 25,000+ creative professionals</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Discussion
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-8 text-center">
            <div>
              <div className="text-2xl font-bold">2,847</div>
              <div className="text-gray-400 text-sm">Topics</div>
            </div>
            <div>
              <div className="text-2xl font-bold">12.4K</div>
              <div className="text-gray-400 text-sm">Replies</div>
            </div>
            <div>
              <div className="text-2xl font-bold">892</div>
              <div className="text-gray-400 text-sm">Online Now</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.name
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === category.name ? "bg-white/20" : "bg-gray-100"
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Trending Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Trending Now</h2>
              </div>

              <div className="space-y-3">
                {trendingTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Vote */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <ThumbsUp className="w-4 h-4 text-gray-400" />
                        </button>
                        <span className="text-sm font-medium text-gray-700">{topic.likes}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                              Pinned
                            </span>
                          )}
                          {topic.isHot && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                              Hot
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{topic.category}</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 hover:text-gray-700">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{topic.author}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {topic.replies} replies
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {topic.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {topic.lastReply}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Discussions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Discussions</h2>
              <div className="space-y-3">
                {recentDiscussions.map((topic) => (
                  <div
                    key={topic.id}
                    className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <ThumbsUp className="w-4 h-4 text-gray-400" />
                        </button>
                        <span className="text-sm font-medium text-gray-700">{topic.likes}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isNew && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">
                              New
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{topic.category}</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 hover:text-gray-700">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{topic.author}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {topic.replies} replies
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {topic.lastReply}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Top Contributors */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {[
                  { name: "@VFX_Master", posts: 234, avatar: "VM" },
                  { name: "@BlenderGuru", posts: 198, avatar: "BG" },
                  { name: "@MotionQueen", posts: 156, avatar: "MQ" },
                  { name: "@3D_Wizard", posts: 134, avatar: "3W" },
                  { name: "@RenderPro", posts: 112, avatar: "RP" },
                ].map((user, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-5">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.posts} posts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Community</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Members
                  </span>
                  <span className="font-medium text-gray-900">25,432</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Today&apos;s Posts
                  </span>
                  <span className="font-medium text-gray-900">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Avg. Response Time
                  </span>
                  <span className="font-medium text-gray-900">2.4 hours</span>
                </div>
              </div>
            </div>

            {/* Forum Rules */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Be respectful and constructive
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Share your knowledge freely
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Give credit to sources
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  No spam or self-promotion
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
