/**
 * Grid System - Snapping and layout configuration for mount points
 */

export type GridSize = 'small' | 'medium' | 'large' | 'full';

export interface GridConfig {
  /** Number of columns */
  columns: number;
  /** Column gap in pixels */
  columnGap: number;
  /** Row gap in pixels */
  rowGap: number;
  /** Whether to snap to grid */
  snapToGrid: boolean;
  /** Grid cell size in pixels (for snapping) */
  cellSize: number;
}

export interface ResponsiveConfig {
  mobile: GridConfig;
  tablet: GridConfig;
  desktop: GridConfig;
}

export const DEFAULT_GRID_CONFIG: ResponsiveConfig = {
  mobile: {
    columns: 1,
    columnGap: 16,
    rowGap: 16,
    snapToGrid: true,
    cellSize: 60,
  },
  tablet: {
    columns: 2,
    columnGap: 20,
    rowGap: 20,
    snapToGrid: true,
    cellSize: 80,
  },
  desktop: {
    columns: 3,
    columnGap: 24,
    rowGap: 24,
    snapToGrid: true,
    cellSize: 100,
  },
};

/**
 * Calculate snap position for drag operations
 */
export function snapToGrid(
  x: number,
  y: number,
  config: GridConfig
): { x: number; y: number } {
  if (!config.snapToGrid) {
    return { x, y };
  }

  const snap = (value: number) =>
    Math.round(value / config.cellSize) * config.cellSize;

  return {
    x: snap(x),
    y: snap(y),
  };
}

/**
 * Calculate grid position from index
 */
export function getGridPosition(
  index: number,
  config: GridConfig
): { row: number; col: number } {
  return {
    row: Math.floor(index / config.columns),
    col: index % config.columns,
  };
}

/**
 * Sort items by their grid position (left-to-right, top-to-bottom)
 */
export function sortByGridPosition<T extends { priority: number }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => a.priority - b.priority);
}
