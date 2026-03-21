// @ts-nocheck
"use client";

import { Card, Badge, Button, cn } from "@vayva/ui";

interface Stylist {
  id: string;
  name: string;
  role: string;
  status: "busy" | "available" | "off_duty";
  currentClient?: {
    name: string;
    service: string;
    endTime: number;
  };
  nextAppointment?: {
    time: string;
    serviceName: string;
    customerName: string;
  };
  revenueToday?: number;
}

interface StylistAvailabilityProps {
  stylists: Stylist[];
  summary: {
    total: number;
    busy: number;
    available: number;
  };
  stationStatus: {
    busy: number;
    free: number;
    soon: number;
  };
  topPerformer?: {
    name: string;
    revenue: number;
  };
  utilization?: number;
  isLoading?: boolean;
}

export function StylistAvailability({
  stylists,
  summary,
  stationStatus,
  topPerformer,
  utilization = 0,
  isLoading = false,
}: StylistAvailabilityProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "busy":
        return "bg-orange-500";
      case "available":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "busy":
        return (
          <Badge variant="warning" className="bg-orange-500/20 text-amber-300 border-amber-500/30">
            In Service
          </Badge>
        );
      case "available":
        return (
          <Badge variant="success" className="bg-green-500/20 text-green-300 border-green-500/30">
            Available
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-500/30">
            Off Duty
          </Badge>
        );
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className="glass-panel p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Stylist Availability</h3>
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
          View All Stylists
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Station Status Summary */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Station Status:</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="text-white">{stationStatus.busy} Busy</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-white">{stationStatus.free} Free</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                <span className="text-white">{stationStatus.soon} Soon</span>
              </span>
            </div>
          </div>

          {/* Stylist List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {stylists.map((stylist) => (
              <div
                key={stylist.id}
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{stylist.name}</span>
                      {getStatusBadge(stylist.status)}
                    </div>
                    <p className="text-gray-500 text-sm">{stylist.role}</p>
                  </div>
                </div>

                {stylist.currentClient && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-500">
                      Client: <span className="text-white">{stylist.currentClient.name}</span>
                    </p>
                    <p className="text-gray-500">
                      Service: <span className="text-white">{stylist.currentClient.service}</span>
                    </p>
                    <p className="text-gray-500">
                      Until: <span className="text-white">{formatTime(stylist.currentClient.endTime)}</span>
                    </p>
                  </div>
                )}

                {stylist.nextAppointment && !stylist.currentClient && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-500">
                      Next: <span className="text-white">{stylist.nextAppointment.customerName}</span>
                    </p>
                    <p className="text-gray-500">
                      {stylist.nextAppointment.serviceName} at{" "}
                      <span className="text-white">{stylist.nextAppointment.time}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Utilization:</span>
              <span className="text-white font-medium">{Math.round(utilization)}%</span>
            </div>
            
            {topPerformer && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500">Top Performer Today:</span>
                <span className="text-red-400 font-medium">
                  {topPerformer.name}: ${topPerformer.revenue.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
