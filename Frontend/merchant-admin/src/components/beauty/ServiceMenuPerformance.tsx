"use client";

import { Card, Button } from "@vayva/ui";

interface ServicePerformance {
  id: string;
  name: string;
  bookingsToday: number;
  revenueToday: number;
  avgDuration: number;
}

interface ServiceMenuPerformanceProps {
  topServices?: ServicePerformance[];
  categoryBreakdown?: Record<string, any>;
  isLoading?: boolean;
}

export function ServiceMenuPerformance({
  topServices = [],
  categoryBreakdown = {},
  isLoading = false,
}: ServiceMenuPerformanceProps) {
  const sampleServices: ServicePerformance[] = [
    {
      id: "1",
      name: "Balayage Highlights",
      bookingsToday: 8,
      revenueToday: 1240,
      avgDuration: 150,
    },
    {
      id: "2",
      name: "Gel Manicure",
      bookingsToday: 6,
      revenueToday: 420,
      avgDuration: 45,
    },
    {
      id: "3",
      name: "Keratin Treatment",
      bookingsToday: 5,
      revenueToday: 875,
      avgDuration: 120,
    },
  ];

  const services = topServices.length > 0 ? topServices : sampleServices;

  return (
    <Card className="glass-panel p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Service Menu Performance</h3>
        <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300">
          View All Services
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {services.slice(0, 4).map((service, idx) => (
            <div key={service.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium text-sm">
                  {idx + 1}. {service.name}
                </span>
                <span className="text-text-secondary text-xs">
                  {service.bookingsToday} done
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-rose-400 to-pink-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (service.bookingsToday / 10) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Revenue:</span>
                <span className="text-rose-400 font-medium">${service.revenueToday}</span>
              </div>
            </div>
          ))}

          {/* Category Breakdown */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-text-secondary text-sm mb-2">Service Categories:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(categoryBreakdown).length > 0 ? (
                Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => (
                  <Badge key={category} variant="secondary" className="bg-white/10 text-white text-xs">
                    {category} ({data.count})
                  </Badge>
                ))
              ) : (
                <>
                  <Badge variant="secondary" className="bg-white/10 text-white text-xs">Hair (18)</Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white text-xs">Nails (12)</Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white text-xs">Spa (8)</Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white text-xs">Makeup (10)</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
