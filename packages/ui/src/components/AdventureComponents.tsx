import React from 'react';
import { MountainIcon, MapIcon, UsersIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface DifficultyBadgeProps {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  level,
  className = ''
}) => {
  const levelConfig = {
    beginner: {
      bg: 'bg-green-100 text-green-800 border-green-300',
      label: 'Beginner'
    },
    intermediate: {
      bg: 'bg-blue-100 text-blue-800 border-blue-300',
      label: 'Intermediate'
    },
    advanced: {
      bg: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: 'Advanced'
    },
    expert: {
      bg: 'bg-red-100 text-red-800 border-red-300',
      label: 'Expert'
    }
  };

  const config = levelConfig[level];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}>
      <MountainIcon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

interface AdventureTourCardProps {
  title: string;
  destination: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  price: number;
  participants: { current: number; max: number };
  rating: number;
  image?: string;
  highlights: string[];
  onClick?: () => void;
  className?: string;
}

export const AdventureTourCard: React.FC<AdventureTourCardProps> = ({
  title,
  destination,
  difficulty,
  duration,
  price,
  participants,
  rating,
  image,
  highlights,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="relative">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <MountainIcon className="h-16 w-16 text-green-600" />
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <DifficultyBadge level={difficulty} />
        </div>
        
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
            <MapIcon className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-gray-700">{destination}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="ml-1 text-sm font-medium text-gray-700">
              {rating}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center text-gray-600">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{duration} days</span>
          </div>
          <div className="flex items-center text-gray-600">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>{participants.current}/{participants.max}</span>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center text-sm font-semibold text-green-600">
            <span>${price}</span>
            <span className="text-gray-500 text-xs ml-1">per person</span>
          </div>
        </div>
        
        {highlights.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Highlights:</p>
            <div className="flex flex-wrap gap-1">
              {highlights.slice(0, 2).map((highlight, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700"
                >
                  {highlight}
                </span>
              ))}
              {highlights.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{highlights.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
};

interface SafetyIndicatorProps {
  safetyScore: number;
  incidentRate: number;
  certifiedGuides: number;
  className?: string;
}

export const SafetyIndicator: React.FC<SafetyIndicatorProps> = ({
  safetyScore,
  incidentRate,
  certifiedGuides,
  className = ''
}) => {
  const getSafetyColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Safety Metrics</h4>
        <ShieldCheckIcon className={`h-5 w-5 ${getSafetyColor(safetyScore)}`} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Safety Score</span>
          <span className={`font-semibold ${getSafetyColor(safetyScore)}`}>
            {safetyScore}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Incident Rate</span>
          <span className="font-semibold text-gray-900">
            {incidentRate === 0 ? 'None' : `${incidentRate}/1000`}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Certified Guides</span>
          <span className="font-semibold text-green-600">{certifiedGuides}</span>
        </div>
      </div>
    </div>
  );
};

interface AdventureBookingSummaryProps {
  tourName: string;
  departureDate: string;
  participants: number;
  totalPrice: number;
  experienceLevel: string;
  gearIncluded: string[];
  className?: string;
}

export const AdventureBookingSummary: React.FC<AdventureBookingSummaryProps> = ({
  tourName,
  departureDate,
  participants,
  totalPrice,
  experienceLevel,
  gearIncluded,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <h3 className="font-semibold text-lg text-gray-900 mb-4">Booking Summary</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Tour</p>
          <p className="font-medium text-gray-900">{tourName}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Departure Date</p>
          <p className="font-medium text-gray-900">{formatDate(departureDate)}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Participants</p>
          <p className="font-medium text-gray-900">{participants} people</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Experience Level</p>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1)}
          </span>
        </div>
        
        {gearIncluded.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Gear Included</p>
            <div className="flex flex-wrap gap-1">
              {gearIncluded.map((item, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-green-600">${totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};