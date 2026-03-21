// @ts-nocheck
'use client';

import React from 'react';
import { VayvaCard, VayvaCardHeader, VayvaCardTitle, VayvaCardContent } from '../VayvaCard';
import { cn } from '@/lib/utils';

interface KPIMetric {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'red' | 'yellow' | 'green' | 'blue';
}

/**
 * Restaurant Bold KPI Card
 * High-contrast, energetic design for front-of-house
 */
export const RestaurantKPICard: React.FC<KPIMetric & { className?: string }> = ({
  title,
  value,
  change,
  icon,
  color = 'red',
  className,
}) => {
  const colorClasses = {
    red: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30',
    green: 'bg-green-500 hover:bg-green-600 shadow-green/30',
    blue: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30',
  };

  const isPositive = change && change >= 0;

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl overflow-hidden',
        'border-2 border-black',
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        'transition-all duration-200',
        'hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        'active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        className
      )}
    >
      {/* Color accent bar */}
      <div className={cn('h-2 w-full', colorClasses[color].split(' ')[0])} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</div>
          {icon && (
            <div className={cn('p-2 rounded-lg', colorClasses[color])}>
              {React.cloneElement(icon as React.ReactElement, {
                className: 'w-5 h-5 text-white',
              })}
            </div>
          )}
        </div>
        
        <div className="text-3xl font-black text-gray-900 mb-2">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {change !== undefined && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-md text-xs font-bold',
                isPositive
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              )}
            >
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            <span className="text-xs text-gray-500 font-medium">vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Sales Ticker Component
 * Continuous scrolling sales data
 */
interface SalesTickerProps {
  transactions: Array<{
    id: string;
    amount: number;
    time: string;
    type: 'dine-in' | 'takeout' | 'delivery';
  }>;
}

export const SalesTicker: React.FC<SalesTickerProps> = ({ transactions }) => {
  return (
    <div className="bg-gray-900 text-white rounded-xl p-4 overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Sales</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-8 animate-marquee">
            {transactions.map((tx, index) => (
              <div key={`${tx.id}-${index}`} className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono text-lg font-bold text-green-400">
                  +${tx.amount.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400">{tx.time}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-bold uppercase',
                    tx.type === 'dine-in' && 'bg-blue-500/20 text-blue-400',
                    tx.type === 'takeout' && 'bg-yellow-500/20 text-yellow-400',
                    tx.type === 'delivery' && 'bg-green-500/20 text-green-400'
                  )}
                >
                  {tx.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Menu Item Performance Card
 */
interface MenuItem {
  name: string;
  category: string;
  orders: number;
  revenue: number;
  margin: number;
  trend: 'up' | 'down' | 'stable';
}

interface MenuItemCardProps {
  item: MenuItem;
  rank: number;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, rank }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getRankBadge(rank)}</span>
          <div>
            <h4 className="font-bold text-gray-900">{item.name}</h4>
            <p className="text-xs text-gray-500">{item.category}</p>
          </div>
        </div>
        <div
          className={cn(
            'px-2 py-1 rounded text-xs font-bold',
            item.trend === 'up' && 'bg-green-100 text-green-800',
            item.trend === 'down' && 'bg-red-100 text-red-800',
            item.trend === 'stable' && 'bg-gray-100 text-gray-800'
          )}
        >
          {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} Hot
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Orders</div>
          <div className="text-lg font-black text-gray-900">{item.orders}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Revenue</div>
          <div className="text-lg font-black text-gray-900">${item.revenue.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Margin</div>
          <div className="text-lg font-black text-gray-900">{item.margin}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">Performance</span>
          <span className="font-bold text-gray-700">{Math.min(item.orders, 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-300">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
            style={{ width: `${Math.min(item.orders, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Table Status Grid
 */
interface TableStatus {
  tableNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'dirty';
  guests?: number;
  server?: string;
  timeSeated?: string;
  checkTotal?: number;
}

interface TableGridProps {
  tables: TableStatus[];
  onTableClick?: (table: TableStatus) => void;
}

export const TableStatusGrid: React.FC<TableGridProps> = ({ tables, onTableClick }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'occupied':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'dirty':
        return 'bg-gray-200 border-gray-400 text-gray-800';
      default:
        return 'bg-white border-gray-300';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <button
          key={table.tableNumber}
          onClick={() => onTableClick?.(table)}
          className={cn(
            'p-4 rounded-xl border-2 transition-all duration-200',
            getStatusStyles(table.status),
            'hover:scale-105 hover:shadow-lg'
          )}
        >
          <div className="text-xs font-bold uppercase tracking-wide mb-2">
            Table {table.tableNumber}
          </div>
          <div className="text-2xl font-black mb-1">{table.status}</div>
          {table.guests && (
            <div className="text-sm font-medium">{table.guests} guests</div>
          )}
          {table.timeSeated && (
            <div className="text-xs mt-1 opacity-75">{table.timeSeated}</div>
          )}
        </button>
      ))}
    </div>
  );
};
