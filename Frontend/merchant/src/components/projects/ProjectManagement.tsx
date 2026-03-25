/**
 * Project Management Dashboard
 * Task tracking, team collaboration, and project oversight
 */
"use client";

import { Button } from "@vayva/ui";
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Folder,
  Clipboard,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Flag,
  Bell,
  Plus,
  MagnifyingGlass as Search,
  Funnel as Filter,
  TrendUp as TrendingUp,
  ChartBar as BarChart3,
  ChartPie as PieChart,
  Pulse as Activity,
  User,
  Tag,
  Paperclip,
  ChatCircle as MessageCircle,
  Eye
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate?: string;
  deadline?: string;
  progress: number; // 0-100
  budget?: number;
  spent?: number;
  team: TeamMember[];
  tasks: Task[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  assignedTasks: number;
  completedTasks: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: number;
  comments: number;
  createdAt: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'missed';
  tasksCompleted: number;
  totalTasks: number;
}

interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  teamUtilization: number;
  avgProjectDuration: number;
}

// Helper functions used across sub-components
function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'planning': return 'bg-blue-100 text-blue-800';
    case 'on-hold': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-purple-100 text-purple-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getTaskStatusIcon(status: string) {
  switch (status) {
    case 'done': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'in-progress': return <Activity className="h-5 w-5 text-blue-500" />;
    case 'review': return <Eye className="h-5 w-5 text-purple-500" />;
    case 'blocked': return <Flag className="h-5 w-5 text-red-500" />;
    default: return <Circle className="h-5 w-5 text-gray-300" />;
  }
}

// Main Project Management Component
export default function ProjectManagement() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'team' | 'analytics'>('projects');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch project metrics
  const { data: metrics, isLoading: metricsLoading } = useSWR<ProjectMetrics | null>(
    '/api/projects/metrics',
    async (url: string) => {
      try {
        const response = await apiJson<ProjectMetrics>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch project metrics:', error);
        toast.error('Failed to load project management data');
        return null;
      }
    }
  );

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useSWR<Project[]>(
    '/api/projects',
    async (url: string) => {
      try {
        const response = await apiJson<{ projects: Project[] }>(url);
        return response.projects || [];
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        return [];
      }
    }
  );

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useSWR<Task[]>(
    '/api/projects/tasks',
    async (url: string) => {
      try {
        const response = await apiJson<{ tasks: Task[] }>(url);
        return response.tasks || [];
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
      }
    }
  );

  // Filter projects based on search
  const filteredProjects = projects?.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const tabs = [
    { id: 'projects', label: 'Projects', icon: <Folder className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <Clipboard className="h-4 w-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Project Management"
        subtitle="Track projects, manage tasks, and coordinate team efforts"
        industry={store?.industrySlug || 'default'}
        icon={<Folder className="h-8 w-8" />}
      />

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      {!metricsLoading && metrics && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {metrics.activeProjects}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Folder className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {metrics.completedProjects}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <CheckCircle className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Team Utilization</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  {metrics.teamUtilization}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}15` }}>
                <Users className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Task Completion</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Clipboard className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search projects, tasks, or team members..."
          className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'projects' && (
        <ProjectsView 
          projects={filteredProjects}
          loading={projectsLoading}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />
      )}
      
      {activeTab === 'tasks' && (
        <TasksView 
          tasks={tasks || []}
          loading={tasksLoading}
        />
      )}
      
      {activeTab === 'team' && (
        <TeamView />
      )}
      
      {activeTab === 'analytics' && (
        <AnalyticsView metrics={metrics ?? null} loading={metricsLoading} />
      )}
    </div>
  );
}

// Projects View Component
function ProjectsView({ projects, loading, selectedProject, onSelectProject }: any) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {projects.map((project: Project, index: number) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard 
            industry={store?.industrySlug || 'default'}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProject === project.id ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => onSelectProject(project.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2">{project.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{project.team.length} team members</span>
              <span>{project.tasks.length} tasks</span>
            </div>
            
            {project.deadline && (
              <div className="flex items-center gap-2 text-sm mb-3">
                <Calendar className="h-4 w-4" />
                <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm">
                {project.budget && (
                  <span>
                    Budget: ${(project.spent || 0).toLocaleString()}/${project.budget.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex -space-x-2">
                {project.team.slice(0, 3).map((member: TeamMember) => (
                  <div key={member.id} className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-accent/20 rounded-full flex items-center justify-center border-2 border-background">
                    <span className="text-xs font-bold" style={{ color: getThemeColors(store?.industrySlug || 'default').primary }}>
                      {member.name.charAt(0)}
                    </span>
                  </div>
                ))}
                {project.team.length > 3 && (
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border-2 border-background">
                    <span className="text-xs">+{project.team.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Tasks View Component
function TasksView({ tasks, loading }: { tasks: Task[]; loading: boolean }) {
  const { store } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTasks = statusFilter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === statusFilter);

  const statusOptions = [
    { id: 'all', label: 'All Tasks' },
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex gap-2">
        {statusOptions.map(option => (
          <Button
            key={option.id}
            onClick={() => setStatusFilter(option.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === option.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="space-y-4">
          {filteredTasks.map((task: Task, index: number) => (
            <motion.div
              key={task.id}
              className="p-4 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  {getTaskStatusIcon(task.status)}
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  {task.assignee && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{task.assignee}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>{task.tags.join(', ')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {task.attachments > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-4 w-4" />
                      <span>{task.attachments}</span>
                    </div>
                  )}
                  {task.comments > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{task.comments}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );
}

// Team View Component
function TeamView() {
  const { store } = useStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1,2,3,4,5,6].map(i => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: getThemeColors(store?.industrySlug || 'default').primary }}>
                  {['Alex', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Riley'][i-1].charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{'Alex Johnson Taylor Jordan Morgan Casey Riley'.split(' ')[i-1]}</h3>
              <p className="text-sm text-gray-500 mb-4">{'Developer Designer Project Manager'.split(' ')[i % 3]}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned:</span>
                  <span className="font-medium">{Math.floor(Math.random() * 15) + 5} tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed:</span>
                  <span className="font-medium text-green-600">{Math.floor(Math.random() * 12) + 3} tasks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Utilization:</span>
                  <span className="font-medium">{Math.floor(Math.random() * 40) + 60}%</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">Weekly Capacity</p>
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ metrics, loading }: { metrics: ProjectMetrics | null; loading: boolean }) {
  const { store } = useStore();

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Analytics Chart */}
      <div className="lg:col-span-2">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-6">Project Performance Trends</h3>
          <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl border border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <p className="font-medium">Project Completion Rates</p>
              <p className="text-sm text-gray-500 mt-1">
                Active: {metrics.activeProjects} | Completed: {metrics.completedProjects} | Overdue: {metrics.overdueProjects}
              </p>
            </div>
          </div>
        </ThemedCard>
      </div>

      {/* Metrics Sidebar */}
      <div className="space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Project Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Projects</span>
              <span className="font-bold">{metrics.totalProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Active Projects</span>
              <span className="font-bold text-blue-600">{metrics.activeProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Completed</span>
              <span className="font-bold text-green-600">{metrics.completedProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Avg Duration</span>
              <span className="font-bold">{metrics.avgProjectDuration} days</span>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Team Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Team Utilization</span>
                <span>{metrics.teamUtilization}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${metrics.teamUtilization}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Task Completion</span>
                <span>{metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: metrics.totalTasks > 0 ? `${(metrics.completedTasks / metrics.totalTasks) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
              New Project
            </Button>
            <Button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Assign Tasks
            </Button>
            <Button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Generate Report
            </Button>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}