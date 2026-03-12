'use client';

import React, { useState, useEffect } from 'react';
import { ReservationService, type Reservation } from '../../services';
import { Card, CardContent, CardHeader, CardTitle } from '@vayva/ui';
import { Badge } from '@vayva/ui';
import { Button } from '@vayva/ui';
import { 
  Calendar,
  Clock,
  Users,
  Phone,
  CheckCircle,
  XCircle,
  ClockIcon,
  UserPlus
} from 'lucide-react';

interface ReservationsTimelineProps {
  reservationService: ReservationService;
}

export function ReservationsTimeline({ reservationService }: ReservationsTimelineProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Mock data - in real implementation, this would come from the service
        const mockReservations: Reservation[] = [
          {
            id: '1',
            customerName: 'John Smith',
            partySize: 4,
            reservationTime: new Date(Date.now() + 3600000), // 1 hour from now
            tableNumber: '12',
            status: 'confirmed',
            phoneNumber: '+1234567890',
            specialRequests: 'Window seat preferred',
            createdAt: new Date(Date.now() - 86400000)
          },
          {
            id: '2',
            customerName: 'Sarah Johnson',
            partySize: 2,
            reservationTime: new Date(Date.now() + 7200000), // 2 hours from now
            tableNumber: '5',
            status: 'confirmed',
            phoneNumber: '+1987654321',
            createdAt: new Date(Date.now() - 43200000)
          },
          {
            id: '3',
            customerName: 'Mike Wilson',
            partySize: 6,
            reservationTime: new Date(Date.now() - 1800000), // 30 mins ago
            tableNumber: '18',
            status: 'seated',
            phoneNumber: '+1555123456',
            createdAt: new Date(Date.now() - 10800000)
          },
          {
            id: '4',
            customerName: 'Emily Davis',
            partySize: 3,
            reservationTime: new Date(Date.now() + 10800000), // 3 hours from now
            tableNumber: '8',
            status: 'pending',
            phoneNumber: '+1444987654',
            createdAt: new Date()
          },
          {
            id: '5',
            customerName: 'Robert Brown',
            partySize: 5,
            reservationTime: new Date(Date.now() - 3600000), // 1 hour ago
            tableNumber: '22',
            status: 'cancelled',
            phoneNumber: '+1333654321',
            cancellationReason: 'Family emergency',
            createdAt: new Date(Date.now() - 7200000)
          }
        ];
        
        setReservations(mockReservations);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
        setLoading(false);
      }
    };

    fetchReservations();
    // Poll for updates every 20 seconds
    const interval = setInterval(fetchReservations, 20000);
    return () => clearInterval(interval);
  }, [reservationService]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'seated':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'seated':
        return <Users className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatReservationTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatReservationDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const filteredReservations = reservations.filter(res => {
    const now = new Date();
    const reservationDate = new Date(res.reservationTime);
    
    switch (timeFilter) {
      case 'today':
        return reservationDate.toDateString() === now.toDateString();
      case 'week':
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return reservationDate >= now && reservationDate <= weekFromNow;
      case 'month':
        const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return reservationDate >= now && reservationDate <= monthFromNow;
      default:
        return true;
    }
  });

  const upcomingReservations = filteredReservations.filter(res => 
    new Date(res.reservationTime) > new Date()
  ).sort((a, b) => 
    new Date(a.reservationTime).getTime() - new Date(b.reservationTime).getTime()
  );

  const recentReservations = filteredReservations.filter(res => 
    new Date(res.reservationTime) <= new Date()
  ).sort((a, b) => 
    new Date(b.reservationTime).getTime() - new Date(a.reservationTime).getTime()
  );

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl border border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Calendar className="h-5 w-5" />
            Reservations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-orange-50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl border border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Calendar className="h-5 w-5" />
          Reservations Timeline
        </CardTitle>
        
        {/* Time Filters */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTimeFilter('today')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeFilter === 'today'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeFilter === 'week'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              timeFilter === 'month'
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            This Month
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Upcoming Reservations */}
          {upcomingReservations.length > 0 && (
            <div>
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming ({upcomingReservations.length})
              </h3>
              <div className="space-y-3">
                {upcomingReservations.map(reservation => (
                  <div 
                    key={reservation.id}
                    className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex-shrink-0 text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {formatReservationTime(new Date(reservation.reservationTime))}
                      </div>
                      <div className="text-xs text-orange-500">
                        {formatReservationDate(new Date(reservation.reservationTime))}
                      </div>
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-orange-900 truncate">
                          {reservation.customerName}
                        </h4>
                        <Badge className={getStatusColor(reservation.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(reservation.status)}
                            {reservation.status}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-orange-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Party of {reservation.partySize}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Table {reservation.tableNumber}</span>
                        </div>
                        {reservation.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {reservation.phoneNumber}
                          </div>
                        )}
                      </div>
                      
                      {reservation.specialRequests && (
                        <p className="text-xs text-orange-500 mt-1 italic">
                          "{reservation.specialRequests}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Seat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {recentReservations.length > 0 && (
            <div>
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Recent Activity ({recentReservations.length})
              </h3>
              <div className="space-y-3">
                {recentReservations.map(reservation => (
                  <div 
                    key={reservation.id}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border transition-colors
                      ${reservation.status === 'cancelled' 
                        ? 'bg-red-50 border-red-100' 
                        : reservation.status === 'seated'
                          ? 'bg-blue-50 border-blue-100'
                          : 'bg-green-50 border-green-100'
                      }
                    `}
                  >
                    <div className="flex-shrink-0 text-center">
                      <div className={`text-lg font-bold ${
                        reservation.status === 'cancelled' ? 'text-red-600' :
                        reservation.status === 'seated' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {formatReservationTime(new Date(reservation.reservationTime))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatReservationDate(new Date(reservation.reservationTime))}
                      </div>
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold truncate ${
                          reservation.status === 'cancelled' ? 'text-red-800' :
                          reservation.status === 'seated' ? 'text-blue-800' : 'text-green-800'
                        }`}>
                          {reservation.customerName}
                        </h4>
                        <Badge className={getStatusColor(reservation.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(reservation.status)}
                            {reservation.status}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Party of {reservation.partySize}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Table {reservation.tableNumber}</span>
                        </div>
                      </div>
                      
                      {reservation.cancellationReason && (
                        <p className="text-xs text-red-600 mt-1 italic">
                          Cancelled: {reservation.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredReservations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <Calendar className="h-12 w-12 mb-4 text-gray-300" />
              <p className="font-medium">No reservations found</p>
              <p className="text-sm">Check back later or adjust your filters</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}