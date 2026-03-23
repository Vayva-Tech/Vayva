// @ts-nocheck
'use client';

import React, { useState } from 'react';

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export interface SortableTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onSort?: (config: SortConfig<T>) => void;
  className?: string;
}

export function SortableTable<T>({
  columns,
  data,
  onSort,
  className = '',
}: SortableTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    
    if (onSort) {
      onSort(newSortConfig);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const getSortIcon = (columnKey: keyof T) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className={`overflow-hidden rounded-lg shadow ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.title}
                  {column.sortable && (
                    <span className="ml-1">
                      {getSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render 
                    ? column.render(record[column.key], record, index)
                    : String(record[column.key])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}