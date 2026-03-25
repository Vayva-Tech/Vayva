"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@vayva/ui";
import { toast } from "sonner";
import { GridFour as Grid, Plus, Eye, TrendUp as TrendingUp } from "@phosphor-icons/react";
import type { Table } from "@/types/nightlife";
import { apiJson } from "@/lib/api-client-shared";

export function TableReservations() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ revenueToday?: number; totalRevenue?: number } | null>(null);

  useEffect(() => {
    void loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const venueId = "venue_123";
      const data = await apiJson<{
        tables: Table[];
        stats?: { revenueToday?: number; totalRevenue?: number };
      }>(`/api/nightlife/tables/status?venueId=${venueId}`);
      
      if (data?.tables) {
        setTables(data.tables);
        setStats(data.stats || null);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      console.error("[LOAD_TABLES_ERROR]", _errMsg);
      toast.error("Failed to load table reservations");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'reserved': return 'bg-yellow-500';
      case 'occupied': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-6 bg-[#252525] border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Table Reservations</h3>
          <p className="text-sm text-gray-500">Main Room Floor Plan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye size={16} className="mr-2" />
            View Map
          </Button>
          <Button size="sm">
            <Plus size={16} className="mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      {/* Floor Plan Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4 p-4 bg-[#1A1A1A] rounded-lg">
        {tables.slice(0, 16).map((table) => (
          <div
            key={table.id}
            className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
              table.status === 'occupied' 
                ? 'bg-red-500/20 border-red-500 hover:border-red-400' 
                : table.status === 'reserved'
                ? 'bg-yellow-500/20 border-yellow-500 hover:border-yellow-400'
                : 'bg-green-500/20 border-green-500 hover:border-green-400'
            }`}
          >
            <div className="text-xs font-bold text-gray-900">{table.tableNumber}</div>
            <div className="text-xs text-gray-500">{table.capacity} guests</div>
            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getStatusColor(table.status)}`} />
          </div>
        ))}
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Available ({tables.filter(t => t.status === 'available').length})
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            Reserved ({tables.filter(t => t.status === 'reserved').length})
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Occupied ({tables.filter(t => t.status === 'occupied').length})
          </div>
        </div>
        {stats && (
          <div className="text-gray-900 font-medium">
            Revenue: ₦{stats.revenueToday?.toLocaleString() || 0}
          </div>
        )}
      </div>
    </Card>
  );
}
