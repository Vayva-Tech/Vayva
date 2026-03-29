"use client";

/**
 * Travel & Hospitality Dashboard - Main Page
 * Comprehensive travel booking and itinerary management platform
 * Theme: Sky Blue to Coral gradient
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Plane,
  Hotel,
  Car,
  Utensils,
  Activity,
  Clock,
  Star,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

// Types
interface DashboardStats {
  totalRevenue: number;
  activeBookings: number;
  pendingInquiries: number;
  averageBookingValue: number;
  customerSatisfaction: number;
  repeatCustomerRate: number;
  totalDestinations: number;
  activePackages: number;
}

interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  destination: string;
  type: "flight" | "hotel" | "package" | "tour";
  status: "confirmed" | "pending" | "processing" | "completed" | "cancelled";
  totalAmount: number;
  travelDate: string;
  createdAt: string;
}

interface PopularDestination {
  id: string;
  name: string;
  country: string;
  bookings: number;
  revenue: number;
  rating: number;
  imageUrl?: string;
}

interface UpcomingTrip {
  id: string;
  customerName: string;
  destination: string;
  departureDate: string;
  duration: number;
  travelers: number;
  status: "confirmed" | "pending" | "processing";
}

export default function TravelDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<UpcomingTrip[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchRecentBookings(),
        fetchPopularDestinations(),
        fetchUpcomingTrips(),
      ]);
    } catch (error) {
      logger.error("Failed to fetch travel dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiJson<{ data: DashboardStats }>("/travel/stats");
      setStats(response.data || null);
    } catch (error) {
      logger.warn("Failed to fetch travel stats", error);
      setStats(null);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const response = await apiJson<{ data: Booking[] }>("/travel/bookings?limit=10");
      setRecentBookings(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch recent bookings", error);
      setRecentBookings([]);
    }
  };

  const fetchPopularDestinations = async () => {
    try {
      const response = await apiJson<{ data: PopularDestination[] }>("/travel/destinations/popular?limit=5");
      setPopularDestinations(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch popular destinations", error);
      setPopularDestinations([]);
    }
  };

  const fetchUpcomingTrips = async () => {
    try {
      const response = await apiJson<{ data: UpcomingTrip[] }>("/travel/trips/upcoming?limit=5");
      setUpcomingTrips(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch upcoming trips", error);
      setUpcomingTrips([]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "pending":
      case "processing":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-4 w-4" />;
      case "hotel":
        return <Hotel className="h-4 w-4" />;
      case "package":
        return <MapPin className="h-4 w-4" />;
      case "tour":
        return <Utensils className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <ErrorBoundary serviceName="TravelDashboard">
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Travel & Hospitality Dashboard</h1>
            <p className="mt-1 text-gray-600">Manage bookings, packages, and traveler experiences</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/travel/analytics")}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => router.push("/dashboard/travel/bookings/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ErrorBoundary serviceName="TravelStatsCards">
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <StatCard
          title="Total Revenue"
          value={stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : "N/A"}
          icon={DollarSign}
          trend={"+12.5%"}
          description="This month"
          color="blue"
        />
        <StatCard
          title="Active Bookings"
          value={stats?.activeBookings?.toString() || "0"}
          icon={Calendar}
          trend={"+8.2%"}
          description="Current"
          color="sky"
        />
        <StatCard
          title="Pending Inquiries"
          value={stats?.pendingInquiries?.toString() || "0"}
          icon={Clock}
          trend="-3.1%"
          description="Needs response"
          color="orange"
        />
        <StatCard
          title="Avg Booking Value"
          value={stats?.averageBookingValue ? formatCurrency(stats.averageBookingValue) : "N/A"}
          icon={TrendingUp}
          trend={"+5.7%"}
          description="Per booking"
          color="green"
        />
        <StatCard
          title="Customer Satisfaction"
          value={stats?.customerSatisfaction?.toString() || "N/A"}
          icon={Star}
          trend={"+2.3%"}
          description="Out of 5"
          color="purple"
        />
        <StatCard
          title="Repeat Customers"
          value={stats?.repeatCustomerRate ? `${stats.repeatCustomerRate}%` : "N/A"}
          icon={Users}
          trend={"+4.1%"}
          description="Retention rate"
          color="indigo"
        />
        <StatCard
          title="Destinations"
          value={stats?.totalDestinations?.toString() || "0"}
          icon={MapPin}
          description="Available"
          color="teal"
        />
        <StatCard
          title="Active Packages"
          value={stats?.activePackages?.toString() || "0"}
          icon={Activity}
          description="Tour packages"
          color="coral"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
          <TabsTrigger value="destinations">Popular Destinations</TabsTrigger>
          <TabsTrigger value="trips">Upcoming Trips</TabsTrigger>
        </TabsList>

        {/* Recent Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>Latest travel bookings and reservations</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search bookings..."
                    className="w-64"
                    onChange={(e) => logger.info("Search bookings", e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => router.push("/dashboard/travel/bookings")}>View All</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <EmptyState
                  title="No bookings yet"
                  description="Start creating bookings to manage travel arrangements"
                  actionLabel="Create First Booking"
                  onAction={() => router.push("/dashboard/travel/bookings/new")}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Travel Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.bookingNumber}</TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{booking.destination}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getBookingTypeIcon(booking.type)}
                            <span className="capitalize">{booking.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(booking.totalAmount)}</TableCell>
                        <TableCell>{formatDate(booking.travelDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Popular Destinations Tab */}
        <TabsContent value="destinations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Popular Destinations</CardTitle>
                  <CardDescription>Top performing travel destinations by revenue</CardDescription>
                </div>
                <Button onClick={() => router.push("/dashboard/travel/destinations")}>View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {popularDestinations.length === 0 ? (
                <EmptyState
                  title="No destinations data"
                  description="Add destinations and track booking performance"
                  actionLabel="Add Destination"
                  onAction={() => router.push("/dashboard/travel/destinations/new")}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {popularDestinations.map((destination) => (
                    <Card key={destination.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{destination.name}</h3>
                              <p className="text-sm text-gray-600">{destination.country}</p>
                            </div>
                            <Badge variant="secondary">
                              <Star className="mr-1 h-3 w-3" />
                              {destination.rating}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-600">Total Bookings</p>
                              <p className="text-lg font-semibold">{destination.bookings}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Revenue</p>
                              <p className="text-lg font-semibold text-green-600">{formatCurrency(destination.revenue)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Trips Tab */}
        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Trips</CardTitle>
                  <CardDescription>Scheduled departures and travel itineraries</CardDescription>
                </div>
                <Button onClick={() => router.push("/dashboard/travel/itineraries")}>View Calendar</Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingTrips.length === 0 ? (
                <EmptyState
                  title="No upcoming trips"
                  description="Plan and schedule travel itineraries for customers"
                  actionLabel="Plan Trip"
                  onAction={() => router.push("/dashboard/travel/itineraries/new")}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Travelers</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">{trip.customerName}</TableCell>
                        <TableCell>{trip.destination}</TableCell>
                        <TableCell>{formatDate(trip.departureDate)}</TableCell>
                        <TableCell>{trip.duration} days</TableCell>
                        <TableCell>{trip.travelers} travelers</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(trip.status)}>{trip.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          title="Create Package"
          description="Build a new travel package"
          icon={Package}
          onClick={() => router.push("/dashboard/travel/packages/new")}
        />
        <QuickActionCard
          title="Manage Suppliers"
          description="Hotels, airlines, guides"
          icon={Users}
          onClick={() => router.push("/dashboard/travel/suppliers")}
        />
        <QuickActionCard
          title="View Analytics"
          description="Performance insights"
          icon={TrendingUp}
          onClick={() => router.push("/dashboard/travel/analytics")}
        />
        <QuickActionCard
          title="Marketing Campaigns"
          description="Promotions and offers"
          icon={Activity}
          onClick={() => router.push("/dashboard/travel/marketing")}
        />
      </div>
    </div>
  );
}

// Sub-components

interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  trend?: string;
  description?: string;
  color?: string;
}

function StatCard({ title, value, icon: Icon, trend, description, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color || "gray"}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 ${trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
            {trend} {description && `• ${description}`}
          </p>
        )}
        {description && !trend && <p className="text-xs text-gray-600 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-96 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-8">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
      </ErrorBoundary>
    </div>
      </ErrorBoundary>
  );
}

// Missing icon
function Package({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

// DATA INTEGRATION NOTES - TRAVEL DASHBOARD:
// Required API Endpoints:
// - GET /api/travel/stats - Dashboard statistics
// - GET /api/travel/bookings - Booking management
// - GET /api/travel/destinations - Destination database
// - GET /api/travel/packages - Tour packages
// - GET /api/travel/suppliers - Hotels, airlines, guides
// - GET /api/travel/customers - Traveler CRM
// - GET /api/travel/payments - Payment processing
// - GET /api/travel/itineraries - Trip planning
// - GET /api/travel/analytics - Performance analytics
// - GET /api/travel/marketing - Promotions & campaigns
