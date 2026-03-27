'use client';

import React, { CSSProperties, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';

export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Function to render each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Estimated height of each item in pixels (for calculations) */
  estimatedItemHeight?: number;
  /** Number of items to render above and below the visible area */
  overscan?: number;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: CSSProperties;
  /** Whether to enable virtual scrolling */
  enabled?: boolean;
}

/**
 * VirtualList - A performant virtualized list component
 * 
 * Only renders visible items + a small buffer zone to maintain scroll position
 * Ideal for lists with 100+ items
 * 
 * @example
 * ```tsx
 * <VirtualList
 *   items={largeDataSet}
 *   estimatedItemHeight={60}
 *   overscan={5}
 *   renderItem={(item, index) => (
 *     <div key={item.id}>{item.name}</div>
 *   )}
 * />
 * ```
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimatedItemHeight = 50,
  overscan = 3,
  className = '',
  style,
  enabled = true,
}: VirtualListProps<T>): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate total height
  const totalHeight = items.length * estimatedItemHeight;

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / estimatedItemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / estimatedItemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * estimatedItemHeight;

  // Handle scroll events
  useEffect(() => {
    if (!containerRef.current || !enabled) return;

    const container = containerRef.current;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
      setContainerHeight(container.clientHeight);
    };

    // Initial measurement
    setContainerHeight(container.clientHeight);

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  // If not enabled or items are few, render all items without virtualization
  if (!enabled || items.length < 20) {
    return (
      <div ref={containerRef} className={className} style={style}>
        {items.map((item, index) => renderItem(item, index))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        height: totalHeight,
        position: 'relative',
        overflowY: 'auto',
        contain: 'strict',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          transform: `translateY(${offsetY}px)`,
          willChange: 'transform',
        }}
      >
        {visibleItems.map((item, index) => renderItem(item, startIndex + index))}
      </div>
    </div>
  );
}

export default VirtualList;
