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
  ArrowRightOnRectangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Property {
  id: string;
  name: string;
  type: 'hotel' | 'resort' | 'motel' | 'bnb';
  address: string;
  city: string;
  country: string;
  rooms: number;
  occupiedRooms: number;
  dailyRate: number;
  occupancyRate: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  image: string;
}

export default function PropertyManagementDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    averageOccupancy: 0,
    totalRevenue: 0,
    pendingReviews: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch properties
      const propertiesResponse = await fetch('/api/staysavvy/properties');
      const propertiesData = await propertiesResponse.json();
      
      if (propertiesData.success) {
        setProperties(propertiesData.properties);
        
        // Calculate stats
        const totalRooms = propertiesData.properties.reduce((sum: number, p: Property) => sum + p.rooms, 0);
        const occupiedRooms = propertiesData.properties.reduce((sum: number, p: Property) => sum + p.occupiedRooms, 0);
        const averageOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
        const totalRevenue = propertiesData.properties.reduce((sum: number, p: Property) => sum + (p.occupiedRooms * p.dailyRate), 0);
        
        setStats({
          totalProperties: propertiesData.properties.length,
          totalRooms,
          occupiedRooms,
          averageOccupancy,
          totalRevenue,
          pendingReviews: 12 // Mock data
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  const PropertyCard = ({ property }: { property: Property }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={property.image} 
          alt={property.name}
          className="w-full h-32 object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            property.isPublished 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.isPublished ? 'Live' : 'Draft'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            property.isActive 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {property.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{property.name}</h3>
          <div className="flex items-center">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="ml-1 text-xs font-medium text-gray-700">
              {property.rating}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-xs mb-3 truncate">
          {property.city}, {property.country}
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <span className="text-gray-500">Rooms:</span>
            <span className="font-medium ml-1">{property.rooms}</span>
          </div>
          <div>
            <span className="text-gray-500">Occupied:</span>
            <span className="font-medium ml-1">{property.occupiedRooms}</span>
          </div>
          <div>
            <span className="text-gray-500">Rate:</span>
            <span className="font-medium ml-1">${property.dailyRate}/night</span>
          </div>
          <div>
            <span className="text-gray-500">Occupancy:</span>
            <span className="font-medium ml-1">{property.occupancyRate}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {property.type.toUpperCase()}
          </span>
          
          <div className="flex space-x-1">
            <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <EyeIcon className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
              <PencilIcon className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
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
              <Link href="/staysavvy" className="flex items-center space-x-2">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">StaySavvy Manager</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Property Management Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage all your properties and monitor performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Properties" 
            value={stats.totalProperties} 
            icon={BuildingOfficeIcon}
          />
          <StatCard 
            title="Total Rooms" 
            value={stats.totalRooms} 
            icon={HomeIcon}
            subtitle={`${stats.occupiedRooms} occupied`}
          />
          <StatCard 
            title="Avg. Occupancy" 
            value={`${stats.averageOccupancy}%`} 
            icon={ChartBarIcon}
          />
          <StatCard 
            title="Daily Revenue" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            icon={CreditCardIcon}
          />
          <StatCard 
            title="Pending Reviews" 
            value={stats.pendingReviews} 
            icon={ChatBubbleLeftRightIcon}
          />
          <StatCard 
            title="Avg. Rating" 
            value="4.6" 
            icon={UserGroupIcon}
            subtitle="Across all properties"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/staysavvy/properties/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-green-100 rounded-lg mb-2">
                <PlusIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Add Property</span>
            </Link>
            
            <Link 
              href="/staysavvy/bookings"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-blue-100 rounded-lg mb-2">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Bookings</span>
            </Link>
            
            <Link 
              href="/staysavvy/rates"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-purple-100 rounded-lg mb-2">
                <CogIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Rate Management</span>
            </Link>
            
            <Link 
              href="/staysavvy/reports"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 bg-orange-100 rounded-lg mb-2">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </Link>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
            <Link 
              href="/staysavvy/properties"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All Properties
            </Link>
          </div>
          
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first property</p>
              <Link 
                href="/staysavvy/properties/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Property
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}