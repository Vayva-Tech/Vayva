/**
 * Fitness Dashboard - Bookings & Events Archetype
 * 
 * For: Gyms, Fitness Studios, Yoga Centers, CrossFit Boxes
 * 
 * Features:
 * - Membership management
 * - Class scheduling
 * - Trainer assignments
 * - Attendance tracking
 * - Member progress analytics (PRO+)
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { Dumbbell, Users, TrendingUp, Calendar, Activity, Award } from 'lucide-react';

export function FitnessDashboard() {
  const { isVisible: showAdvancedAnalytics } = useModuleVisibility(
    'advanced-analytics',
    { industry: 'fitness', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const membershipData = [
    { month: 'Jan', members: 345 },
    { month: 'Feb', members: 378 },
    { month: 'Mar', members: 412 },
    { month: 'Apr', members: 398 },
    { month: 'May', members: 456 },
    { month: 'Jun', members: 523 },
  ];

  const classDistribution = [
    { label: 'CrossFit', value: 35, color: '#ef4444' },
    { label: 'Yoga', value: 25, color: '#10b981' },
    { label: 'HIIT', value: 20, color: '#f59e0b' },
    { label: 'Spin', value: 12, color: '#3b82f6' },
    { label: 'Personal Training', value: 8, color: '#8b5cf6' },
  ];

  return (
    <UnifiedDashboard industry="fitness" planTier="PRO" designCategory="bookings">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active Members"
          value="523"
          change={22}
          trend="up"
          icon={<Users size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Monthly Revenue"
          value="₦2.8M"
          change={18}
          trend="up"
          icon={<TrendingUp size={16} className="text-blue-600" />}
        />
        
        <MetricCard
          label="Class Attendance"
          value="87%"
          change={5}
          trend="up"
          icon={<Calendar size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Member Retention"
          value="91%"
          change={3}
          trend="up"
          icon={<Award size={16} className="text-orange-600" />}
        />
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Today's Class Schedule
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Schedule Class
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Class</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trainer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Room</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Capacity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Booked</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '6:00 AM', class: 'Morning Yoga', trainer: 'Amara', room: 'Studio A', capacity: 30, booked: 24 },
                { time: '8:00 AM', class: 'CrossFit WOD', trainer: 'Chidi', room: 'Main Floor', capacity: 25, booked: 25 },
                { time: '12:00 PM', class: 'HIIT Blast', trainer: 'Bola', room: 'Studio B', capacity: 20, booked: 18 },
                { time: '5:00 PM', class: 'Spin Class', trainer: 'Tunde', room: 'Spin Room', capacity: 15, booked: 12 },
                { time: '7:00 PM', class: 'Power Yoga', trainer: 'Ngozi', room: 'Studio A', capacity: 30, booked: 28 },
              ].map((cls, idx) => {
                const fillPercentage = (cls.booked / cls.capacity) * 100;
                const isFull = cls.booked >= cls.capacity;
                
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{cls.time}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{cls.class}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{cls.trainer}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{cls.room}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{cls.capacity}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isFull ? 'bg-red-500' : fillPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${fillPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{cls.booked}/{cls.capacity}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Membership Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-emerald-600" />
            Membership Growth
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {membershipData.map(month => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                    style={{ height: `${(month.members / 550) * 100}%` }}
                  />
                  <span className="text-xs text-gray-600">{month.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Class Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes by Type</h3>
          <DonutChart data={classDistribution} size={200} />
          <div className="mt-4 space-y-2">
            {classDistribution.map(cls => (
              <div key={cls.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="text-gray-700">{cls.label}</span>
                </div>
                <span className="font-medium text-gray-900">{cls.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Member Milestones */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Dumbbell size={20} className="text-purple-600" />
            Member Achievements This Week
          </h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          <AchievementRow
            member="Chioma O."
            achievement="100 Classes Completed"
            category="milestone"
            date="Today"
          />
          <AchievementRow
            member="Emeka A."
            achievement="First Pull-up"
            category="personal-record"
            date="Yesterday"
          />
          <AchievementRow
            member="Blessing N."
            achievement="30-Day Streak"
            category="consistency"
            date="2 days ago"
          />
          <AchievementRow
            member="Tunde K."
            achievement="Weight Loss Goal"
            category="transformation"
            date="3 days ago"
          />
        </div>
      </div>

      {/* Trainer Performance */}
      <FeatureGate minPlan="PRO_PLUS">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award size={20} className="text-orange-600" />
              Trainer Performance Analytics
            </h3>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              PRO+ Feature
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TrainerCard
              name="Chidi"
              specialty="CrossFit"
              avgAttendance={24}
              rating={4.9}
              retentionRate={95}
            />
            <TrainerCard
              name="Amara"
              specialty="Yoga"
              avgAttendance={26}
              rating={4.8}
              retentionRate={92}
            />
            <TrainerCard
              name="Bola"
              specialty="HIIT"
              avgAttendance={19}
              rating={4.7}
              retentionRate={89}
            />
          </div>
        </div>
      </FeatureGate>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

interface AchievementRowProps {
  member: string;
  achievement: string;
  category: string;
  date: string;
}

function AchievementRow({ member, achievement, category, date }: AchievementRowProps) {
  const categoryColors: Record<string, string> = {
    milestone: 'bg-blue-100 text-blue-800',
    'personal-record': 'bg-green-100 text-green-800',
    consistency: 'bg-purple-100 text-purple-800',
    transformation: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryColors[category] || 'bg-gray-100'}`}>
          <Award size={20} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{member}</p>
          <p className="text-sm text-gray-600">{achievement}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors[category] || 'bg-gray-100'}`}>
          {category.replace('-', ' ').toUpperCase()}
        </span>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
    </div>
  );
}

interface TrainerCardProps {
  name: string;
  specialty: string;
  avgAttendance: number;
  rating: number;
  retentionRate: number;
}

function TrainerCard({ name, specialty, avgAttendance, rating, retentionRate }: TrainerCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-1">{name}</h4>
      <p className="text-xs text-gray-600 mb-3">{specialty}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Avg Attendance</span>
          <span className="font-medium text-gray-900">{avgAttendance}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Rating</span>
          <span className="font-medium text-gray-900">⭐ {rating}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Retention</span>
          <span className="font-medium text-gray-900">{retentionRate}%</span>
        </div>
      </div>
    </div>
  );
}
