"use client";

import { LayoutDashboard, Zap, Users, Settings, BarChart3, FileText, Bell, Search, Plus, MoreVertical, TrendingUp, ArrowUpRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const stats = [
  { label: "Total Tasks", value: "1,234", change: "+12%", trend: "up" },
  { label: "Completed", value: "892", change: "+8%", trend: "up" },
  { label: "In Progress", value: "234", change: "-2%", trend: "down" },
  { label: "Team Members", value: "24", change: "+4", trend: "up" },
];

const recentTasks = [
  { id: 1, title: "Update landing page design", status: "in_progress", priority: "high", assignee: "Sarah", dueDate: "Today" },
  { id: 2, title: "Fix authentication bug", status: "completed", priority: "urgent", assignee: "Mike", dueDate: "Yesterday" },
  { id: 3, title: "Write API documentation", status: "pending", priority: "medium", assignee: "Alex", dueDate: "Tomorrow" },
  { id: 4, title: "Review pull requests", status: "in_progress", priority: "low", assignee: "You", dueDate: "Today" },
];

const activities = [
  { user: "Sarah Chen", action: "completed", target: "Q4 Planning", time: "2 min ago", avatar: "👩‍💼" },
  { user: "Mike Johnson", action: "commented on", target: "API Integration", time: "15 min ago", avatar: "👨‍💼" },
  { user: "Emily Davis", action: "created", target: "New Project: Website Redesign", time: "1 hour ago", avatar: "👩‍💻" },
  { user: "Alex Rivera", action: "assigned you to", target: "Bug Fix #234", time: "2 hours ago", avatar: "👨‍💻" },
];

const projects = [
  { name: "Website Redesign", progress: 65, tasks: "13/20", status: "active" },
  { name: "Mobile App v2.0", progress: 30, tasks: "6/20", status: "active" },
  { name: "API Integration", progress: 90, tasks: "18/20", status: "review" },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
                <span className="text-xl font-bold text-gray-900">SaaSFlow</span>
              </Link>
              <div className="hidden md:flex items-center gap-1 ml-8">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  placeholder="Search tasks, projects..."
                  className="px-3 py-2 text-sm focus:outline-none w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  Y
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen hidden lg:block">
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              <Plus className="w-5 h-5" />
              New Task
            </button>
          </div>
          <nav className="px-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5" />
              Projects
            </Link>
            <Link href="/team" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Users className="w-5 h-5" />
              Team
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5" />
              Analytics
            </Link>
            <Link href="/integrations" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Zap className="w-5 h-5" />
              Integrations
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </nav>

          <div className="p-4 mt-8">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Your Projects</h3>
            <div className="space-y-2">
              {projects.map((project) => (
                <Link
                  key={project.name}
                  href={`/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <span>{project.name}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    project.status === 'active' ? 'bg-green-500' :
                    project.status === 'review' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Here&apos;s what&apos;s happening with your projects today.</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <span className={`text-sm flex items-center gap-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Tasks */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                      <Link href="/tasks" className="text-indigo-600 text-sm hover:underline">View All</Link>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                        <button className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.status === 'completed' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                        }`}>
                          {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                            <span>Due {task.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                            {task.assignee[0]}
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Project Progress</h2>
                    <Link href="/projects" className="text-indigo-600 text-sm hover:underline">Manage</Link>
                  </div>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{project.name}</span>
                          <span className="text-sm text-gray-500">{project.tasks}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Activity */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {activities.map((activity, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm shrink-0">
                          {activity.avatar}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span>{" "}
                            <span className="text-gray-500">{activity.action}</span>{" "}
                            <span className="font-medium">{activity.target}</span>
                          </p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
                  <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
                  <p className="text-indigo-200 text-sm mb-4">
                    Get unlimited projects, advanced analytics, and priority support.
                  </p>
                  <button className="w-full py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50">
                    View Plans
                  </button>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API</span>
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Webhooks</span>
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Operational
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
