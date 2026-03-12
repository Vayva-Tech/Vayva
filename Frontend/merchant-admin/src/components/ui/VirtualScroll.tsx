'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualScrollProps<T> {
  data: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // Number of items to render above/below viewport
}

/**
 * Virtual scroll component for rendering large lists efficiently
 * Only renders visible items + overscan buffer
 */
export function VirtualScroll<T>({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = data.length * itemHeight;
  
  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    data.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = data.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              role="listitem"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    width?: string | number;
    render?: (item: T) => React.ReactNode;
  }>;
  containerHeight?: number;
  rowHeight?: number;
  className?: string;
}

/**
 * Virtual table component for large datasets
 */
export function VirtualTable<T>({
  data,
  columns,
  containerHeight = 400,
  rowHeight = 48,
  className = '',
}: VirtualTableProps<T>) {
  return (
    <div className={`bg-background-secondary rounded-xl border border-border/40 ${className}`}>
      {/* Table Header */}
      <div className="grid grid-flow-col auto-cols-fr gap-px bg-border/20 p-px">
        {columns.map((column) => (
          <div
            key={column.key}
            className="bg-background-tertiary px-4 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider"
            style={{ width: column.width }}
          >
            {column.label}
          </div>
        ))}
      </div>

      {/* Virtual Scroll Body */}
      <VirtualScroll
        data={data}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        overscan={10}
        renderItem={(item, index) => (
          <div className="grid grid-flow-col auto-cols-fr gap-px bg-border/20 p-px hover:bg-accent-primary/5 transition-colors">
            {columns.map((column) => (
              <div
                key={column.key}
                className="px-4 py-3 text-sm text-text-secondary flex items-center"
                style={{ width: column.width }}
              >
                {column.render ? column.render(item) : (item as any)[column.key]}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}
