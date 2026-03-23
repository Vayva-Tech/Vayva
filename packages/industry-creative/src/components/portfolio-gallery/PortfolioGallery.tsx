// @ts-nocheck
'use client';

import React from 'react';

export interface PortfolioGalleryProps {
  businessId: string;
  onViewItem?: (itemId: string) => void;
  onUploadItem?: () => void;
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  createdAt: Date;
}

export function PortfolioGallery({ businessId, onViewItem, onUploadItem }: PortfolioGalleryProps) {
  const items: PortfolioItem[] = [
    {
      id: '1',
      title: 'Brand Identity - TechCorp',
      category: 'Branding',
      thumbnail: '/placeholder-1.jpg',
      status: 'published',
      views: 1250,
      likes: 89,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Website Design - E-commerce',
      category: 'Web Design',
      thumbnail: '/placeholder-2.jpg',
      status: 'published',
      views: 890,
      likes: 67,
      createdAt: new Date('2024-01-10'),
    },
  ];

  return (
    <div className="portfolio-gallery max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Gallery</h2>
        <button
          onClick={onUploadItem}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          + Upload Work
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewItem?.(item.id)}
            className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">{item.category}</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{item.views.toLocaleString()} views</span>
                <span>❤️ {item.likes}</span>
              </div>
              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
