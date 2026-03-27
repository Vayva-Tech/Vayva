/**
 * Creative Dashboard - Portfolio Management System
 */

import React, { useState } from 'react';

export interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  thumbnail: string;
  category: 'BRANDING' | 'WEB_DESIGN' | 'PRINT' | 'VIDEO' | 'PHOTOGRAPHY';
  status: 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'PUBLISHED';
  featured: boolean;
  createdAt: string;
  metrics?: {
    views: number;
    likes: number;
    shares: number;
  };
}

interface PortfolioManagementProps {
  projects: PortfolioProject[];
  onToggleFeatured?: (projectId: string) => void;
  onPublish?: (projectId: string) => void;
}

export function PortfolioManagement({ 
  projects, 
  onToggleFeatured,
  onPublish 
}: PortfolioManagementProps) {
  const [filter, setFilter] = useState<'ALL' | string>('ALL');
  const [sortBy, setSortBy] = useState<'DATE' | 'VIEWS' | 'LIKES'>('DATE');

  const filteredProjects = projects.filter(project => {
    if (filter === 'ALL') return true;
    return project.category === filter || project.status === filter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'VIEWS':
        return (b.metrics?.views || 0) - (a.metrics?.views || 0);
      case 'LIKES':
        return (b.metrics?.likes || 0) - (a.metrics?.likes || 0);
      case 'DATE':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Portfolio Projects</h3>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Projects</option>
            <option value="BRANDING">Branding</option>
            <option value="WEB_DESIGN">Web Design</option>
            <option value="PRINT">Print</option>
            <option value="VIDEO">Video</option>
            <option value="PHOTOGRAPHY">Photography</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Drafts</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="DATE">Newest First</option>
            <option value="VIEWS">Most Views</option>
            <option value="LIKES">Most Likes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProjects.map((project) => (
          <div key={project.id} className="border rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-200">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {project.featured && (
                  <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-medium">
                    Featured
                  </span>
                )}
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  project.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                  project.status === 'REVIEW' ? 'bg-blue-100 text-blue-700' :
                  project.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">{project.title}</h4>
                <p className="text-sm text-gray-600">{project.client}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {project.category.replace('_', ' ')}
                </span>
              </div>

              {project.metrics && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>👁 {project.metrics.views.toLocaleString()}</span>
                  <span>❤️ {project.metrics.likes.toLocaleString()}</span>
                  <span>↗️ {project.metrics.shares.toLocaleString()}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onToggleFeatured?.(project.id)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    project.featured 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {project.featured ? '★ Featured' : '☆ Feature'}
                </button>
                {project.status !== 'PUBLISHED' && (
                  <button
                    onClick={() => onPublish?.(project.id)}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No projects found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
