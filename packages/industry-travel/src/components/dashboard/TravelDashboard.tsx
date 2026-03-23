// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { cn , Card, CardContent, CardHeader, CardTitle , Badge , Button } from '@vayva/ui';
import { useTravelDashboardData } from '../../hooks/useTravelDashboardData';
import { 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Star,
  Globe,
  DollarSign,
  Bed,
  Home,
  Plane,
  Car,
  Waves,
  Sun,
  RefreshCw
} from 'lucide-react';

// Theme types
type TravelTheme = 'ocean-breeze' | 'tropical-sunset' | 'mountain-retreat' | 'urban-chic' | 'coastal-luxury';

interface TravelDashboardProps {
  theme?: TravelTheme;
  className?: string;
}

const TravelDashboard: React.FC<TravelDashboardProps> = ({ 
  theme = 'ocean-breeze',
  className 
}) => {
  const [activeTheme, setActiveTheme] = useState<TravelTheme>(theme);
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);
  
  // Get real data from hook
  const {
    occupancyMetrics,
    revenueReport,
    guestDemographics,
    properties,
    recentReviews,
    isLoading,
    error,
    refreshAll,
    subscribeToUpdates
  } = useTravelDashboardData(tenantId);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      // Trigger re-render when data updates
      console.log('Dashboard data updated');
    });

    return unsubscribe;
  }, [subscribeToUpdates]);

  // Theme configuration
  const themeClasses = {
    'ocean-breeze': 'bg-gradient-to-br from-blue-50 to-cyan-50',
    'tropical-sunset': 'bg-gradient-to-br from-orange-50 to-yellow-50',
    'mountain-retreat': 'bg-gradient-to-br from-green-50 to-stone-100',
    'urban-chic': 'bg-gradient-to-br from-indigo-50 to-purple-50',
    'coastal-luxury': 'bg-gradient-to-br from-cyan-50 to-teal-50'
  };

  const themeColors = {
    'ocean-breeze': {
      primary: '#4A90E2',
      secondary: '#00B4D8',
      accent: '#FF6B35'
    },
    'tropical-sunset': {
      primary: '#FF6B35',
      secondary: '#F4D35E',
      accent: '#FF8E72'
    },
    'mountain-retreat': {
      primary: '#059669',
      secondary: '#8B7355',
      accent: '#D4A574'
    },
    'urban-chic': {
      primary: '#6366F1',
      secondary: '#EC4899',
      accent: '#8B5CF6'
    },
    'coastal-luxury': {
      primary: '#0891B2',
      secondary: '#14B8A6',
      accent: '#F59E0B'
    }
  };

  const currentTheme = themeColors[activeTheme];

  // Derived data from real services
  const occupancyData = occupancyMetrics ? {
    todayCheckIns: Math.floor(occupancyMetrics.currentRate * 0.3), // Simulated
    tonightOccupancy: occupancyMetrics.currentRate,
    availableUnits: Math.floor((100 - occupancyMetrics.currentRate) * 0.8), // Simulated
    avgDailyRate: revenueReport?.averageDailyRate || 0,
    adrTrend: occupancyMetrics.trend === 'increasing' ? '+8%' : 
              occupancyMetrics.trend === 'decreasing' ? '-5%' : '0%',
    occupancyTrend: '+12%' // Simulated
  } : null;

  // Simulate upcoming reservations from real properties
  const upcomingReservations = properties.slice(0, 3).map((property, index) => ({
    id: property.id,
    date: `Mar ${15 + index}`,
    guest: `Guest ${index + 1}`,
    property: property.name,
    nights: 3 + index,
    status: index === 0 ? 'Confirmed' : index === 1 ? 'Pending' : 'Confirmed',
    action: index === 0 ? 'Check-in' : index === 1 ? 'Approve' : 'Prepare'
  }));

  const marketingChannels = [
    { name: 'Booking.com', percentage: 45, color: 'bg-blue-500' },
    { name: 'Airbnb', percentage: 28, color: 'bg-green-500' },
    { name: 'Direct', percentage: 18, color: 'bg-purple-500' },
    { name: 'Expedia', percentage: 9, color: 'bg-orange-500' }
  ];

  // Simulate housekeeping status from real data
  const housekeepingStatus = {
    clean: properties.length * 4, // Simulated
    inProgress: Math.floor(properties.length * 1.5), // Simulated
    pending: properties.length * 2, // Simulated
    maintenance: Math.floor(properties.length * 0.5) // Simulated
  };

  // Transform guest demographics data
  const transformedDemographics = guestDemographics?.byCountry.slice(0, 5).map((countryData, index) => {
    const flags = ['🇺🇸', '🇬🇧', '🇩🇪', '🇫🇷', '🇦🇺'];
    return {
      country: countryData.country,
      percentage: countryData.percentage,
      flag: flags[index] || '🌍'
    };
  }) || [];

  return (
    <div className={cn(
      "min-h-screen p-6",
      themeClasses[activeTheme],
      className
    )}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              VAYVA TRAVEL - Premium Glass Design
            </h1>
            <div className="flex space-x-4">
              <Button variant="ghost" className="font-medium">Dashboard</Button>
              <Button variant="ghost">Bookings</Button>
              <Button variant="ghost">Properties</Button>
              <Button variant="ghost">Guests</Button>
              <Button variant="ghost">Marketing</Button>
              <Button variant="ghost">Finance</Button>
              <Button variant="ghost">Settings</Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-6 h-6 text-gray-600" />
            <Badge variant="default">12 Notifications</Badge>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <Button 
            onClick={refreshAll} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Active Bookings Overview */}
      {!isLoading && !error && occupancyData && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              ACTIVE BOOKINGS OVERVIEW
            </h2>
            <Button 
              onClick={refreshAll} 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Today's Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{occupancyData.todayCheckIns}</div>
                <p className="text-sm text-green-600 mt-1">▲ 18% vs last week</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tonight's Occupancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{occupancyData.tonightOccupancy}%</div>
                <p className="text-sm text-green-600 mt-1">▲ {occupancyData.availableUnits} units available</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Daily Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">${occupancyData.avgDailyRate}/night</div>
                <p className="text-sm text-green-600 mt-1">{occupancyData.adrTrend} vs last month</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Property Occupancy Map */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            PROPERTY OCCUPANCY MAP
          </h2>
          <Card className="glass-effect border-0 shadow-lg h-96">
            <CardContent className="p-6">
              <div className="bg-gray-200 rounded-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive Map with Pins</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div> Full (8)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div> Limited (12)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div> Available (24)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div> Event (4)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Calendar View */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            CALENDAR VIEW
          </h2>
          <Card className="glass-effect border-0 shadow-lg h-96">
            <CardContent className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-8 flex items-center justify-center text-sm rounded",
                        i < 5 ? "bg-gray-200" : 
                        i > 15 && i < 22 ? "bg-blue-200" : 
                        "bg-white border"
                      )}
                    >
                      {i >= 5 ? ((i - 5) % 31) + 1 : ''}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 mr-1"></div> Booked</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-gray-300 mr-1"></div> Available</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-yellow-300 mr-1"></div> Maintenance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Revenue Analytics and Guest Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Analytics */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            REVENUE ANALYTICS
          </h2>
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="h-64 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Monthly Revenue Trend</p>
                  <div className="text-2xl font-bold text-gray-800">$180K</div>
                  <div className="flex justify-center space-x-8 mt-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">ADR: ${occupancyData.avgDailyRate}</div>
                      <div className="text-xs text-gray-600">Avg Daily Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">RevPAR: $225</div>
                      <div className="text-xs text-gray-600">Revenue per Available Room</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Guest Demographics */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            GUEST DEMOGRAPHICS
          </h2>
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="h-64">
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Guest Origin Map</h3>
                  <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-32 flex items-center justify-center">
                    <Globe className="w-8 h-8 text-gray-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Top Countries</h3>
                  <div className="space-y-2">
                    {guestDemographics.map((country, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">{country.flag}</span>
                          <span className="text-sm">{country.country}</span>
                        </div>
                        <span className="text-sm font-medium">{country.percentage}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">Repeat Guest Rate: <span className="font-medium">{guestDemographics?.repeatGuests || 0}%</span></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Upcoming Reservations */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          UPCOMING RESERVATIONS
        </h2>
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nights</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {upcomingReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.guest}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.property}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reservation.nights} nights</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={reservation.status === 'Confirmed' ? 'success' : 'warning'}
                          className={reservation.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {reservation.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button size="sm" variant="outline">
                          {reservation.action}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Marketing Performance and Housekeeping Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Marketing Performance */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            MARKETING PERFORMANCE
          </h2>
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Channel Performance</h3>
              <div className="space-y-3">
                {marketingChannels.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{channel.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${channel.color} h-2 rounded-full`} 
                          style={{ width: `${channel.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm w-8">{channel.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <p className="text-lg font-semibold">3.2%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Booking Value</p>
                    <p className="text-lg font-semibold">$1,247</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Housekeeping Status */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            HOUSEKEEPING STATUS
          </h2>
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">{housekeepingStatus.clean}</p>
                  <p className="text-sm text-green-600">Clean</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{housekeepingStatus.inProgress}</p>
                  <p className="text-sm text-blue-600">In Progress</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-700">{housekeepingStatus.pending}</p>
                  <p className="text-sm text-yellow-600">Pending</p>
                </div>
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <Waves className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-700">{housekeepingStatus.maintenance}</p>
                  <p className="text-sm text-gray-600">Maintenance</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Priority Cleaning List</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><Sun className="w-4 h-4 text-orange-500 mr-2" /> Suite 201 - Check-in 3:00 PM</li>
                  <li className="flex items-center"><Sun className="w-4 h-4 text-orange-500 mr-2" /> Villa 15 - Check-in 4:00 PM</li>
                  <li className="flex items-center"><AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" /> Room 304 - Deep clean needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Guest Reviews and Seasonal Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Guest Reviews */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            GUEST REVIEWS
          </h2>
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 4.7 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-lg font-semibold">4.7/5</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Cleanliness</p>
                  <p className="font-medium">4.8 ⭐</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">4.9 ⭐</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Communication</p>
                  <p className="font-medium">4.6 ⭐</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="font-medium">4.5 ⭐</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-2">Recent Review</h3>
                <p className="text-sm italic">"Amazing property with stunning ocean views. The host was incredibly responsive and the place was spotless!"</p>
                <p className="text-xs text-gray-600 mt-1">- Jennifer, 5★ (2 days ago)</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Seasonal Insights */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            SEASONAL INSIGHTS
          </h2>
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Peak Season Forecast</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Next 30 days:</span> 89% occupancy</p>
                  <p className="text-sm"><span className="font-medium">Revenue projection:</span> $245K</p>
                  <p className="text-sm"><span className="font-medium">Recommended rate increase:</span> <span className="text-green-600">+15%</span></p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-800 mb-3">Low Season Strategy</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Jun-Aug:</span> 45% avg occupancy</p>
                  <p className="text-sm">Promotional packages recommended</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside mt-2">
                    <li>Early bird discounts</li>
                    <li>Extended stay packages</li>
                    <li>Last-minute deals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Theme Selector */}
      <div className="fixed bottom-6 right-6">
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Theme</h3>
            <div className="flex space-x-2">
              {Object.keys(themeColors).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => setActiveTheme(themeKey as TravelTheme)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2",
                    activeTheme === themeKey ? 'border-gray-800' : 'border-gray-300'
                  )}
                  style={{ backgroundColor: themeColors[themeKey as TravelTheme].primary }}
                  title={themeKey.replace('-', ' ')}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default TravelDashboard;