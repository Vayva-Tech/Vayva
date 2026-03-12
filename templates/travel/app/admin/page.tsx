'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  HomeIcon,
  UserGroupIcon,
  CreditCardIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProperties: number;
  totalBookings: number;
  pendingBookings: number;
  revenue: number;
  occupancyRate: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'inquiry';
  title: string;
  description: string;
  time: string;
  status: 'new' | 'processing' | 'completed';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0,
    occupancyRate: 0,
    averageRating: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/admin/activity');
      const activityData = await activityResponse.json();
      
      if (activityData.success) {
        setRecentActivity(activityData.activity);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    change?: string 
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'new': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'booking': return <CalendarIcon className="h-5 w-5 text-blue-600" />;
        case 'review': return <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />;
        case 'inquiry': return <UserGroupIcon className="h-5 w-5 text-green-600" />;
        default: return <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />;
      }
    };

    return (
      <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex-shrink-0 mt-1">
          {getTypeIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
          <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
            </span>
            <span className="ml-2 text-xs text-gray-400">{activity.time}</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-2">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Travel Admin</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-800">JD</span>
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back! Here's what's happening with your properties today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Properties" 
            value={stats.totalProperties} 
            icon={BuildingOfficeIcon}
            change="+2"
          />
          <StatCard 
            title="Active Bookings" 
            value={stats.totalBookings} 
            icon={CalendarIcon}
            change="+12%"
          />
          <StatCard 
            title="Pending Reviews" 
            value={stats.pendingBookings} 
            icon={ChatBubbleLeftRightIcon}
            change="-3"
          />
          <StatCard 
            title="Monthly Revenue" 
            value={`$${stats.revenue.toLocaleString()}`} 
            icon={CreditCardIcon}
            change="+18%"
          />
          <StatCard 
            title="Occupancy Rate" 
            value={`${stats.occupancyRate}%`} 
            icon={ChartBarIcon}
            change="+5%"
          />
          <StatCard 
            title="Avg. Rating" 
            value={stats.averageRating.toFixed(1)} 
            icon={UserGroupIcon}
            change="+0.2"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 text-center">
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View all activity
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  href="/admin/properties/new"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Add New Property</span>
                </Link>
                
                <Link 
                  href="/admin/bookings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">Manage Bookings</span>
                </Link>
                
                <Link 
                  href="/admin/reviews"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Review Management</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Arrivals</h2>
              <div className="space-y-4">
                {[
                  { guest: 'Sarah Johnson', date: 'Today, 3:00 PM', room: 'Deluxe King' },
                  { guest: 'Mike Chen', date: 'Tomorrow, 11:00 AM', room: 'Standard Queen' },
                  { guest: 'Emma Wilson', date: 'Dec 15, 2:00 PM', room: 'Suite' }
                ].map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guest}</p>
                      <p className="text-sm text-gray-500">{booking.room}</p>
                    </div>
                    <span className="text-sm text-gray-600">{booking.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}