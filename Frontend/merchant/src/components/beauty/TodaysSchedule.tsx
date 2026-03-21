// @ts-nocheck
"use client";

import { Card, Badge, Button } from "@vayva/ui";

interface Appointment {
  time: string;
  station: number;
  stylist?: string;
  service?: string;
  status: "in-progress" | "upcoming" | "available";
  customerName?: string;
}

interface TodaysScheduleProps {
  appointments?: number;
  currentClients?: number;
  walkins?: number;
  noShows?: number;
  isLoading?: boolean;
}

export function TodaysSchedule({
  appointments = 0,
  currentClients = 0,
  walkins = 0,
  noShows = 0,
  isLoading = false,
}: TodaysScheduleProps) {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const sampleAppointments: Appointment[] = [
    {
      time: "10:00 AM",
      station: 1,
      stylist: "Maria",
      service: "Haircut & Style",
      status: "in-progress",
      customerName: "Emma W.",
    },
    {
      time: "10:00 AM",
      station: 2,
      status: "available",
    },
    {
      time: "10:30 AM",
      station: 1,
      status: "upcoming",
    },
    {
      time: "10:30 AM",
      station: 2,
      stylist: "James",
      service: "Beard Trim",
      status: "upcoming",
    },
  ];

  return (
    <Card className="glass-panel p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs glass-button">
            Add Walk-in
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 text-xs">
            Manage Schedule
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-sm text-red-300">
              Current Time: <span className="font-medium">{currentTime}</span>
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {sampleAppointments.map((apt, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        apt.status === "in-progress"
                          ? "bg-orange-500"
                          : apt.status === "upcoming"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <div>
                      <p className="text-white font-medium text-sm">
                        {apt.time} {apt.stylist && `- ${apt.stylist}`}
                      </p>
                      {apt.service && (
                        <p className="text-gray-500 text-xs">{apt.service}</p>
                      )}
                    </div>
                  </div>
                  {apt.customerName && (
                    <Badge variant="secondary" className="bg-white/10 text-white text-xs">
                      {apt.customerName}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-gray-500 text-sm mb-1">Walk-ins Today:</p>
              <p className="text-white font-semibold">{walkins}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">No-shows:</p>
              <p className="text-white font-semibold">{noShows}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Rebooked:</p>
              <p className="text-white font-semibold">12</p>
            </div>
            <div className="col-span-2">
              <Button variant="outline" size="sm" className="w-full glass-button text-xs">
                View Full Schedule
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
