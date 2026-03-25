import React from 'react';
import { TrophyIcon, SparklesIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';

interface LuxuryBadgeProps {
  level: 'silver' | 'gold' | 'platinum' | 'diamond';
  className?: string;
  showIcon?: boolean;
}

export const LuxuryBadge: React.FC<LuxuryBadgeProps> = ({
  level,
  className = '',
  showIcon = true
}) => {
  const levelConfig = {
    silver: {
      bg: 'bg-gray-100 text-gray-800 border-gray-300',
      label: 'Silver Member'
    },
    gold: {
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      label: 'Gold Member'
    },
    platinum: {
      bg: 'bg-blue-100 text-blue-800 border-blue-300',
      label: 'Platinum Member'
    },
    diamond: {
      bg: 'bg-purple-100 text-purple-800 border-purple-300',
      label: 'Diamond Member'
    }
  };

  const config = levelConfig[level];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}>
      {showIcon && <TrophyIcon className="h-3 w-3 mr-1" />}
      {config.label}
    </span>
  );
};

interface VIPStatusBadgeProps {
  status: 'bronze' | 'silver' | 'gold' | 'platinum';
  className?: string;
}

export const VIPStatusBadge: React.FC<VIPStatusBadgeProps> = ({
  status,
  className = ''
}) => {
  const statusConfig = {
    bronze: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: StarIcon,
      label: 'Bronze VIP'
    },
    silver: {
      bg: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: StarIcon,
      label: 'Silver VIP'
    },
    gold: {
      bg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: StarIcon,
      label: 'Gold VIP'
    },
    platinum: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: TrophyIcon,
      label: 'Platinum VIP'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${className}`}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

interface ExperienceCardProps {
  title: string;
  category: string;
  price: number;
  duration: number;
  rating: number;
  image?: string;
  featured?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  category,
  price,
  duration,
  rating,
  image,
  featured = false,
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
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <SparklesIcon className="h-12 w-12 text-amber-600" />
          </div>
        )}
        {featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
              <SparklesIcon className="h-3 w-3 mr-1" />
              Featured
            </span>
          </div>
        )}
        <div className="absolute bottom-3 right-3">
          <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-2 py-1">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {category}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span>{duration} mins</span>
          <span className="font-semibold text-amber-600">${price}</span>
        </div>
      </div>
    </div>
  );
};

interface GuestProfileCardProps {
  firstName: string;
  lastName: string;
  email: string;
  membershipLevel: string;
  vipStatus: string;
  totalStays: number;
  totalSpent: number;
  avatar?: string;
  onClick?: () => void;
  className?: string;
}

export const GuestProfileCard: React.FC<GuestProfileCardProps> = ({
  firstName,
  lastName,
  email,
  membershipLevel,
  vipStatus,
  totalStays,
  totalSpent,
  avatar,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {avatar ? (
          <img 
            src={avatar} 
            alt={`${firstName} ${lastName}`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-amber-800 font-medium">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              {firstName} {lastName}
            </h3>
            <LuxuryBadge level={membershipLevel as any} />
            <VIPStatusBadge status={vipStatus as any} />
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{email}</p>
          
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span>{totalStays} stays</span>
            <span>${totalSpent.toLocaleString()} spent</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm font-medium text-gray-700">{totalStays}</span>
          </div>
          <span className="text-xs text-gray-500">Total Stays</span>
        </div>
      </div>
    </div>
  );
};