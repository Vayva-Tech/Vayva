'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MountainIcon,
  MapIcon,
  CalendarIcon,
  UsersIcon,
  StarIcon,
  DollarSignIcon,
  ClockIcon,
  TrendingUpIcon,
  TrophyIcon,
  ShieldCheckIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface AdventureTour {
  id: string;
  name: string;
  destination: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // days
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  rating: number;
  reviewCount: number;
  departureDates: string[];
  highlights: string[];
  included: string[];
  excluded: string[];
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  image: string;
}

export default function AdventurePackageManager() {
  const router = useRouter();
  const [tours, setTours] = useState<AdventureTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTours: 0,
    activeTours: 0,
    upcomingDepartures: 0,
    totalParticipants: 0,
    averageRating: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchAdventureData();
  }, []);

  const fetchAdventureData = async () => {
    try {
      const toursResponse = await fetch('/api/campout/tours');
      const toursData = await toursResponse.json();
      
      if (toursData.success) {
        setTours(toursData.tours);
        
        // Calculate stats
        const activeTours = toursData.tours.filter((t: AdventureTour) => t.isActive).length;
        const totalParticipants = toursData.tours.reduce((sum: number, t: AdventureTour) => sum + t.currentParticipants, 0);
        const averageRating = toursData.tours.length > 0 
          ? (toursData.tours.reduce((sum: number, t: AdventureTour) => sum + t.rating, 0) / toursData.tours.length).toFixed(1)
          : '0.0';
        const totalRevenue = toursData.tours.reduce((sum: number, t: AdventureTour) => sum + (t.currentParticipants * t.price), 0);
        
        setStats({
          totalTours: toursData.tours.length,
          activeTours,
          upcomingDepartures: 12, // Mock data
          totalParticipants,
          averageRating: parseFloat(averageRating),
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching adventure data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, subtitle }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    subtitle?: string 
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const TourCard = ({ tour }: { tour: AdventureTour }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={tour.image} 
          alt={tour.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-3 right-3 flex space-x-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            tour.isPublished 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {tour.isPublished ? 'Published' : 'Draft'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            tour.isActive 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {tour.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{tour.name}</h3>
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-xs font-medium text-gray-700">
              {tour.rating}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-xs mb-3 truncate">{tour.destination}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <span className="text-gray-500">Duration:</span>
            <span className="font-medium ml-1">{tour.duration} days</span>
          </div>
          <div>
            <span className="text-gray-500">Price:</span>
            <span className="font-medium ml-1">${tour.price}</span>
          </div>
          <div>
            <span className="text-gray-500">Participants:</span>
            <span className="font-medium ml-1">{tour.currentParticipants}/{tour.maxParticipants}</span>
          </div>
          <div>
            <span className="text-gray-500">Difficulty:</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tour.difficulty)} ml-1`}>
              {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex space-x-1">
            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <EyeIcon className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
              <PencilIcon className="h-4 w-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500">
            {tour.departureDates.length} departures
          </span>
        </div>
      </div>
    </div>
  );

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
              <Link href="/campout" className="flex items-center space-x-2">
                <MountainIcon className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">CampOut Adventures</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <ClockIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-green-800">AD</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Adventure Manager</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Adventure Package Management</h1>
          <p className="mt-1 text-gray-600">Manage your outdoor adventure tours and expeditions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Tours" 
            value={stats.totalTours} 
            icon={MountainIcon}
          />
          <StatCard 
            title="Active Tours" 
            value={stats.activeTours} 
            icon={TrendingUpIcon}
            subtitle={`${stats.upcomingDepartures} upcoming`}
          />
          <StatCard 
            title="Total Participants" 
            value={stats.totalParticipants} 
            icon={UsersIcon}
          />
          <StatCard 
            title="Avg. Rating" 
            value={stats.averageRating} 
            icon={StarIcon}
            subtitle="Across all tours"
          />
          <StatCard 
            title="Total Revenue" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            icon={DollarSignIcon}
          />
          <StatCard 
            title="Safety Record" 
            value="100%" 
            icon={ShieldCheckIcon}
            subtitle="Incident free"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/campout/adventures/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-green-100 rounded-lg mb-2">
                <PlusIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">New Adventure</span>
            </Link>
            
            <Link 
              href="/campout/adventures/schedule"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-blue-100 rounded-lg mb-2">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Schedule Tours</span>
            </Link>
            
            <Link 
              href="/campout/adventures/bookings"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-purple-100 rounded-lg mb-2">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Bookings</span>
            </Link>
            
            <Link 
              href="/campout/adventures/reports"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-orange-100 rounded-lg mb-2">
                <TrophyIcon className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Performance Reports</span>
            </Link>
          </div>
        </div>

        {/* Tours Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Adventure Tours</h2>
            <Link 
              href="/campout/adventures"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              View All Tours
            </Link>
          </div>
          
          {tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MountainIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No adventure tours yet</h3>
              <p className="text-gray-500 mb-6">Create your first outdoor adventure experience</p>
              <Link 
                href="/campout/adventures/new"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Adventure Tour
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}