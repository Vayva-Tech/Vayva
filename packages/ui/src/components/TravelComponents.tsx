import React from 'react';
import { StarIcon, MapPinIcon, UsersIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  size = 'md',
  showCount = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className={`ml-2 ${textSize[size]} text-gray-600`}>
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
};

interface LocationDisplayProps {
  city: string;
  country: string;
  icon?: boolean;
  className?: string;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  city,
  country,
  icon = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center text-gray-600 ${className}`}>
      {icon && <MapPinIcon className="h-4 w-4 mr-1" />}
      <span>{city}, {country}</span>
    </div>
  );
};

interface GuestDisplayProps {
  adults: number;
  children?: number;
  icon?: boolean;
  className?: string;
}

export const GuestDisplay: React.FC<GuestDisplayProps> = ({
  adults,
  children = 0,
  icon = true,
  className = ''
}) => {
  const totalGuests = adults + children;
  
  return (
    <div className={`flex items-center text-gray-600 ${className}`}>
      {icon && <UsersIcon className="h-4 w-4 mr-1" />}
      <span>{totalGuests} guest{totalGuests > 1 ? 's' : ''}</span>
      {children > 0 && (
        <span className="ml-1 text-gray-500">
          ({adults} adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} child${children > 1 ? 'ren' : ''}` : ''})
        </span>
      )}
    </div>
  );
};

interface DateRangeDisplayProps {
  startDate: string;
  endDate: string;
  icon?: boolean;
  className?: string;
}

export const DateRangeDisplay: React.FC<DateRangeDisplayProps> = ({
  startDate,
  endDate,
  icon = true,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`flex items-center text-gray-600 ${className}`}>
      {icon && <CalendarIcon className="h-4 w-4 mr-1" />}
      <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
    </div>
  );
};

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  period?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  highlight?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  currency = 'USD',
  period = 'night',
  size = 'md',
  className = '',
  highlight = false
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const highlightClass = highlight 
    ? 'text-green-600 font-bold' 
    : 'text-gray-900 font-semibold';

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <span className={highlightClass}>
        {currency === 'USD' ? '$' : ''}{amount.toLocaleString()}
      </span>
      {period && (
        <span className="text-gray-500 text-sm ml-1">/{period}</span>
      )}
    </div>
  );
};