'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          icon: ClockIcon, 
          color: 'text-yellow-600 bg-yellow-100',
          label: 'Pending'
        };
      case 'confirmed':
        return { 
          icon: CheckCircleIcon, 
          color: 'text-green-600 bg-green-100',
          label: 'Confirmed'
        };
      case 'checked_in':
        return { 
          icon: UserIcon, 
          color: 'text-blue-600 bg-blue-100',
          label: 'Checked In'
        };
      case 'completed':
        return { 
          icon: CheckCircleIcon, 
          color: 'text-purple-600 bg-purple-100',
          label: 'Completed'
        };
      case 'cancelled':
        return { 
          icon: XCircleIcon, 
          color: 'text-red-600 bg-red-100',
          label: 'Cancelled'
        };
      default:
        return { 
          icon: ClockIcon, 
          color: 'text-gray-600 bg-gray-100',
          label: 'Unknown'
        };
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const BookingRow = ({ booking }: { booking: Booking }) => {
    const statusInfo = getStatusInfo(booking.status);
    const StatusIcon = statusInfo.icon;
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div>
            <p className="font-medium text-gray-900">{booking.guestName}</p>
            <p className="text-sm text-gray-500">{booking.guestEmail}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div>
            <p className="font-medium text-gray-900">{booking.propertyName}</p>
            <p className="text-sm text-gray-500">
              {booking.adults + booking.children} guests
            </p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div>
            <p className="text-sm text-gray-900">{formatDate(booking.checkInDate)}</p>
            <p className="text-xs text-gray-500">{formatTime(booking.checkInDate)}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div>
            <p className="text-sm text-gray-900">{formatDate(booking.checkOutDate)}</p>
            <p className="text-xs text-gray-500">{formatTime(booking.checkOutDate)}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className={`p-1 rounded-full ${statusInfo.color}`}>
              <StatusIcon className="h-4 w-4" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              {statusInfo.label}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="font-medium text-gray-900">
              {booking.totalAmount.toFixed(2)} {booking.currency}
            </span>
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end space-x-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View
            </button>
            {booking.status === 'pending' && (
              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                Confirm
              </button>
            )}
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                Cancel
              </button>
            )}
          </div>
        </td>
      </tr>
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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
              <p className="mt-1 text-gray-600">Manage your property reservations</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Export CSV
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                New Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'blue' },
            { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'yellow' },
            { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'green' },
            { label: 'Revenue', value: `$${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}`, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
              More Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No bookings have been made yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}