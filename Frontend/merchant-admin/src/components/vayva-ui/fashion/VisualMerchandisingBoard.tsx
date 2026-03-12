'use client';

import React, { useState } from 'react';
import { VayvaCard, VayvaCardHeader, VayvaCardTitle, VayvaCardContent } from './VayvaCard';
import { VayvaButton } from './VayvaButton';
import { cn } from '@/lib/utils';

interface CollectionItem {
  id: string;
  name: string;
  image: string;
  category: string;
  performance: 'trending' | 'stable' | 'declining';
  revenue: number;
  unitsSold: number;
}

interface VisualMerchandisingBoardProps {
  items: CollectionItem[];
  className?: string;
  onReorder?: (items: CollectionItem[]) => void;
}

/**
 * Fashion Visual Merchandising Board
 * Drag-and-drop product showcase with performance metrics
 */
export const VisualMerchandisingBoard: React.FC<VisualMerchandisingBoardProps> = ({
  items,
  className,
  onReorder,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'trending': return '#10B981';
      case 'stable': return '#F59E0B';
      case 'declining': return '#EF4444';
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedId || draggedId === targetId) return;
    
    const newItems = [...items];
    const draggedIndex = newItems.findIndex(item => item.id === draggedId);
    const targetIndex = newItems.findIndex(item => item.id === targetId);
    
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    
    setDraggedId(null);
    onReorder?.(newItems);
  };

  return (
    <VayvaCard variant="glass" className={cn('p-6', className)}>
      <VayvaCardHeader>
        <VayvaCardTitle>Visual Merchandising</VayvaCardTitle>
        <div className="text-sm text-gray-500">Drag to reorder featured products</div>
      </VayvaCardHeader>
      
      <VayvaCardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              className={cn(
                'group relative bg-white rounded-xl overflow-hidden cursor-move',
                'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                draggedId === item.id && 'opacity-50 scale-95'
              )}
            >
              {/* Product Image */}
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
                />
              </div>
              
              {/* Performance Badge */}
              <div 
                className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getPerformanceColor(item.performance) }}
              >
                {item.performance === 'trending' ? '🔥 Trending' : item.performance === 'stable' ? '✓ Stable' : '↓ Declining'}
              </div>
              
              {/* Product Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                <p className="text-white/80 text-xs">{item.category}</p>
              </div>
              
              {/* Quick Stats on Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <div className="text-2xl font-bold">${item.revenue.toLocaleString()}</div>
                  <div className="text-xs opacity-80">Revenue</div>
                  <div className="text-sm mt-2">{item.unitsSold} units sold</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <VayvaButton variant="ghost" size="sm">
            Reset Order
          </VayvaButton>
          <VayvaButton variant="primary" size="sm">
            Save Arrangement
          </VayvaButton>
        </div>
      </VayvaCardContent>
    </VayvaCard>
  );
};
