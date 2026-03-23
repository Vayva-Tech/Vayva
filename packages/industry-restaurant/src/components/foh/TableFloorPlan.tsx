// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { TableManagementService, type Table } from '../../services';
import { Card, CardContent, CardHeader, CardTitle , Badge } from '@vayva/ui';
import { 
  Grid3X3,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Coffee
} from 'lucide-react';

interface TableFloorPlanProps {
  tableService: TableManagementService;
}

export function TableFloorPlan({ tableService }: TableFloorPlanProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('all');

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tableData = await tableService.getAllTables();
        setTables(tableData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch tables:', error);
        setLoading(false);
      }
    };

    fetchTables();
    // Poll for updates every 15 seconds
    const interval = setInterval(fetchTables, 15000);
    return () => clearInterval(interval);
  }, [tableService]);

  const getTableStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'reserved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'occupied':
        return <Users className="h-4 w-4" />;
      case 'reserved':
        return <Clock className="h-4 w-4" />;
      case 'cleaning':
        return <Coffee className="h-4 w-4" />;
      case 'maintenance':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Grid3X3 className="h-4 w-4" />;
    }
  };

  const filteredTables = selectedZone === 'all' 
    ? tables 
    : tables.filter(table => table.zone === selectedZone);

  const zones = [...new Set(tables.map(table => table.zone))].filter(Boolean);

  const getStatusCounts = () => {
    const counts = {
      available: 0,
      occupied: 0,
      reserved: 0,
      cleaning: 0,
      maintenance: 0
    };
    
    tables.forEach(table => {
      const status = table.status.toLowerCase();
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl border border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Grid3X3 className="h-5 w-5" />
            Table Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-orange-100 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-orange-50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl border border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Grid3X3 className="h-5 w-5" />
          Table Status
        </CardTitle>
        
        {/* Zone Filter */}
        {zones.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setSelectedZone('all')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedZone === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              All Zones
            </button>
            {zones.map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedZone === zone
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Status Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-700">Available ({statusCounts.available})</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-red-700">Occupied ({statusCounts.occupied})</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-blue-700">Reserved ({statusCounts.reserved})</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-yellow-700">Cleaning ({statusCounts.cleaning})</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-xs text-gray-700">Maintenance ({statusCounts.maintenance})</span>
          </div>
        </div>

        {/* Table Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {filteredTables.map(table => (
            <div
              key={table.id}
              className={`
                aspect-square flex flex-col items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all hover:scale-105
                ${getTableStatusColor(table.status)}
                ${table.status.toLowerCase() === 'occupied' ? 'hover:border-red-500' : ''}
                ${table.status.toLowerCase() === 'available' ? 'hover:border-green-500' : ''}
              `}
              onClick={() => console.log('Table clicked:', table)}
            >
              {/* Table Number */}
              <div className="text-lg font-bold text-current">
                {table.tableNumber}
              </div>
              
              {/* Capacity */}
              <div className="text-xs text-current mt-1">
                {table.capacity} seats
              </div>
              
              {/* Status Icon */}
              <div className="mt-1">
                {getTableStatusIcon(table.status)}
              </div>
              
              {/* Occupancy Indicator */}
              {table.status.toLowerCase() === 'occupied' && table.currentOccupancy && (
                <div className="text-xs text-current mt-1">
                  {table.currentOccupancy}/{table.capacity}
                </div>
              )}
              
              {/* Zone Badge */}
              {table.zone && (
                <Badge variant="secondary" className="mt-1 text-[8px] px-1 py-0 bg-white/50">
                  {table.zone}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
            <Grid3X3 className="h-12 w-12 mb-4 text-gray-300" />
            <p className="font-medium">No tables found</p>
            <p className="text-sm">Try selecting a different zone</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}