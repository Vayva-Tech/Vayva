"use client";
import { Button } from "@vayva/ui";

import React from "react";
import { Ticket, Clock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Sale {
  id: string;
  customerName: string;
  ticketType: string;
  price: number;
  minutesAgo: number;
  checkedIn: boolean;
}

interface LiveTicketSalesProps {
  data?: {
    sales?: Sale[];
    summary?: {
      todayRevenue: number;
      todayTickets: number;
      salesVelocity: number;
      peakVelocity: number;
    };
    breakdown?: {
      vip: number;
      general: number;
      earlyBird: number;
      group: number;
    };
  };
  dashboardData?: any;
}

export function LiveTicketSales({ data, dashboardData }: LiveTicketSalesProps) {
  if (!data) return null;

  const { sales = [], summary, breakdown } = data;

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Live Ticket Sales
        </h3>
      </div>

      {/* Today's Summary */}
      {summary && (
        <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-red-50 border-2 border-black rounded-lg">
          <p className="text-sm font-bold text-gray-700">
            Today's Sales:{" "}
            <span className="text-pink-600 font-black">
              {formatCurrency(summary.todayRevenue)} ({summary.todayTickets} tickets)
            </span>
          </p>
        </div>
      )}

      {/* Last 5 Sales */}
      <div className="space-y-3 mb-4">
        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">
          🎫 Last Sales (Live Feed)
        </h4>
        
        {sales.slice(0, 5).map((sale) => (
          <div key={sale.id} className="flex items-start justify-between p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <div>
              <p className="font-bold text-gray-900">{sale.customerName}</p>
              <p className="text-xs text-gray-600">{sale.ticketType} - {formatCurrency(sale.price)}</p>
              <p className="text-xs text-gray-500 mt-1">{sale.minutesAgo} min ago</p>
            </div>
            <div className="flex items-center gap-2">
              {sale.checkedIn ? (
                <span className="text-xs font-bold text-green-700">✓ Checked in</span>
              ) : (
                <Button className="text-xs font-bold text-pink-600 hover:underline">Check-in</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Type Breakdown */}
      {breakdown && (
        <div className="space-y-2">
          <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">
            Ticket Type Breakdown
          </h4>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">VIP ({breakdown.vip})</span>
              <div className="flex-1 mx-2 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-red-500 h-3 rounded-full border border-black"
                  style={{ width: `${(breakdown.vip / (breakdown.vip + breakdown.general + breakdown.earlyBird)) * 100}%` }}
                />
              </div>
              <span className="font-bold text-gray-900">
                {Math.round((breakdown.vip / (breakdown.vip + breakdown.general + breakdown.earlyBird)) * 100)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">General ({breakdown.general})</span>
              <div className="flex-1 mx-2 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full border border-black"
                  style={{ width: `${(breakdown.general / (breakdown.vip + breakdown.general + breakdown.earlyBird)) * 100}%` }}
                />
              </div>
              <span className="font-bold text-gray-900">
                {Math.round((breakdown.general / (breakdown.vip + breakdown.general + breakdown.earlyBird)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

