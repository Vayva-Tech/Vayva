'use client';

import { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FlagIcon,
  ReplyIcon
} from '@heroicons/react/24/outline';

interface Review {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  sentimentScore: number;
  helpfulCount: number;
  photos: string[];
  createdAt: string;
  response?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
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
      case 'approved':
        return { 
          icon: CheckCircleIcon, 
          color: 'text-green-600 bg-green-100',
          label: 'Approved'
        };
      case 'rejected':
        return { 
          icon: XCircleIcon, 
          color: 'text-red-600 bg-red-100',
          label: 'Rejected'
        };
      default:
        return { 
          icon: ClockIcon, 
          color: 'text-gray-600 bg-gray-100',
          label: 'Unknown'
        };
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.5) return 'text-green-600';
    if (score < -0.1) return 'text-red-600';
    return 'text-yellow-600';
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || review.status === statusFilter;
    const matchesPending = !showPendingOnly || review.status === 'pending';
    
    return matchesSearch && matchesFilter && matchesPending;
  });

  const ReviewCard = ({ review }: { review: Review }) => {
    const statusInfo = getStatusInfo(review.status);
    const StatusIcon = statusInfo.icon;
    
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const renderStars = (rating: number) => {
      return (
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
      );
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end mb-2">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {review.rating}/5
                </span>
              </div>
              <div className={`text-sm font-medium ${getSentimentColor(review.sentimentScore)}`}>
                Sentiment: {(review.sentimentScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">{review.guestName}</p>
              <p className="text-sm text-gray-500">{review.propertyName}</p>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
              {review.helpfulCount > 0 && (
                <span className="ml-3">
                  👍 {review.helpfulCount} helpful
                </span>
              )}
            </div>
          </div>

          {/* Photos */}
          {review.photos && review.photos.length > 0 && (
            <div className="mb-4">
              <div className="flex space-x-2">
                {review.photos.slice(0, 3).map((photo, index) => (
                  <img 
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ))}
                {review.photos.length > 3 && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-500">+{review.photos.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Response */}
          {review.response && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <ReplyIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Owner Response</span>
              </div>
              <p className="text-blue-700 text-sm">{review.response}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {review.status === 'pending' && (
                <>
                  <button 
                    onClick={() => moderateReview(review.id, 'approve')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => moderateReview(review.id, 'reject')}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Reject
                  </button>
                </>
              )}
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                Respond
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                <FlagIcon className="h-4 w-4" />
              </button>
            </div>
            
            {review.status === 'approved' && (
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Edit Response
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const moderateReview = async (reviewId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          action: 'moderate',
          action: action,
          moderatorId: 'admin_user'
        })
      });
      
      if (response.ok) {
        fetchReviews(); // Refresh the list
      }
    } catch (error) {
      console.error('Error moderating review:', error);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
              <p className="mt-1 text-gray-600">Manage guest reviews and feedback</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Export Reviews
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Reviews', value: reviews.length, color: 'blue' },
            { label: 'Pending Approval', value: reviews.filter(r => r.status === 'pending').length, color: 'yellow' },
            { label: 'Average Rating', value: (reviews.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.rating, 0) / reviews.filter(r => r.status === 'approved').length || 0).toFixed(1), color: 'green' },
            { label: 'Approval Rate', value: `${reviews.length > 0 ? Math.round((reviews.filter(r => r.status === 'approved').length / reviews.length) * 100) : 0}%`, color: 'purple' }
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
                placeholder="Search reviews..."
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pendingOnly"
                checked={showPendingOnly}
                onChange={(e) => setShowPendingOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="pendingOnly" className="ml-2 text-sm text-gray-700">
                Show pending only
              </label>
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
            Showing {filteredReviews.length} of {reviews.length} reviews
          </p>
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || showPendingOnly
                ? 'Try adjusting your search or filters' 
                : 'No reviews have been submitted yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}