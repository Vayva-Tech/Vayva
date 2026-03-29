/**
 * Asset Library - Digital Asset Management (DAM)
 */

import React, { useState } from 'react';

export interface DigitalAsset {
  id: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'FONT' | 'RAW';
  url: string;
  thumbnailUrl?: string;
  size: number; // bytes
  dimensions?: { width: number; height: number };
  duration?: number; // seconds for video/audio
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  projectId?: string;
  folderId?: string;
}

export interface AssetFolder {
  id: string;
  name: string;
  parentId?: string;
  assetCount: number;
}

interface AssetLibraryProps {
  assets: DigitalAsset[];
  folders?: AssetFolder[];
  onUpload?: (files: File[]) => void;
  onDownload?: (assetId: string) => void;
  onDelete?: (assetId: string) => void;
  onTag?: (assetId: string, tag: string) => void;
}

export function AssetLibrary({ 
  assets, 
  folders = [],
  onUpload, 
  onDownload, 
  onDelete,
  onTag 
}: AssetLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder === 'ALL' || asset.folderId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      try {
        await onUpload?.(Array.from(e.target.files));
      } finally {
        setUploading(false);
      }
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Asset Library</h3>
          <p className="text-sm text-gray-600 mt-1">{filteredAssets.length} assets</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 w-full md:w-64"
          />

          {/* Folder Filter */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Folders</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-2 ${viewMode === 'GRID' ? 'bg-purple-100 text-purple-700' : 'bg-white hover:bg-gray-50'}`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-2 ${viewMode === 'LIST' ? 'bg-purple-100 text-purple-700' : 'bg-white hover:bg-gray-50'}`}
            >
              ☰
            </button>
          </div>

          {/* Upload Button */}
          <label className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAssets.size > 0 && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-purple-700 font-medium">
            {selectedAssets.size} asset(s) selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50">
              Download All
            </button>
            <button className="px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200">
              Delete All
            </button>
          </div>
        </div>
      )}

      {/* Asset Grid/List */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => toggleAssetSelection(asset.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-100">
                {asset.thumbnailUrl ? (
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-400 text-4xl">
                    {asset.type === 'IMAGE' ? '🖼️' :
                     asset.type === 'VIDEO' ? '🎬' :
                     asset.type === 'DOCUMENT' ? '📄' :
                     asset.type === 'AUDIO' ? '🎵' :
                     asset.type === 'FONT' ? 'Aa' : '📦'}
                  </div>
                )}
              </div>

              {/* Selection Overlay */}
              <div className={`absolute inset-0 bg-purple-500 bg-opacity-20 transition-opacity ${
                selectedAssets.has(asset.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    checked={selectedAssets.has(asset.id)}
                    onChange={() => toggleAssetSelection(asset.id)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h4 className="font-medium text-sm text-gray-900 truncate">{asset.name}</h4>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                  <span>{formatFileSize(asset.size)}</span>
                  {asset.duration && <span>{formatDuration(asset.duration)}</span>}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {asset.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50" scope="col">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Uploaded</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Tags</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAssets.has(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-medium text-gray-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{asset.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(asset.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(asset.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onDownload?.(asset.id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => onDelete?.(asset.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No assets found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
