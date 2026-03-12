'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CrownIcon,
  SparklesIcon,
  CalendarIcon,
  UsersIcon,
  StarIcon,
  DollarSignIcon,
  ClockIcon,
  MapPinIcon,
  ChefHatIcon,
  WineIcon,
  CameraIcon,
  GiftIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface LuxuryExperience {
  id: string;
  name: string;
  category: 'dining' | 'spa' | 'activities' | 'events' | 'concierge';
  price: number;
  duration: number; // minutes
  capacity: number;
  currentBookings: number;
  rating: number;
  reviewCount: number;
  description: string;
  highlights: string[];
  exclusions: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  image: string;
}

export default function LuxuryExperienceManager() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<LuxuryExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExperiences: 0,
    activeExperiences: 0,
    featuredExperiences: 0,
    totalBookings: 0,
    averageRating: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchLuxuryData();
  }, []);

  const fetchLuxuryData = async () => {
    try {
      const experiencesResponse = await fetch('/api/hospitality/experiences');
      const experiencesData = await experiencesResponse.json();
      
      if (experiencesData.success) {
        setExperiences(experiencesData.experiences);
        
        // Calculate stats
        const activeExperiences = experiencesData.experiences.filter((e: LuxuryExperience) => e.isActive).length;
        const featuredExperiences = experiencesData.experiences.filter((e: LuxuryExperience) => e.isFeatured).length;
        const totalBookings = experiencesData.experiences.reduce((sum: number, e: LuxuryExperience) => sum + e.currentBookings, 0);
        const averageRating = experiencesData.experiences.length > 0 
          ? (experiencesData.experiences.reduce((sum: number, e: LuxuryExperience) => sum + e.rating, 0) / experiencesData.experiences.length).toFixed(1)
          : '0.0';
        const totalRevenue = experiencesData.experiences.reduce((sum: number, e: LuxuryExperience) => sum + (e.currentBookings * e.price), 0);
        
        setStats({
          totalExperiences: experiencesData.experiences.length,
          activeExperiences,
          featuredExperiences,
          totalBookings,
          averageRating: parseFloat(averageRating),
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Error fetching luxury data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dining': return 'bg-red-100 text-red-800';
      case 'spa': return 'bg-pink-100 text-pink-800';
      case 'activities': return 'bg-blue-100 text-blue-800';
      case 'events': return 'bg-purple-100 text-purple-800';
      case 'concierge': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dining': return ChefHatIcon;
      case 'spa': return SparklesIcon;
      case 'activities': return CameraIcon;
      case 'events': return GiftIcon;
      case 'concierge': return CrownIcon;
      default: return StarIcon;
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
        <div className="p-3 bg-amber-50 rounded-lg">
          <Icon className="h-6 w-6 text-amber-600" />
        </div>
      </div>
    </div>
  );

  const ExperienceCard = ({ experience }: { experience: LuxuryExperience }) => {
    const CategoryIcon = getCategoryIcon(experience.category);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          <img 
            src={experience.image} 
            alt={experience.name}
            className="w-full h-40 object-cover"
          />
          <div className="absolute top-3 right-3 flex space-x-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              experience.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {experience.isActive ? 'Active' : 'Inactive'}
            </span>
            {experience.isFeatured && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{experience.name}</h3>
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-xs font-medium text-gray-700">
                {experience.rating}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-xs mb-3 line-clamp-2">{experience.description}</p>
          
          <div className="flex items-center mb-3">
            <CategoryIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(experience.category)}`}>
              {experience.category.charAt(0).toUpperCase() + experience.category.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="font-medium ml-1">{experience.duration} mins</span>
            </div>
            <div>
              <span className="text-gray-500">Price:</span>
              <span className="font-medium ml-1">${experience.price}</span>
            </div>
            <div>
              <span className="text-gray-500">Capacity:</span>
              <span className="font-medium ml-1">{experience.currentBookings}/{experience.capacity}</span>
            </div>
            <div>
              <span className="text-gray-500">Bookings:</span>
              <span className="font-medium ml-1">{experience.currentBookings}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex space-x-1">
              <button className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors">
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
              {experience.reviewCount} reviews
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
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
              <Link href="/hospitality" className="flex items-center space-x-2">
                <CrownIcon className="h-8 w-8 text-amber-600" />
                <span className="text-xl font-bold text-gray-900">Luxury Concierge</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <ClockIcon className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-amber-800">LC</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Concierge Manager</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Luxury Experience Management</h1>
          <p className="mt-1 text-gray-600">Curate exceptional experiences for discerning guests</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Experiences" 
            value={stats.totalExperiences} 
            icon={SparklesIcon}
          />
          <StatCard 
            title="Active Experiences" 
            value={stats.activeExperiences} 
            icon={StarIcon}
            subtitle={`${stats.featuredExperiences} featured`}
          />
          <StatCard 
            title="Total Bookings" 
            value={stats.totalBookings} 
            icon={UsersIcon}
          />
          <StatCard 
            title="Avg. Rating" 
            value={stats.averageRating} 
            icon={StarIcon}
            subtitle="Guest satisfaction"
          />
          <StatCard 
            title="Total Revenue" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            icon={DollarSignIcon}
          />
          <StatCard 
            title="VIP Services" 
            value="24/7" 
            icon={CrownIcon}
            subtitle="Round-the-clock concierge"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Concierge Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/hospitality/experiences/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-amber-100 rounded-lg mb-2">
                <PlusIcon className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">New Experience</span>
            </Link>
            
            <Link 
              href="/hospitality/reservations"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-blue-100 rounded-lg mb-2">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Reservations</span>
            </Link>
            
            <Link 
              href="/hospitality/guests"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-purple-100 rounded-lg mb-2">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">VIP Guest List</span>
            </Link>
            
            <Link 
              href="/hospitality/reports"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-green-100 rounded-lg mb-2">
                <DollarSignIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Performance Reports</span>
            </Link>
          </div>
        </div>

        {/* Experiences Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Luxury Experiences</h2>
            <Link 
              href="/hospitality/experiences"
              className="text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              View All Experiences
            </Link>
          </div>
          
          {experiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CrownIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No luxury experiences yet</h3>
              <p className="text-gray-500 mb-6">Create your first premium guest experience</p>
              <Link 
                href="/hospitality/experiences/new"
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Luxury Experience
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}